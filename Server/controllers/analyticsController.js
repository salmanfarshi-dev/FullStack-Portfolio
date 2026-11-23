import mongoose from "mongoose";
import Analytics from "../models/Analytics.js";

const allowedEvents = [
  "page_view",
  "project_click",
  "resume_download",
  "contact_submit",
];

const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
};

// Detect Browser
const detectBrowser = (userAgent = "") => {
  if (/Edg/i.test(userAgent)) return "Edge";
  if (/Chrome/i.test(userAgent)) return "Chrome";
  if (/Firefox/i.test(userAgent)) return "Firefox";
  if (/Safari/i.test(userAgent)) return "Safari";

  return "unknown";
};

// Detect Device
const detectDevice = (userAgent = "") => {
  if (/iPad|Tablet/i.test(userAgent)) return "tablet";

  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    return "mobile";
  }

  if (userAgent) return "desktop";

  return "unknown";
};

// Detect Traffic Source
const detectSource = (referrer = "") => {
  if (!referrer) return "direct";

  try {
    const hostname = new URL(referrer).hostname.toLowerCase();

    if (/google|bing|yahoo|duckduckgo|baidu/i.test(hostname)) {
      return "search";
    }

    if (
      /facebook|instagram|linkedin|twitter|x\.com|youtube|tiktok/i.test(
        hostname,
      )
    ) {
      return "social";
    }

    return "referral";
  } catch {
    return "other";
  }
};

// Track Public Analytics Event
export const trackAnalyticsEvent = async (req, res) => {
  try {
    const { eventType, sessionId, page, projectId, projectTitle } = req.body;

    if (!allowedEvents.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analytics event type.",
      });
    }

    if (
      typeof sessionId !== "string" ||
      !/^[a-zA-Z0-9_-]{16,100}$/.test(sessionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid anonymous session ID is required.",
      });
    }

    if (page !== undefined && typeof page !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid page value.",
      });
    }

    if (eventType === "project_click" && !mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "A valid project ID is required.",
      });
    }

    const userAgent = req.get("user-agent") || "";
    const rawReferrer = req.get("referer") || "";

    let pagePath = "/";

    if (page) {
      try {
        pagePath = new URL(page, "https://portfolio.local").pathname;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid page URL.",
        });
      }
    }

    let referrer = "direct";

    if (rawReferrer) {
      try {
        referrer = new URL(rawReferrer).hostname;
      } catch {
        referrer = "other";
      }
    }

    const analyticsData = {
      eventType,
      sessionId,
      page: pagePath,
      referrer,
      source: detectSource(rawReferrer),
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
    };

    if (eventType === "project_click") {
      analyticsData.projectId = projectId;

      if (typeof projectTitle === "string") {
        analyticsData.projectTitle = projectTitle.trim().slice(0, 150);
      }
    }

    await Analytics.create(analyticsData);

    return res.status(201).json({
      success: true,
      message: "Analytics event recorded.",
    });
  } catch (error) {
    console.error("Track Analytics Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to record analytics event.",
    });
  }
};

// Get Analytics Overview (Admin)
export const getAnalyticsOverview = async (req, res) => {
  try {
    const requestedDays = Number(req.query.days || 30);
    const allowedDays = [7, 30, 90];

    if (!allowedDays.includes(requestedDays)) {
      return res.status(400).json({
        success: false,
        message: "Days must be 7, 30 or 90.",
      });
    }

    const { startDate, endDate } = getDateRange(requestedDays);

    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const pageViewFilter = {
      ...dateFilter,
      eventType: "page_view",
    };

    const [
      totalEvents,
      pageViews,
      uniqueVisitors,
      projectClicks,
      resumeDownloads,
      contactSubmissions,
      dailyStats,
      deviceStats,
      sourceStats,
      topProjects,
    ] = await Promise.all([
      Analytics.countDocuments(dateFilter),

      Analytics.countDocuments({
        ...dateFilter,
        eventType: "page_view",
      }),

      Analytics.distinct("sessionId", pageViewFilter),

      Analytics.countDocuments({
        ...dateFilter,
        eventType: "project_click",
      }),

      Analytics.countDocuments({
        ...dateFilter,
        eventType: "resume_download",
      }),

      Analytics.countDocuments({
        ...dateFilter,
        eventType: "contact_submit",
      }),

      Analytics.aggregate([
        { $match: pageViewFilter },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              sessionId: "$sessionId",
            },
            views: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            visitors: { $sum: 1 },
            pageViews: { $sum: "$views" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Analytics.aggregate([
        { $match: pageViewFilter },
        {
          $group: {
            _id: "$device",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Analytics.aggregate([
        { $match: pageViewFilter },
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Analytics.aggregate([
        {
          $match: {
            ...dateFilter,
            eventType: "project_click",
          },
        },
        {
          $group: {
            _id: "$projectId",
            title: { $first: "$projectTitle" },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { clicks: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      period: {
        days: requestedDays,
        startDate,
        endDate,
      },
      overview: {
        totalEvents,
        totalVisitors: uniqueVisitors.length,
        pageViews,
        projectClicks,
        resumeDownloads,
        contactSubmissions,
      },
      dailyStats,
      deviceStats,
      sourceStats,
      topProjects,
    });
  } catch (error) {
    console.error("Analytics Overview Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics overview.",
    });
  }
};

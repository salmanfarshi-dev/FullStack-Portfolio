import mongoose from "mongoose";
import Newsletter from "../models/Newsletter.js";
import { createActivityLog } from "./activityLogController.js";

const isValidEmail = (email) => {
  return (
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
};

// Subscribe (Public)
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let subscriber = await Newsletter.findOne({
      email: normalizedEmail,
    });

    if (subscriber?.status === "subscribed") {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed.",
      });
    }

    if (subscriber) {
      subscriber.status = "subscribed";
      subscriber.subscribedAt = new Date();
      subscriber.unsubscribedAt = null;

      await subscriber.save();
    } else {
      subscriber = await Newsletter.create({
        email: normalizedEmail,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed to the newsletter.",
      subscriber: {
        id: subscriber._id,
        email: subscriber.email,
        status: subscriber.status,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed.",
      });
    }

    console.error("Newsletter Subscribe Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again.",
    });
  }
};

// Get All Subscribers (Admin)
export const getAllSubscribers = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );

    const filter = {};

    if (req.query.status) {
      if (!["subscribed", "unsubscribed"].includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription status.",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.search?.trim()) {
      filter.email = {
        $regex: req.query.search.trim().slice(0, 100),
        $options: "i",
      };
    }

    const total = await Newsletter.countDocuments(filter);

    const subscribers = await Newsletter.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      subscribers,
    });
  } catch (error) {
    console.error("Get Subscribers Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers.",
    });
  }
};

// Update Subscription Status (Admin)
export const updateSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber ID.",
      });
    }

    if (!["subscribed", "unsubscribed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription status.",
      });
    }

    const subscriber = await Newsletter.findById(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    subscriber.status = status;

    if (status === "subscribed") {
      subscriber.subscribedAt = new Date();
      subscriber.unsubscribedAt = null;
    } else {
      subscriber.unsubscribedAt = new Date();
    }

    await subscriber.save();
    await createActivityLog({ admin: req.admin, action: "newsletter_status_updated", module: "newsletter", description: `Changed newsletter subscription status for "${subscriber.email}" to ${status}.`, targetId: subscriber._id.toString(), targetName: subscriber.email, req });

    return res.status(200).json({
      success: true,
      message: "Subscription status updated successfully.",
      subscriber,
    });
  } catch (error) {
    console.error("Update Subscriber Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update subscriber.",
    });
  }
};

// Delete Subscriber (Admin)
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscriber ID.",
      });
    }

    const subscriber = await Newsletter.findByIdAndDelete(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found.",
      });
    }

    await createActivityLog({ admin: req.admin, action: "newsletter_subscriber_deleted", module: "newsletter", description: `Deleted newsletter subscriber "${subscriber.email}".`, targetId: subscriber._id.toString(), targetName: subscriber.email, req });

    return res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Subscriber Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete subscriber.",
    });
  }
};

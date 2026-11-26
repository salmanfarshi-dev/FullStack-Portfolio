import mongoose from "mongoose";
import Journey from "../models/Journey.js";
import { createActivityLog } from "./activityLogController.js";

const allowedFields = [
  "title",
  "organization",
  "description",
  "type",
  "startDate",
  "endDate",
  "isCurrent",
  "location",
  "icon",
  "isVisible",
  "displayOrder",
];

const allowedTypes = [
  "education",
  "experience",
  "learning",
  "achievement",
  "other",
];

// Get Public Journey
export const getPublicJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({ isVisible: true }).sort({
      displayOrder: 1,
      startDate: -1,
    });

    return res.status(200).json({
      success: true,
      total: journeys.length,
      journeys,
    });
  } catch (error) {
    console.error("Get Public Journeys Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch journeys.",
    });
  }
};

// Get All Journeys (Admin)
export const getAllJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find().sort({
      displayOrder: 1,
      startDate: -1,
    });

    return res.status(200).json({
      success: true,
      total: journeys.length,
      journeys,
    });
  } catch (error) {
    console.error("Get All Journeys Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch journeys.",
    });
  }
};

// Create Journey
export const createJourney = async (req, res) => {
  try {
    const {
      title,
      organization,
      description,
      type,
      startDate,
      endDate,
      isCurrent,
    } = req.body;

    if (
      !title?.trim() ||
      !organization?.trim() ||
      !description?.trim() ||
      !startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, organization, description and start date are required.",
      });
    }

    if (type !== undefined && !allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid journey type.",
      });
    }

    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date.",
      });
    }

    if (isCurrent === true && endDate) {
      return res.status(400).json({
        success: false,
        message: "Current journey cannot have an end date.",
      });
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate);

      if (
        Number.isNaN(parsedEndDate.getTime()) ||
        parsedEndDate < parsedStartDate
      ) {
        return res.status(400).json({
          success: false,
          message: "End date must be valid and after the start date.",
        });
      }
    }

    const journeyData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        journeyData[field] = req.body[field];
      }
    }

    const journey = await Journey.create(journeyData);
    await createActivityLog({ admin: req.admin, action: "journey_created", module: "journeys", description: `Created journey "${journey.title}".`, targetId: journey._id.toString(), targetName: journey.title, req });

    return res.status(201).json({
      success: true,
      message: "Journey created successfully.",
      journey,
    });
  } catch (error) {
    console.error("Create Journey Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create journey.",
    });
  }
};

// Update Journey
export const updateJourney = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid journey ID.",
      });
    }

    const journey = await Journey.findById(id);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: "Journey not found.",
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty.",
      });
    }

    if (updates.type !== undefined && !allowedTypes.includes(updates.type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid journey type.",
      });
    }

    const finalStartDate = new Date(updates.startDate ?? journey.startDate);

    const finalIsCurrent = updates.isCurrent ?? journey.isCurrent;
    const finalEndDate =
      updates.endDate !== undefined ? updates.endDate : journey.endDate;

    if (Number.isNaN(finalStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date.",
      });
    }

    if (finalIsCurrent && finalEndDate) {
      return res.status(400).json({
        success: false,
        message: "Current journey cannot have an end date.",
      });
    }

    if (finalEndDate) {
      const parsedEndDate = new Date(finalEndDate);

      if (
        Number.isNaN(parsedEndDate.getTime()) ||
        parsedEndDate < finalStartDate
      ) {
        return res.status(400).json({
          success: false,
          message: "End date must be valid and after the start date.",
        });
      }
    }

    Object.assign(journey, updates);

    await journey.save();
    await createActivityLog({ admin: req.admin, action: "journey_updated", module: "journeys", description: `Updated journey "${journey.title}".`, targetId: journey._id.toString(), targetName: journey.title, req });

    return res.status(200).json({
      success: true,
      message: "Journey updated successfully.",
      journey,
    });
  } catch (error) {
    console.error("Update Journey Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update journey.",
    });
  }
};

// Delete Journey
export const deleteJourney = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid journey ID.",
      });
    }

    const journey = await Journey.findByIdAndDelete(id);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: "Journey not found.",
      });
    }

    await createActivityLog({ admin: req.admin, action: "journey_deleted", module: "journeys", description: `Deleted journey "${journey.title}".`, targetId: journey._id.toString(), targetName: journey.title, req });

    return res.status(200).json({
      success: true,
      message: "Journey deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Journey Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete journey.",
    });
  }
};

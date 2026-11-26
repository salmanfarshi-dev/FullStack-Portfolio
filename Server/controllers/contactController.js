import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import { sendContactNotification } from "../services/emailService.js";
import { createNotification } from "./notificationController.js";
import { createActivityLog } from "./activityLogController.js";

// Submit Contact Message (Public)
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate field lengths
    if (
      name.trim().length > 100 ||
      email.trim().length > 150 ||
      subject.trim().length > 200 ||
      message.trim().length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    // Save Contact Message
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: req.ip || "",
      userAgent: req.get("user-agent") || "",
    });

    // Send Email Notification
    try {
      await sendContactNotification(contact);
    } catch (emailError) {
      console.error("Contact Notification Email Error:", emailError.message);
    }

    // Create Admin Notification in MongoDB
    try {
      const notification = await createNotification({
        type: "contact",
        title: "New Contact Message",
        message: `${contact.name} sent you a new message: ${contact.subject}`,
        link: `/admin/messages?contactId=${contact._id}`,
        metadata: {
          contactId: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
        },
        io: req.app.get("io"),
      });

      if (!notification?.length) {
        console.warn(
          "Contact saved, but no admin notification was created. Check active admin accounts.",
        );
      }
    } catch (notificationError) {
      console.error(
        "Contact Admin Notification Error:",
        notificationError.message,
      );
    }

    // Emit Contact Event through Socket.IO
    const io = req.app.get("io");

    if (io) {
      io.emit("new-contact-message", {
        id: contact._id,
        name: contact.name,
        subject: contact.subject,
        createdAt: contact.createdAt,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contactId: contact._id,
    });
  } catch (error) {
    console.error("Create Contact Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again.",
    });
  }
};

// Get All Contact Messages (Admin)
export const getAllContacts = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );

    const { status, search } = req.query;

    const filter = {};

    if (status) {
      const allowedStatuses = ["new", "read", "replied", "archived"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message status.",
        });
      }

      filter.status = status;
    }

    if (search?.trim()) {
      const keyword = search.trim().slice(0, 100);

      filter.$or = [
        {
          name: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          email: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const total = await Contact.countDocuments(filter);

    const contacts = await Contact.find(filter)
      .select("-ipAddress -userAgent")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      contacts,
    });
  } catch (error) {
    console.error("Get Contacts Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages.",
    });
  }
};

// Get Single Contact Message (Admin)
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const contact = await Contact.findById(id).select("-ipAddress -userAgent");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get Contact Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact message.",
    });
  }
};

// Update Contact Message (Admin)
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    const allowedStatuses = ["new", "read", "replied", "archived"];

    const { status, isStarred } = req.body;

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message status.",
      });
    }

    if (isStarred !== undefined && typeof isStarred !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isStarred must be a boolean.",
      });
    }

    if (status !== undefined) {
      contact.status = status;

      if (status === "replied" && !contact.repliedAt) {
        contact.repliedAt = new Date();
      }
    }

    if (isStarred !== undefined) {
      contact.isStarred = isStarred;
    }

    await contact.save();
    await createActivityLog({ admin: req.admin, action: "contact_updated", module: "contact", description: `Updated contact message from "${contact.name}".`, targetId: contact._id.toString(), targetName: contact.name, req });

    return res.status(200).json({
      success: true,
      message: "Contact message updated successfully.",
      contact,
    });
  } catch (error) {
    console.error("Update Contact Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update contact message.",
    });
  }
};

// Delete Contact Message (Admin)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    await createActivityLog({ admin: req.admin, action: "contact_deleted", module: "contact", description: `Deleted contact message from "${contact.name}".`, targetId: contact._id.toString(), targetName: contact.name, req });

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Contact Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message.",
    });
  }
};

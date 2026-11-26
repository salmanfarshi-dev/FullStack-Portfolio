import Project from "../models/Project.js";
import { createActivityLog } from "./activityLogController.js";

// Generate a URL-friendly slug
const generateSlug = (text) => text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const createUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = generateSlug(title) || "project";
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await Project.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
};

const allowedFields = ["title", "shortDescription", "description", "thumbnail", "images", "technologies", "category", "liveUrl", "githubUrl", "isFeatured", "isPublished", "displayOrder"];

export const createProject = async (req, res) => {
  try {
    const { title, shortDescription, description, technologies } = req.body;
    if (typeof title !== "string" || !title.trim() || typeof shortDescription !== "string" || !shortDescription.trim() || typeof description !== "string" || !description.trim() || !Array.isArray(technologies) || technologies.length === 0 || !technologies.every((item) => typeof item === "string" && item.trim())) {
      return res.status(400).json({ success: false, message: "Title, descriptions and technologies are required." });
    }
    const projectData = {};
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) projectData[field] = req.body[field]; });
    projectData.title = title.trim();
    projectData.shortDescription = shortDescription.trim();
    projectData.description = description.trim();
    projectData.technologies = technologies.map((item) => item.trim());
    projectData.slug = await createUniqueSlug(title);
    const project = await Project.create(projectData);
    await createActivityLog({ admin: req.admin, action: "project_created", module: "projects", description: `Created project "${project.title}".`, targetId: project._id.toString(), targetName: project.title, req });
    return res.status(201).json({ success: true, message: "Project created successfully.", project });
  } catch (error) {
    console.error("Create Project Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to create project." });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find().sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(),
    ]);
    return res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), projects });
  } catch (error) {
    console.error("Get Projects Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch projects." });
  }
};

export const getPublishedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ isPublished: true }).sort({ displayOrder: 1, createdAt: -1 }).select("-__v");
    return res.status(200).json({ success: true, total: projects.length, projects });
  } catch (error) {
    console.error("Get Published Projects Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch published projects." });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, isPublished: true });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Get Project Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch project." });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ success: false, message: "Invalid project ID." });
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    const updates = {};
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim()) return res.status(400).json({ success: false, message: "Project title cannot be empty." });
      updates.title = updates.title.trim();
      updates.slug = await createUniqueSlug(updates.title, id);
    }
    if (updates.technologies !== undefined) {
      if (!Array.isArray(updates.technologies) || !updates.technologies.every((item) => typeof item === "string" && item.trim())) return res.status(400).json({ success: false, message: "Technologies must be a valid array of strings." });
      updates.technologies = updates.technologies.map((item) => item.trim());
    }
    Object.assign(project, updates);
    await project.save();
    await createActivityLog({ admin: req.admin, action: "project_updated", module: "projects", description: `Updated project "${project.title}".`, targetId: project._id.toString(), targetName: project.title, req });
    return res.status(200).json({ success: true, message: "Project updated successfully.", project });
  } catch (error) {
    console.error("Update Project Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update project." });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ success: false, message: "Invalid project ID." });
    const project = await Project.findByIdAndDelete(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    await createActivityLog({ admin: req.admin, action: "project_deleted", module: "projects", description: `Deleted project "${project.title}".`, targetId: project._id.toString(), targetName: project.title, req });
    return res.status(200).json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    console.error("Delete Project Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to delete project." });
  }
};

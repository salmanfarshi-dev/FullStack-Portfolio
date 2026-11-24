import apiRequest from "../../services/api";

// Get all projects for admin
export const getAdminProjects = (page = 1, limit = 10) =>
  apiRequest(`/projects/admin?page=${page}&limit=${limit}`);

// Create a new project
export const createProject = (projectData) =>
  apiRequest("/projects", {
    method: "POST",
    body: projectData,
  });

// Update an existing project
export const updateProject = (id, projectData) =>
  apiRequest(`/projects/${id}`, {
    method: "PATCH",
    body: projectData,
  });

// Delete a project
export const deleteProject = (id) =>
  apiRequest(`/projects/${id}`, {
    method: "DELETE",
  });

// Update project publishing status
export const toggleProjectPublish = (id, isPublished) =>
  updateProject(id, { isPublished });

// Update project featured status
export const toggleProjectFeatured = (id, isFeatured) =>
  updateProject(id, { isFeatured });

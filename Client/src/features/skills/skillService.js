import apiRequest from "../../services/api";

// Get all skills for admin
export const getAdminSkills = () => apiRequest("/skills/admin");

// Get public skills
export const getPublicSkills = () => apiRequest("/skills");

// Create skill
export const createSkill = (skillData) =>
  apiRequest("/skills", {
    method: "POST",
    body: skillData,
  });

// Update skill
export const updateSkill = (id, skillData) =>
  apiRequest(`/skills/${id}`, {
    method: "PATCH",
    body: skillData,
  });

// Delete skill
export const deleteSkill = (id) =>
  apiRequest(`/skills/${id}`, {
    method: "DELETE",
  });

// Toggle skill visibility
export const toggleSkillVisibility = (id, isVisible) =>
  updateSkill(id, { isVisible });

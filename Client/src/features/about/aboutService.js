import apiRequest from "../../services/api";

// Get About Information for Admin
export const getAdminAbout = () => apiRequest("/about/admin");

// Get Public About Information
export const getPublicAbout = () => apiRequest("/about");

// Create About Information
export const createAbout = (aboutData) =>
  apiRequest("/about", {
    method: "POST",
    body: aboutData,
  });

// Update About Information
export const updateAbout = (id, aboutData) =>
  apiRequest(`/about/${id}`, {
    method: "PATCH",
    body: aboutData,
  });

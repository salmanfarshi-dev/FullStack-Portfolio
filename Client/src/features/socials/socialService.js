
import apiRequest from "../../services/api";

export const getAdminSocials = () =>
  apiRequest("/socials/admin");

export const createSocial = (data) =>
  apiRequest("/socials", {
    method: "POST",
    body: data,
  });

export const updateSocial = (id, data) =>
  apiRequest(`/socials/${id}`, {
    method: "PATCH",
    body: data,
  });

export const deleteSocial = (id) =>
  apiRequest(`/socials/${id}`, {
    method: "DELETE",
  });

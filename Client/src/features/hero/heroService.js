
import apiRequest from "../../services/api";

export const getAdminHero = () => apiRequest("/hero/admin");

export const createHero = (data) =>
  apiRequest("/hero", {
    method: "POST",
    body: data,
  });

export const updateHero = (id, data) =>
  apiRequest(`/hero/${id}`, {
    method: "PATCH",
    body: data,
  });

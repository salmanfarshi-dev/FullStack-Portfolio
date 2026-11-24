
import apiRequest from "../../services/api";

export const getAdminJourneys = () =>
  apiRequest("/journeys/admin");

export const createJourney = (data) =>
  apiRequest("/journeys", {
    method: "POST",
    body: data,
  });

export const updateJourney = (id, data) =>
  apiRequest(`/journeys/${id}`, {
    method: "PATCH",
    body: data,
  });

export const deleteJourney = (id) =>
  apiRequest(`/journeys/${id}`, {
    method: "DELETE",
  });

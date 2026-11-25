
import apiRequest from "../../services/api";

// Public: Subscribe to newsletter
export const subscribeNewsletter = (email) =>
  apiRequest("/newsletter/subscribe", {
    method: "POST",
    body: { email },
  });

// Admin: Get subscribers
export const getAdminSubscribers = ({
  page = 1,
  limit = 10,
  status = "",
  search = "",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) params.set("status", status);
  if (search) params.set("search", search);

  return apiRequest(`/newsletter/admin?${params.toString()}`);
};

// Admin: Update subscriber
export const updateSubscriber = (id, data) =>
  apiRequest(`/newsletter/admin/${id}`, {
    method: "PATCH",
    body: data,
  });

// Admin: Delete subscriber
export const deleteSubscriber = (id) =>
  apiRequest(`/newsletter/admin/${id}`, {
    method: "DELETE",
  });

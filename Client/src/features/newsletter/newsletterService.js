
import apiRequest from "../../services/api";

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

export const updateSubscriber = (id, data) =>
  apiRequest(`/newsletter/admin/${id}`, {
    method: "PATCH",
    body: data,
  });

export const deleteSubscriber = (id) =>
  apiRequest(`/newsletter/admin/${id}`, {
    method: "DELETE",
  });

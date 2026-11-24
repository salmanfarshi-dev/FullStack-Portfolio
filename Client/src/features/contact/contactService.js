
import apiRequest from "../../services/api";

export const getAdminContacts = ({
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

  return apiRequest(`/contact/admin?${params.toString()}`);
};

export const getContactById = (id) =>
  apiRequest(`/contact/admin/${id}`);

export const updateContact = (id, data) =>
  apiRequest(`/contact/admin/${id}`, {
    method: "PATCH",
    body: data,
  });

export const deleteContact = (id) =>
  apiRequest(`/contact/admin/${id}`, {
    method: "DELETE",
  });

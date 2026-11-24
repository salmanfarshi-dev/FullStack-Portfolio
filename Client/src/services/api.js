const API_BASE_URL = "http://localhost:5000/api/v1";

const apiRequest = async (endpoint, options = {}) => {
  const { method = "GET", body, headers = {} } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Something went wrong. Please try again.",
      );
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Unable to connect to the server.");
  }
};

export default apiRequest;

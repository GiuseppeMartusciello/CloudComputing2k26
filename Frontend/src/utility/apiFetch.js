const API_BASE_URL = import.meta.env.VITE_API_URL || "";


export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let body = {};
    try {
      body = await response.json();
    } catch {

    }

    const error = new Error(body.message || "Errore API");
    error.status = response.status;
    error.body = body;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  if (response.status === 204 || !contentType.includes("application/json")) {
    return null;
  }

  return await response.json();
}

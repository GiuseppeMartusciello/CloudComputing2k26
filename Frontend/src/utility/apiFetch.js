import { msalInstance } from "../msalInstance";
import { loginRequest } from "../authConfig";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://bizment-backend-c0a4dyaee4hvd3gq.swedencentral-01.azurewebsites.net";

export async function apiFetch(url, options = {}) {
  let token = null;

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      token = response.accessToken;
    } catch (error) {
      console.warn("Silent token acquisition failed, proceeding without token", error);
    }
  }

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

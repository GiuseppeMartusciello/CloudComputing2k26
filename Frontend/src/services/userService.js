import { apiFetch } from "../utility/apiFetch";

export async function getMe() {
  return await apiFetch(`/user/me`);
}

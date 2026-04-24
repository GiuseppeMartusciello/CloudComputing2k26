import { apiFetch } from "../utility/apiFetch";

export async function loginApi(email, password) {
  return await apiFetch(`/auth/signin`, {
    method: "POST",
    body: JSON.stringify({email,password}),
  });
}

export async function signUpApi({ email, username, password, birthdate  }) {
  return await apiFetch(`/auth/signup`, {
    method: "POST",
    body: JSON.stringify({ email: email, username: username, password: password, birthDate: birthdate }),
  });
}

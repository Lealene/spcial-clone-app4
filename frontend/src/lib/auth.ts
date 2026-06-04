const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export type AuthResponse = {
  token: string;
  user: { id: string; email: string; username: string; bio?: string };
};
export async function loginUser(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}
export async function registerUser(data: {
  email: string;
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  let result;
  try {
    result = await res.json();
  } catch {
    throw new Error("Server returned invalid JSON");
  }
  if (!res.ok) {
    throw new Error(result.message || "Registration failed");
  }
  if (!result.token) {
    throw new Error("No token returned from server");
  }
  if (!result.user) {
    throw new Error("No user returned from server");
  }
  localStorage.setItem("token", result.token);
  localStorage.setItem("user", JSON.stringify(result.user));
  return result;
}

import { publicRequest, refreshSession } from "../lib/apiClient";
import { useAuthStore } from "../stores/authStore";
import type { AuthData } from "./types";

export { ApiError } from "../lib/apiClient";
export type { AuthData, ParentUser } from "./types";

export async function loginRequest(loginId: string, password: string) {
  const session = await publicRequest<AuthData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId, password }),
  });
  useAuthStore.getState().setSession(session);
  return session;
}

export async function signupRequest(loginId: string, password: string, nickname: string) {
  const session = await publicRequest<AuthData>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ loginId, password, nickname }),
  });
  useAuthStore.getState().setSession(session);
  return session;
}

export const refreshAccessToken = refreshSession;

export async function logoutRequest() {
  try {
    await publicRequest<null>("/api/auth/logout", { method: "POST" });
  } finally {
    useAuthStore.getState().clearSession();
  }
}

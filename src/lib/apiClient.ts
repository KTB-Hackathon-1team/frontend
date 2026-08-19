import returnFetch from "return-fetch";
import type { AuthData } from "../auth/types";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

type CommonResponse<T> = {
  message: string;
  data: T;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const fetchExtended = returnFetch({
  baseUrl: API_BASE_URL,
  headers: { Accept: "application/json" },
  interceptors: {
    request: async ([input, init]) => {
      const headers = new Headers(init?.headers);
      const accessToken = useAuthStore.getState().accessToken;

      if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
      if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return [input, { ...init, headers, credentials: "include" }];
    },
  },
});

async function execute<T>(path: string, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetchExtended(path, init);
  } catch {
    throw new ApiError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.", 0);
  }

  const result = (await response.json().catch(() => ({
    message: "서버 응답을 처리할 수 없습니다.",
    data: null,
  }))) as CommonResponse<T>;

  if (!response.ok) {
    throw new ApiError(result.message || "요청 처리에 실패했습니다.", response.status);
  }
  return result.data;
}

let refreshPromise: Promise<AuthData> | null = null;

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = execute<AuthData>("/api/auth/refresh", { method: "POST" })
      .then((session) => {
        useAuthStore.getState().setSession(session);
        return session;
      })
      .catch((error) => {
        useAuthStore.getState().clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function publicRequest<T>(path: string, init: RequestInit = {}) {
  return execute<T>(path, init);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  try {
    return await execute<T>(path, init);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || path.startsWith("/api/auth/")) {
      throw error;
    }
    await refreshSession();
    return execute<T>(path, init);
  }
}

export const swrFetcher = <T>(key: string) => apiRequest<T>(key);

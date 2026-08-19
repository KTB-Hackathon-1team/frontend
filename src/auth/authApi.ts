const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

export type ParentUser = {
  id: number;
  loginId: string;
  nickname: string;
  role: "PARENT" | string;
};

type CommonResponse<T> = {
  message: string;
  data: T;
};

export type AuthData = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: ParentUser;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<AuthData> | null = null;

async function request<T>(path: string, init: RequestInit = {}): Promise<CommonResponse<T>> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.", 0);
  }

  const result = (await response.json().catch(() => ({
    message: "서버 응답을 처리할 수 없습니다.",
    data: null,
  }))) as CommonResponse<T>;

  if (!response.ok) throw new ApiError(result.message || "요청 처리에 실패했습니다.", response.status);
  return result;
}

function rememberSession(data: AuthData) {
  accessToken = data.accessToken;
  return data;
}

export async function loginRequest(loginId: string, password: string) {
  const result = await request<AuthData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId, password }),
  });
  return rememberSession(result.data);
}

export async function signupRequest(loginId: string, password: string, nickname: string) {
  const result = await request<AuthData>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ loginId, password, nickname }),
  });
  return rememberSession(result.data);
}

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = request<AuthData>("/api/auth/refresh", { method: "POST" })
      .then((result) => rememberSession(result.data))
      .catch((error) => {
        accessToken = null;
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function logoutRequest() {
  try {
    await request<null>("/api/auth/logout", { method: "POST" });
  } finally {
    accessToken = null;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const send = () => {
    const headers = new Headers(init.headers);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return request<T>(path, { ...init, headers });
  };

  try {
    return await send();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    await refreshAccessToken();
    return send();
  }
}

import { useEffect } from "react";
import { Navigate, Outlet, createBrowserRouter } from "react-router";
import { AuthenticatedView } from "./app/AuthenticatedView";
import { LoginView } from "./app/LoginView";
import { SignupView } from "./app/SignupView";
import { refreshAccessToken } from "./auth/authApi";
import { useAuthStore } from "./stores/authStore";

function RouteLoading({ message = "로그인 상태를 확인하는 중..." }: { message?: string }) {
  return <main className="grid min-h-svh place-items-center bg-[#fffaf6] text-sm text-[#806d63]" aria-live="polite">{message}</main>;
}

function RootGate() {
  const user = useAuthStore((state) => state.user);
  const isRestoring = useAuthStore((state) => state.isRestoring);
  const setRestoring = useAuthStore((state) => state.setRestoring);

  useEffect(() => {
    let active = true;
    setRestoring(true);
    refreshAccessToken()
      .catch(() => undefined)
      .finally(() => {
        if (active) setRestoring(false);
      });
    return () => {
      active = false;
    };
  }, [setRestoring]);

  if (isRestoring) return <RouteLoading />;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user);
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function NotFoundView() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#fffaf6] px-6 text-center text-[#342721]">
      <span className="text-8xl font-black tracking-tighter text-[#d2a48a]">404</span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">페이지를 찾을 수 없어요</h1>
      <p className="mt-3 text-[#79685f]">주소가 변경되었거나 존재하지 않는 페이지예요.</p>
      <a className="mt-7 rounded-xl bg-[#75432f] px-5 py-3 font-semibold text-white" href="/">처음 화면으로 돌아가기</a>
    </main>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <RootGate /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginView /> },
      { path: "/signup", element: <SignupView /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <AuthenticatedView /> }],
  },
  { path: "*", element: <NotFoundView /> },
]);

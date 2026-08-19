import { useEffect, useSyncExternalStore } from "react";
import { AuthenticatedView } from "../app/components/AuthenticatedView";
import { LoginView } from "../app/components/LoginView";
import { SignupView } from "../app/components/SignupView";
import { useAuth } from "./auth/AuthContext";

function getPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function subscribeToPathChange(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function replacePath(destination: string) {
  window.history.replaceState({}, "", destination);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const path = useSyncExternalStore(subscribeToPathChange, getPath, getPath);
  const { user, isRestoring } = useAuth();

  useEffect(() => {
    if (isRestoring) return;

    let destination: string | null = null;
    if (path === "/") destination = user ? "/dashboard" : "/login";
    else if ((path === "/login" || path === "/signup") && user) destination = "/dashboard";
    else if (path === "/dashboard" && !user) destination = "/login";

    if (destination) {
      replacePath(destination);
    }
  }, [isRestoring, path, user]);

  const isRedirecting = path === "/"
    || ((path === "/login" || path === "/signup") && Boolean(user))
    || (path === "/dashboard" && !user);

  if (isRestoring || isRedirecting) {
    return (
      <main className="route-loading" aria-live="polite">
        {isRestoring ? "로그인 상태를 확인하는 중..." : "페이지를 이동하는 중..."}
      </main>
    );
  }
  if (path === "/login") return <LoginView />;
  if (path === "/signup") return <SignupView />;
  if (path === "/dashboard" && user) return <AuthenticatedView />;

  return (
    <main className="not-found-page">
      <a className="brand" href="/login" aria-label="코코아 로그인"><span className="brand-symbol" aria-hidden="true"><i /><b /></span><span>코코아</span></a>
      <span className="not-found-code">404</span>
      <h1>페이지를 찾을 수 없어요</h1>
      <p>주소가 변경되었거나 존재하지 않는 페이지예요.</p>
      <a className="not-found-link" href="/login">로그인 화면으로 돌아가기</a>
    </main>
  );
}

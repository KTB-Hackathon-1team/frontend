import { useState } from "react";
import { useAuth } from "../../src/auth/AuthContext";

export function AuthenticatedView() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="brand-panel" aria-label="코코아 소개">
        <a className="brand brand-on-dark" href="/login" aria-label="코코아 로그인"><span className="brand-symbol" aria-hidden="true"><i /><b /></span><span>코코아</span></a>
        <div className="brand-copy"><span className="eyebrow">부모와 아이의 마음을 잇는 시간</span><h1>오늘도 따뜻한<br />대화를 시작해요</h1><p>서두르지 않아도 괜찮아요.<br />코코아가 차분히 곁에서 도울게요.</p></div>
        <div className="landscape" aria-hidden="true"><span className="sun" /><span className="arc arc-left" /><span className="arc arc-right" /><span className="mountain mountain-back" /><span className="mountain mountain-front" /></div>
        <div className="trust-note"><span aria-hidden="true">♢</span> 모든 대화는 안전하게 보호돼요</div>
      </section>
      <section className="form-panel">
        <div className="mobile-brand"><a className="brand" href="/login" aria-label="코코아 로그인"><span className="brand-symbol" aria-hidden="true"><i /><b /></span><span>코코아</span></a></div>
        <div className="auth-card signed-in-card">
          <span className="signed-in-icon" aria-hidden="true">✓</span>
          <span className="eyebrow accent">로그인 완료</span>
          <h2>{user.nickname}님, 반가워요</h2>
          <p>코코아와 함께 아이의 마음을 이해하는 대화를 시작할 준비가 되었어요.</p>
          <dl className="user-summary">
            <div><dt>아이디</dt><dd>{user.loginId}</dd></div>
            <div><dt>계정 유형</dt><dd>{user.role === "PARENT" ? "부모" : user.role}</dd></div>
          </dl>
          <button className="secondary-button" type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</button>
        </div>
        <footer className="auth-footer"><span>개인정보처리방침</span><span>이용약관</span><span>© 코코아</span></footer>
      </section>
    </main>
  );
}

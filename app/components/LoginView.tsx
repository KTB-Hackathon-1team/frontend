"use client";

import { FormEvent, useState } from "react";

export function LoginView() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nextErrors: { email?: string; password?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "올바른 이메일 주소를 입력해 주세요.";
    if (password.length < 8) nextErrors.password = "비밀번호는 8자 이상 입력해 주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMessage("");
      return;
    }
    setMessage("로그인 API 연결 전 데모 화면입니다.");
  }

  return (
    <main className="auth-page">
      <section className="brand-panel" aria-label="마음이음 소개">
        <a className="brand brand-on-dark" href="/" aria-label="마음이음 홈">
          <span className="brand-symbol" aria-hidden="true"><i /><b /></span>
          <span>마음이음</span>
        </a>
        <div className="brand-copy">
          <span className="eyebrow">AI 육아 길잡이</span>
          <h1>안심하고<br />이야기를 시작하세요</h1>
          <p>아이의 마음을 소중히 듣고,<br />서로를 이해하는 대화를 함께 만들어요.</p>
        </div>
        <div className="landscape" aria-hidden="true">
          <span className="sun" /><span className="arc arc-left" /><span className="arc arc-right" />
          <span className="mountain mountain-back" /><span className="mountain mountain-front" />
        </div>
        <div className="trust-note"><span aria-hidden="true">♢</span> 모든 대화는 안전하게 보호돼요</div>
      </section>

      <section className="form-panel">
        <div className="mobile-brand">
          <a className="brand" href="/" aria-label="마음이음 홈">
            <span className="brand-symbol" aria-hidden="true"><i /><b /></span><span>마음이음</span>
          </a>
        </div>
        <div className="auth-card">
          <div className="auth-heading">
            <span className="eyebrow blue">다시 만나서 반가워요</span>
            <h2>로그인</h2>
            <p>마음이음에서 아이와의 대화를 이어가세요.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <label className="field"><span>이메일</span><input name="email" type="email" autoComplete="email" placeholder="이메일을 입력해 주세요" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} />{errors.email && <small className="field-error" id="login-email-error">{errors.email}</small>}</label>
            <label className="field">
              <span>비밀번호</span>
              <span className="password-wrap">
                <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="비밀번호를 입력해 주세요" required aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} />
                <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>{showPassword ? "숨김" : "보기"}</button>
              </span>
              {errors.password && <small className="field-error" id="login-password-error">{errors.password}</small>}
            </label>
            <div className="form-options">
              <label className="checkbox"><input type="checkbox" /> <span>로그인 상태 유지</span></label>
              <button className="text-button" type="button">비밀번호 찾기</button>
            </div>
            <button className="primary-button" type="submit">로그인</button>
            {message && <p className="form-message" role="status">{message}</p>}
          </form>
          <div className="divider"><span>또는</span></div>
          <div className="social-row" aria-label="소셜 로그인">
            <button className="social-button" type="button"><b className="google">G</b><span>Google</span></button>
            <button className="social-button" type="button"><b className="kakao">K</b><span>카카오</span></button>
            <button className="social-button" type="button"><b className="apple">●</b><span>Apple</span></button>
          </div>
          <p className="auth-switch">계정이 없으신가요? <a href="/signup">회원가입</a></p>
        </div>
        <footer className="auth-footer"><span>개인정보처리방침</span><span>이용약관</span><span>© 마음이음</span></footer>
      </section>
    </main>
  );
}

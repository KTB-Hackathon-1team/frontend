"use client";

import { FormEvent, useState } from "react";
import { ApiError } from "../../src/auth/authApi";
import { useAuth } from "../../src/auth/AuthContext";
import { AuthenticatedView } from "./AuthenticatedView";

type SignupErrors = { loginId?: string; nickname?: string; password?: string; confirmPassword?: string; terms?: string };

export function SignupView() {
  const { user, isRestoring, signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const loginId = String(form.get("loginId") ?? "").trim();
    const nickname = String(form.get("nickname") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const nextErrors: SignupErrors = {};
    if (!loginId) nextErrors.loginId = "아이디를 입력해 주세요.";
    if (!nickname) nextErrors.nickname = "닉네임을 입력해 주세요.";
    if (password.length < 8) nextErrors.password = "영문·숫자를 포함해 8자 이상 입력해 주세요.";
    if (password !== confirmPassword) nextErrors.confirmPassword = "비밀번호가 일치하지 않아요.";
    if (!form.get("terms")) nextErrors.terms = "필수 약관에 동의해 주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setMessage(""); return; }
    setIsSubmitting(true);
    setMessage("");
    try {
      await signup(loginId, password, nickname);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "회원가입 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (user) return <AuthenticatedView />;

  return (
    <main className="auth-page signup-page">
      <section className="brand-panel" aria-label="코코아 소개">
        <a className="brand brand-on-dark" href="/" aria-label="코코아 홈"><span className="brand-symbol" aria-hidden="true"><i /><b /></span><span>코코아</span></a>
        <div className="brand-copy">
          <span className="eyebrow">따뜻한 기술, 안전한 연결</span>
          <h1>마음을 이해하는<br />시간을 시작해요</h1>
          <p>부모 계정을 먼저 만든 뒤,<br />아이 프로필은 천천히 연결할 수 있어요.</p>
        </div>
        <div className="landscape" aria-hidden="true"><span className="sun" /><span className="arc arc-left" /><span className="arc arc-right" /><span className="mountain mountain-back" /><span className="mountain mountain-front" /></div>
        <div className="trust-note"><span aria-hidden="true">♢</span> 아이의 이야기는 소중하게 보호돼요</div>
      </section>

      <section className="form-panel">
        <div className="mobile-brand"><a className="brand" href="/" aria-label="코코아 홈"><span className="brand-symbol" aria-hidden="true"><i /><b /></span><span>코코아</span></a></div>
        <div className="auth-card signup-card">
          <div className="auth-heading"><span className="eyebrow accent">부모 계정</span><h2>회원가입</h2><p>아이 프로필은 가입 후 연결할 수 있어요.</p></div>
          <form onSubmit={handleSubmit} noValidate>
            <label className="field"><span>아이디</span><input name="loginId" type="text" autoComplete="username" placeholder="사용할 아이디를 입력해 주세요" required aria-invalid={Boolean(errors.loginId)} />{errors.loginId && <small className="field-error">{errors.loginId}</small>}</label>
            <label className="field"><span>닉네임</span><input name="nickname" type="text" autoComplete="nickname" placeholder="부모님을 부를 이름을 입력해 주세요" required aria-invalid={Boolean(errors.nickname)} />{errors.nickname && <small className="field-error">{errors.nickname}</small>}</label>
            <label className="field"><span>비밀번호</span><span className="password-wrap"><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="영문·숫자 포함 8자 이상" required aria-invalid={Boolean(errors.password)} /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "숨김" : "보기"}</button></span>{errors.password && <small className="field-error">{errors.password}</small>}</label>
            <label className="field"><span>비밀번호 확인</span><input name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="비밀번호를 한 번 더 입력해 주세요" required aria-invalid={Boolean(errors.confirmPassword)} />{errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}</label>
            <div className="profile-notice"><span aria-hidden="true">♢</span><div><b>아이 프로필은 나중에 연결할 수 있어요</b><small>가입 단계에서는 아이의 개인정보를 받지 않아요.</small></div></div>
            <label className="checkbox terms"><input name="terms" type="checkbox" /><span><b>필수</b> 이용약관 및 개인정보처리방침에 동의합니다.</span></label>
            {errors.terms && <small className="field-error terms-error">{errors.terms}</small>}
            <button className="primary-button signup-button" type="submit" disabled={isSubmitting || isRestoring}>{isRestoring ? "로그인 확인 중..." : isSubmitting ? "계정 만드는 중..." : "계정 만들기"}</button>
            {message && <p className="form-message error" role="alert">{message}</p>}
          </form>
          <p className="auth-switch">이미 계정이 있으신가요? <a href="/">로그인</a></p>
        </div>
        <footer className="auth-footer"><span>개인정보처리방침</span><span>이용약관</span><span>© 코코아</span></footer>
      </section>
    </main>
  );
}

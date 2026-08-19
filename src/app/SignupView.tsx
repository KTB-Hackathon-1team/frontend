import { FormEvent, useState } from "react";
import { AlertCircle, Eye, EyeOff, Info } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, signupRequest } from "../auth/authApi";
import { AuthLayout } from "../components/AuthLayout";

type SignupErrors = { loginId?: string; nickname?: string; password?: string; confirmPassword?: string; terms?: string };

export function SignupView() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
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
    if (!termsAccepted) nextErrors.terms = "필수 약관에 동의해 주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMessage("");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await signupRequest(loginId, password, nickname);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "회원가입 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass = "h-11 bg-white";
  return (
    <AuthLayout eyebrow="따뜻한 기술, 안전한 연결" title={<>마음을 이해하는<br />시간을 시작해요</>} description={<>부모 계정을 먼저 만든 뒤,<br />아이 프로필은 천천히 연결할 수 있어요.</>} trustMessage="아이의 이야기는 소중하게 보호돼요">
      <Card className="border-[#eadfd8] bg-white/90 shadow-xl shadow-[#7e482f]/10 backdrop-blur">
        <CardHeader className="items-center pb-4 text-center"><span className="text-xs font-bold tracking-[.14em] text-[#a8623e] uppercase">부모 계정</span><CardTitle className="text-3xl font-bold tracking-[-.05em] text-[#342721]">회원가입</CardTitle><CardDescription className="text-[#79685f]">아이 프로필은 가입 후 연결할 수 있어요.</CardDescription></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5"><Label htmlFor="signup-id">아이디</Label><Input id="signup-id" name="loginId" autoComplete="username" placeholder="사용할 아이디를 입력해 주세요" aria-invalid={Boolean(errors.loginId)} className={fieldClass} />{errors.loginId && <p className="text-xs text-destructive">{errors.loginId}</p>}</div>
            <div className="space-y-1.5"><Label htmlFor="signup-nickname">닉네임</Label><Input id="signup-nickname" name="nickname" autoComplete="nickname" placeholder="부모님을 부를 이름" aria-invalid={Boolean(errors.nickname)} className={fieldClass} />{errors.nickname && <p className="text-xs text-destructive">{errors.nickname}</p>}</div>
            <div className="space-y-1.5"><Label htmlFor="signup-password">비밀번호</Label><div className="relative"><Input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="영문·숫자 포함 8자 이상" aria-invalid={Boolean(errors.password)} className={`${fieldClass} pr-12`} /><Button className="absolute top-1/2 right-1 -translate-y-1/2 text-[#79685f]" type="button" size="icon" variant="ghost" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>{showPassword ? <EyeOff /> : <Eye />}</Button></div>{errors.password && <p className="text-xs text-destructive">{errors.password}</p>}</div>
            <div className="space-y-1.5"><Label htmlFor="signup-confirm">비밀번호 확인</Label><Input id="signup-confirm" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="비밀번호를 한 번 더 입력해 주세요" aria-invalid={Boolean(errors.confirmPassword)} className={fieldClass} />{errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}</div>
            <Alert className="border-[#ead8cc] bg-[#fff7f1] text-[#86543e]"><Info /><AlertDescription><strong className="block">아이 프로필은 나중에 연결할 수 있어요</strong><span className="text-xs text-[#8b7164]">가입 단계에서는 아이의 개인정보를 받지 않아요.</span></AlertDescription></Alert>
            <div className="flex items-start gap-2"><Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} /><div><Label htmlFor="terms" className="font-normal text-[#6f5f57]"><strong className="mr-1 text-[#a8623e]">필수</strong>이용약관 및 개인정보처리방침에 동의합니다.</Label>{errors.terms && <p className="mt-1 text-xs text-destructive">{errors.terms}</p>}</div></div>
            {message && <Alert variant="destructive"><AlertCircle /><AlertDescription>{message}</AlertDescription></Alert>}
            <Button className="h-12 w-full bg-gradient-to-r from-[#c1724e] to-[#8a4f39] text-white shadow-lg shadow-[#7e482f]/20 hover:opacity-90" type="submit" disabled={isSubmitting}>{isSubmitting ? "계정 만드는 중..." : "계정 만들기"}</Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-[#eadfd8] text-sm text-[#79685f]">이미 계정이 있으신가요? <Button variant="link" asChild className="px-1 text-[#a8623e]"><Link to="/login">로그인</Link></Button></CardFooter>
      </Card>
    </AuthLayout>
  );
}

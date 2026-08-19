import { FormEvent, useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, loginRequest } from "../../auth/authApi";
import { AuthLayout } from "./AuthLayout";

export function LoginView() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ loginId?: string; password?: string }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const loginId = String(form.get("loginId") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const nextErrors: typeof errors = {};
    if (!loginId) nextErrors.loginId = "아이디를 입력해 주세요.";
    if (password.length < 8) nextErrors.password = "비밀번호는 8자 이상 입력해 주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMessage("");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await loginRequest(loginId, password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "로그인 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout eyebrow="AI 육아 길잡이" title={<>안심하고<br />이야기를 시작하세요</>} description={<>아이의 마음을 소중히 듣고,<br />서로를 이해하는 대화를 함께 만들어요.</>} trustMessage="모든 대화는 안전하게 보호돼요">
      <Card className="border-[#eadfd8] bg-white/90 shadow-xl shadow-[#7e482f]/10 backdrop-blur">
        <CardHeader className="items-center text-center">
          <span className="text-xs font-bold tracking-[.14em] text-[#a8623e] uppercase">다시 만나서 반가워요</span>
          <CardTitle className="text-4xl font-bold tracking-[-.055em] text-[#342721]">로그인</CardTitle>
          <CardDescription className="text-[#79685f]">코코아에서 아이와의 따뜻한 대화를 이어가세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="login-id">아이디</Label>
              <Input id="login-id" name="loginId" autoComplete="username" placeholder="아이디를 입력해 주세요" aria-invalid={Boolean(errors.loginId)} aria-describedby={errors.loginId ? "login-id-error" : undefined} className="h-12 bg-white" />
              {errors.loginId && <p className="text-xs text-destructive" id="login-id-error">{errors.loginId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">비밀번호</Label>
              <div className="relative">
                <Input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="비밀번호를 입력해 주세요" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} className="h-12 bg-white pr-12" />
                <Button className="absolute top-1/2 right-1 -translate-y-1/2 text-[#79685f]" type="button" size="icon" variant="ghost" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>{showPassword ? <EyeOff /> : <Eye />}</Button>
              </div>
              {errors.password && <p className="text-xs text-destructive" id="login-password-error">{errors.password}</p>}
            </div>
            {message && <Alert variant="destructive"><AlertCircle /><AlertDescription>{message}</AlertDescription></Alert>}
            <Button className="h-12 w-full bg-gradient-to-r from-[#a8623e] to-[#75432f] text-white shadow-lg shadow-[#7e482f]/20 hover:opacity-90" type="submit" disabled={isSubmitting}>{isSubmitting ? "로그인 중..." : "로그인"}</Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-[#eadfd8] text-sm text-[#79685f]">계정이 없으신가요? <Button variant="link" asChild className="px-1 text-[#a8623e]"><Link to="/signup">회원가입</Link></Button></CardFooter>
      </Card>
    </AuthLayout>
  );
}

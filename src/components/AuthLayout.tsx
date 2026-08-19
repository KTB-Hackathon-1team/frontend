import type { ReactNode } from "react";
import { Brand } from "./Brand";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-svh flex-col items-center bg-[radial-gradient(circle_at_94%_8%,#fff0dc_0,transparent_24%),radial-gradient(circle_at_10%_92%,#f6ebe4_0,transparent_30%),#fff] px-5 py-6">
      <div className="w-full"><Brand /></div>
      <div className="my-auto w-full py-8">{children}</div>
      <footer className="mt-auto flex gap-5 pt-5 text-[11px] text-[#9aa2b5]"><span>개인정보처리방침</span><span>이용약관</span><span>© 코코아</span></footer>
    </main>
  );
}

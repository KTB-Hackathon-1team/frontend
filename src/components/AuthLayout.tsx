import type { ReactNode } from "react";
import { Brand } from "./Brand";

type AuthLayoutProps = {
  children: ReactNode;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  trustMessage: string;
};

export function AuthLayout({ children, eyebrow, title, description, trustMessage }: AuthLayoutProps) {
  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-[minmax(360px,42%)_1fr]">
      <section className="relative hidden min-h-svh flex-col overflow-hidden bg-gradient-to-br from-[#dfb28f] via-[#b87753] to-[#704433] px-[clamp(38px,5vw,80px)] py-12 text-white lg:flex" aria-label="코코아 소개">
        <Brand inverse />
        <div className="relative z-10 my-auto pb-[11vh]">
          <span className="mb-5 inline-block text-xs font-bold tracking-[.16em] text-[#fff1e7] uppercase">{eyebrow}</span>
          <h1 className="text-[clamp(36px,4vw,58px)] leading-[1.2] font-bold tracking-[-.055em]">{title}</h1>
          <p className="mt-6 text-[17px] leading-8 text-[#fff3eb]">{description}</p>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden="true">
          <span className="absolute bottom-[22%] left-1/2 size-5 -translate-x-1/2 rounded-full bg-[#ffe2aa] shadow-[0_0_40px_18px_rgba(255,220,170,.38)]" />
          <span className="absolute -bottom-[14%] -left-[15%] h-[42%] w-[130%] -rotate-3 rounded-[50%_50%_0_0] bg-[rgba(143,82,59,.36)]" />
          <span className="absolute -right-[15%] -bottom-[24%] h-[45%] w-[130%] rotate-6 rounded-[50%_50%_0_0] bg-[rgba(92,52,39,.48)]" />
        </div>
        <div className="relative z-10 flex items-center gap-2 text-xs text-[#fff3eb]"><span className="grid size-6 place-items-center rounded-full border border-[#f5d6c3]">◇</span>{trustMessage}</div>
      </section>

      <section className="flex min-h-svh flex-col items-center bg-[radial-gradient(circle_at_94%_8%,#fff0dc_0,transparent_24%),radial-gradient(circle_at_10%_92%,#f6ebe4_0,transparent_30%),#fff] px-5 py-6 lg:justify-center lg:px-[clamp(24px,5vw,72px)]">
        <div className="w-full lg:hidden"><Brand /></div>
        <div className="my-auto w-full max-w-md py-8 lg:my-0 lg:py-0">{children}</div>
        <footer className="mt-auto flex gap-5 pt-5 text-[11px] text-[#9aa2b5] lg:mt-14 lg:pt-0"><span>개인정보처리방침</span><span>이용약관</span><span>© 코코아</span></footer>
      </section>
    </main>
  );
}

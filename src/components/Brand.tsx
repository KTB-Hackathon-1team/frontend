import { Link } from "react-router";
import { Coffee } from "lucide-react";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link className="relative z-10 inline-flex w-fit items-center gap-3 text-xl font-bold tracking-tight text-[#342721]" to={to} aria-label="코코아 홈">
      <span className="grid size-10 place-items-center rounded-2xl border border-[#dec2b2] bg-[#fff4ec] text-[#8a4f39] shadow-sm" aria-hidden="true">
        <Coffee className="size-6" strokeWidth={2.25} />
      </span>
      <span>코코아</span>
    </Link>
  );
}

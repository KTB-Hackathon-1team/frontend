import { Link } from "react-router";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ inverse = false, to = "/" }: { inverse?: boolean; to?: string }) {
  return (
    <Link className={cn("relative z-10 inline-flex w-fit items-center gap-3 text-xl font-bold tracking-tight", inverse ? "text-white" : "text-[#342721]")} to={to} aria-label="코코아 홈">
      <span className={cn("grid size-10 place-items-center rounded-2xl border shadow-sm", inverse ? "border-white/40 bg-white/15" : "border-[#dec2b2] bg-[#fff4ec] text-[#8a4f39]")} aria-hidden="true">
        <Coffee className="size-6" strokeWidth={2.25} />
      </span>
      <span>코코아</span>
    </Link>
  );
}

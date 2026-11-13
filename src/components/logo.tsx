import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  showWordmark?: boolean;
  subtitle?: string;
};

export function Logo({ href = "/", className, showWordmark = true, subtitle }: LogoProps) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/logo.svg"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-xl shadow-sm"
      />
      {showWordmark ? (
        <span className="leading-tight">
          <span className="block text-lg font-semibold tracking-tight text-blue-800">Fiber Link</span>
          {subtitle ? <span className="block text-xs font-medium text-slate-500">{subtitle}</span> : null}
        </span>
      ) : (
        <span className="sr-only">Fiber Link</span>
      )}
    </span>
  );

  if (!href) {
    return mark;
  }

  return (
    <Link href={href} className="inline-flex items-center rounded-md focus-visible:outline-none">
      {mark}
    </Link>
  );
}

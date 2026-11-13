import Link from "next/link";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileIcon({ className }: { className?: string }) {
  return (
    <Link
      href="/profile"
      aria-label="Profile"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100",
        className,
      )}
    >
      <UserRound className="h-5 w-5" aria-hidden />
    </Link>
  );
}

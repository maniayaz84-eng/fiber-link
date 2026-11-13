import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ProfileIcon } from "@/components/profile-icon";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo href="/dashboard" subtitle="Dashboard" />
          <div className="flex items-center gap-3">
            <Link href="/dashboard">Overview</Link>
            <Link href="/packages">Packages</Link>
            <Link href="/settings">Settings</Link>
            <ProfileIcon />
            <Button variant="outline" size="sm">Sign out</Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

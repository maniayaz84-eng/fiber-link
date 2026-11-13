import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";
import { footerMenu } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SiteShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-slate-50 text-slate-900", className)}>
      <SiteHeader />
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="flex items-start gap-3">
            <Logo href="/" />
            <p className="pt-1 text-sm text-slate-600">
              Payment verification happens in this app; ISP line provisioning is a separate step.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="mb-3 text-sm font-semibold text-blue-800">Menu</p>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600">
              {footerMenu.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link href={item.href} className="hover:text-blue-800">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}

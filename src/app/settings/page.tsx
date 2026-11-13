import Link from "next/link";
import { Globe, Shield, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/site-shell";
import { setLanguageAction } from "@/lib/actions/settings";
import { getLanguage } from "@/lib/i18n";

export default async function SettingsPage() {
  const language = await getLanguage();

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-blue-800">Settings</h1>
        <p className="mt-2 text-slate-600">Choose language and account options for Fiber Link.</p>

        <div className="mt-8 space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 text-blue-800">
              <Globe className="h-5 w-5" aria-hidden />
              <h2 className="text-xl font-semibold">Language</h2>
            </div>
            <p className="mb-4 text-sm text-slate-600">This choice is saved in your browser and used across the site.</p>
            <form action={setLanguageAction} className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input type="radio" name="language" value="en" defaultChecked={language === "en"} className="accent-blue-700" />
                <span>
                  <span className="block font-medium text-slate-900">English</span>
                  <span className="text-sm text-slate-600">Default language</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="language"
                  value="roman_ur"
                  defaultChecked={language === "roman_ur"}
                  className="accent-blue-700"
                />
                <span>
                  <span className="block font-medium text-slate-900">Roman Urdu</span>
                  <span className="text-sm text-slate-600">Urdu Latin letters mein</span>
                </span>
              </label>
              <Button type="submit">Save language</Button>
            </form>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 text-blue-800">
              <UserRound className="h-5 w-5" aria-hidden />
              <h2 className="text-xl font-semibold">Account</h2>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="font-medium text-blue-700 hover:underline">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="font-medium text-blue-700 hover:underline">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="font-medium text-blue-700 hover:underline">
                  Customer dashboard
                </Link>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" aria-hidden />
              <h2 className="text-xl font-semibold">Privacy</h2>
            </div>
            <p className="text-sm text-slate-600">
              Fiber Link uses your account details only to process subscription requests and payment verification.
              Legal copy can be replaced with the company privacy policy when it is ready.
            </p>
            <div className="mt-4 flex gap-4 text-sm">
              <Link href="/about" className="font-medium text-blue-700 hover:underline">
                Privacy
              </Link>
              <Link href="/about" className="font-medium text-blue-700 hover:underline">
                Terms
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}

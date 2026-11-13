import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/site-shell";
import { getSessionUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getSessionUser();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? "Guest";
  const email = user?.email ?? "Not signed in";
  const phone = (user?.user_metadata?.phone as string | undefined) ?? "Not added yet";

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <UserRound className="h-8 w-8" aria-hidden />
          </span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-blue-800">Profile</h1>
            <p className="mt-1 text-slate-600">{user ? "Your Fiber Link account details." : "Sign in to see your full profile."}</p>
          </div>
        </div>

        <Card className="mt-8 p-6">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="mt-1 text-base font-medium text-slate-900">{phone}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button>Go to dashboard</Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline">Settings</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button>Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline">Create account</Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}

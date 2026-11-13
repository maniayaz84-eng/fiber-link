"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteShell } from "@/components/site-shell";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <Card className="p-8">
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">Access your Fiber Link dashboard and account details.</p>
          <form action={formAction} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <div className="mt-6 text-sm text-slate-600">
            New customer? <Link href="/signup" className="font-medium text-blue-700">Create account</Link>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}

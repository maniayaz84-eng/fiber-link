"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteShell } from "@/components/site-shell";
import { signupAction, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = { error: null };

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <SiteShell>
      <section className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <Card className="p-8">
          <h1 className="text-3xl font-bold">Create a customer account</h1>
          <p className="mt-2 text-sm text-slate-600">Start your Fiber Link subscription request in a few steps.</p>
          <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Ali Khan" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" name="phone" placeholder="+92 300 1234567" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Create a strong password" required />
            </div>
            <input type="hidden" name="language" value="en" />
            <div className="md:col-span-2">
              {state.error ? <p className="mb-3 text-sm text-red-600">{state.error}</p> : null}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-sm text-slate-600">
            Already have an account? <Link href="/login" className="font-medium text-blue-700">Sign in</Link>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}

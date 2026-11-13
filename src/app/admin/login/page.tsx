"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="mb-6 flex justify-center">
        <Logo href="/" subtitle="Admin" />
      </div>
      <Card className="p-8">
        <h1 className="text-3xl font-bold">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Use the authorized admin account for the Fiber Link control panel.</p>
        <form action={formAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="admin@fiberlink.example" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in…" : "Admin sign in"}
          </Button>
        </form>
        <div className="mt-6 text-sm text-slate-600">
          Return to <Link href="/login" className="font-medium text-blue-700">customer sign in</Link>
        </div>
      </Card>
    </main>
  );
}

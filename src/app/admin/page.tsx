import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Admin dashboard</h1>
      <p className="mt-4 text-slate-600">Review subscriptions, payments, packages, and operational activity.</p>
    </main>
  );
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/site-shell";

export default function DashboardPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Your dashboard</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-slate-500">Current status</p>
            <h2 className="mt-2 text-2xl font-semibold">No active subscription</h2>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-500">Payment</p>
            <h2 className="mt-2 text-2xl font-semibold">Awaiting request</h2>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-500">Next action</p>
            <h2 className="mt-2 text-2xl font-semibold">Choose a package</h2>
          </Card>
        </div>
        <div className="mt-8">
          <Button>Start a subscription</Button>
        </div>
      </section>
    </SiteShell>
  );
}

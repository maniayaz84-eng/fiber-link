import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/site-shell";

export default function CoveragePage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Coverage areas</h1>
        <p className="mt-4 text-slate-600">
          Fiber Link coverage details are configurable. Add your service areas, delivery notes, and pricing rules here.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">City coverage</h2>
            <p className="mt-3 text-slate-600">List your serviceable neighborhoods, sectors, or specific blocks.</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Installation notes</h2>
            <p className="mt-3 text-slate-600">Document lead times, building requirements, and installation readiness.</p>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}

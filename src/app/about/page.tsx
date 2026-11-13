import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">About Fiber Link</h1>
        <p className="mt-4 text-slate-600">
          Fiber Link is a modular ISP customer portal designed for Pakistani broadband operations. It keeps the application, customer flow, and payment verification visible and accountable.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Our approach</h2>
            <p className="mt-3 text-slate-600">Transparent pricing, clear package selection, and secure admin review for every payment.</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Important note</h2>
            <p className="mt-3 text-slate-600">Approval in the app does not automatically provision the physical internet line or router. That is a separate admin step.</p>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}

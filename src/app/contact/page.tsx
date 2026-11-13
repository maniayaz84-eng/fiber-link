import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">Contact Fiber Link</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          This page is intentionally written as a placeholder so real business contact information can be added later.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Phone</h2>
            <p className="mt-2 text-slate-600">+92 XXX XXXXXXX</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Email</h2>
            <p className="mt-2 text-slate-600">support@fiberlink.example</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Hours</h2>
            <p className="mt-2 text-slate-600">Mon–Sat, 9am–6pm</p>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}

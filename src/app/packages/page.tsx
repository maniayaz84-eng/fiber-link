import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/site-shell";

const packageRows = [
  { name: "Starter 20", price: "Rs. 1,499", speed: "20 Mbps", popular: false },
  { name: "Family 50", price: "Rs. 2,499", speed: "50 Mbps", popular: true },
  { name: "Business 100", price: "Rs. 4,999", speed: "100 Mbps", popular: false },
];

export default function PackagesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <Badge>Internet packages</Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">Packages available</h1>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {packageRows.map((pkg) => (
            <Card key={pkg.name} className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{pkg.name}</h2>
                {pkg.popular && <Badge>Popular</Badge>}
              </div>
              <div className="mt-4 text-3xl font-bold">{pkg.price}</div>
              <p className="mt-2 text-slate-600">{pkg.speed}</p>
              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                <li>• Unlimited data</li>
                <li>• Stable fiber connection</li>
                <li>• Monthly billing</li>
              </ul>
              <Link href="/signup" className="mt-6 inline-block w-full">
                <Button className="w-full">Choose package</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteShell } from "@/components/site-shell";

const packages = [
  { name: "Starter 20", price: "Rs. 1,499", speed: "20 Mbps" },
  { name: "Family 50", price: "Rs. 2,499", speed: "50 Mbps" },
  { name: "Business 100", price: "Rs. 4,999", speed: "100 Mbps" },
];

export default function HomePage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <Badge className="mb-4">Fast, reliable home internet</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-blue-700 sm:text-5xl">
              Reliable fiber internet for homes and businesses.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Fiber Link helps customers choose a package, submit payment proof, and track activation status in a simple,
              transparent portal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/packages">
                <Button size="lg">View Packages</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg">Create account</Button>
              </Link>
            </div>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Popular package</p>
                <h2 className="mt-1 text-2xl font-semibold text-blue-800">Family 50</h2>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-700">Rs. 2,499</span>
                <span className="text-slate-500">/ month</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• 50 Mbps download</li>
                <li>• Unlimited data</li>
                <li>• Monthly billing</li>
              </ul>
              <Link href="/packages">
                <Button className="w-full">See all offers</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Choose the right plan</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.name} className="p-6">
                <p className="text-sm text-slate-500">{pkg.speed}</p>
                <h3 className="mt-2 text-2xl font-semibold">{pkg.name}</h3>
                <div className="mt-4 text-3xl font-bold">{pkg.price}</div>
                <p className="mt-4 text-sm text-slate-600">Ideal for streaming, work-from-home, and smooth daily browsing.</p>
                <Link href="/packages" className="mt-6 inline-block">
                  <Button variant="outline" className="w-full">Compare</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            ["Choose package", "Compare speeds and monthly prices in PKR."],
            ["Send request", "Share your contact and installation details."],
            ["Upload proof", "Send the payment screenshot after the transfer."],
            ["Verification", "An admin reviews the proof before activation is marked."],
          ].map(([title, body], index) => (
            <Card key={title} className="p-5">
              <div className="mb-3 text-sm font-semibold text-blue-700">Step {index + 1}</div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{body}</p>
            </Card>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

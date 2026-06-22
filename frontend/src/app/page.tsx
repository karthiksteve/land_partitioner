"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map, Shield, Split, Brain, FileText, Layers, ChevronDown } from "lucide-react";

const features = [
  {
    icon: <Map className="h-6 w-6" />,
    title: "GIS Mapping",
    description: "Interactive parcel mapping with Google Satellite, OSM, and revenue layer support.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Rule 109 Compliance",
    description: "Full compliance with U.P. Z.A. & L.R. Act, 1950 - Rule 109 (a) to (g).",
  },
  {
    icon: <Split className="h-6 w-6" />,
    title: "Partition Engine",
    description: "AI-driven partition plan generation with 3 alternative plans (A/B/C).",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI Recommendations",
    description: "Intelligent scoring and recommendations based on 7 key metrics.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Automated Reports",
    description: "Generate Kurra, Preliminary Decree, and Final Decree automatically.",
  },
];

const steps = [
  { num: 1, title: "Add Parcel", desc: "Enter parcel details or fetch from BhuNaksha" },
  { num: 2, title: "Define Owners", desc: "Add co-owners with their share percentages" },
  { num: 3, title: "Generate Plans", desc: "AI creates 3 optimal partition plans" },
  { num: 4, title: "Compare & Select", desc: "Review scores and AI recommendations" },
  { num: 5, title: "Generate Reports", desc: "Download Kurra and legal decrees" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Split className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">GeoKurra</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1">
        <div className="container py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1 text-sm">
              <Layers className="h-4 w-4 text-primary" />
              AI-Powered Land Partition System
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Intelligent Land Partition
              <span className="block text-primary">with Rule 109 Compliance</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              GeoKurra uses artificial intelligence and GIS technology to generate fair, equitable,
              and legally compliant land partition plans following U.P. Z.A. & L.R. Act, 1950.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container pb-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold mb-10">Everything You Need</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-lg border p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-muted/50 py-20">
          <div className="container">
            <h2 className="text-center text-2xl font-bold mb-12">How It Works</h2>
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 sm:grid-cols-5">
                {steps.map((step) => (
                  <div key={step.num} className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {step.num}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 GeoKurra. All rights reserved.</p>
          <p className="mt-1">Built for compliance with U.P. Z.A. & L.R. Act, 1950</p>
        </div>
      </footer>
    </div>
  );
}

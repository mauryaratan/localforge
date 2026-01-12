"use client";

import {
  Download04Icon,
  FlashIcon,
  ShieldKeyIcon,
  SignalFullIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { navItems } from "@/lib/nav-items";

type FeatureCardProps = {
  icon: typeof ShieldKeyIcon;
  title: string;
  description: string;
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
    <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
      <HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} />
    </div>
    <div className="space-y-1">
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const features = [
  {
    icon: ShieldKeyIcon,
    title: "100% Private",
    description:
      "Your data never leaves your browser. No server uploads, no tracking, no analytics. Everything runs locally.",
  },
  {
    icon: SignalFullIcon,
    title: "Works Offline",
    description:
      "Install as a PWA and use anywhere — airplane mode, remote locations, or spotty connections. Your tools, always available.",
  },
  {
    icon: FlashIcon,
    title: "Lightning Fast",
    description:
      "No network latency. Instant results. WebAssembly-powered compression and browser-native APIs for maximum speed.",
  },
  {
    icon: Download04Icon,
    title: "Install Once",
    description:
      "Add to home screen and access 20+ tools instantly. No accounts, no sign-ups, no permissions required.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-3xl flex-col items-center gap-12">
        {/* Hero */}
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo showText={false} size="lg" />

          <div className="space-y-3">
            <h1 className="font-medium text-3xl tracking-tight md:text-4xl">
              LocalForge
            </h1>
            <p className="max-w-lg text-base text-muted-foreground leading-relaxed">
              Developer utilities that respect your privacy.{" "}
              <span className="text-foreground">
                Everything runs in your browser
              </span>{" "}
              — your data never touches a server.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge className="gap-1.5" variant="secondary">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Local-First
            </Badge>
            <Badge variant="secondary">Zero Server Uploads</Badge>
            <Badge variant="secondary">Works Offline</Badge>
          </div>
        </div>

        {/* Features */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        {/* Quick Access */}
        <div className="w-full space-y-4">
          <h2 className="text-center text-muted-foreground text-xs uppercase tracking-wider">
            20+ Tools Available
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {navItems.slice(0, 8).map((item) => (
              <Link
                className="flex items-center gap-1.5 rounded-md border border-border/50 bg-card/50 px-3 py-1.5 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
                href={item.href}
                key={item.href}
              >
                <HugeiconsIcon
                  className="text-primary"
                  icon={item.icon}
                  size={14}
                />
                <span>{item.title}</span>
              </Link>
            ))}
            <Link
              className="flex items-center gap-1.5 rounded-md border border-border/50 border-dashed px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:border-primary/50 hover:text-foreground"
              href="/json-formatter"
            >
              +{navItems.length - 8} more
            </Link>
          </div>
        </div>

        {/* CTA */}
        <p className="text-center text-muted-foreground text-xs">
          Select a tool from the sidebar to get started
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
          <span>PWA</span>
          <span className="size-1 rounded-full bg-muted-foreground/30" />
          <span>Offline-Ready</span>
        </div>
      </div>
    </div>
  );
}

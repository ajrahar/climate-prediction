"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudSun, BarChart3 } from "lucide-react";

const links = [
  { href: "/fitur", label: "Fitur" },
  { href: "/eda", label: "EDA" },
  { href: "/model", label: "Model" },
  { href: "/kota", label: "Kota" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 ring-1 ring-cyan-200">
            <CloudSun className="h-5 w-5 text-accent" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Climate<span className="text-accent">Predict</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition ${
                pathname === href
                  ? "font-medium text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white md:hidden"
        >
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </Link>
      </nav>
    </header>
  );
}

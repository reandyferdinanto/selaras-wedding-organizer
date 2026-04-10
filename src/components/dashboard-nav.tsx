"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

import type { DashboardFeature } from "@/lib/planner-data";
import type { FeatureState } from "@/lib/planner-modules";

export function DashboardNav({
  items,
  states,
}: {
  items: DashboardFeature[];
  states: Record<string, FeatureState>;
}) {
  const pathname = usePathname();

  return (
    <nav className="dashboard-nav" aria-label="Navigasi progress dashboard">
      <Link
        href="/dashboard"
        className={["dashboard-nav-link dashboard-nav-overview", pathname === "/dashboard" ? "is-active" : ""].filter(Boolean).join(" ")}
        aria-current={pathname === "/dashboard" ? "page" : undefined}
      >
        <span className="dashboard-nav-main">
          <span className="dashboard-nav-index dashboard-nav-index-icon">
            <LayoutDashboard size={14} />
          </span>
          <span className="dashboard-nav-copy">
            <span className="dashboard-nav-step">Ringkasan</span>
            <span className="dashboard-nav-title">Progress utama</span>
          </span>
        </span>
      </Link>

      {items.map((item) => {
        const active = pathname === item.href;
        const state = states[item.slug];
        const stepNumber = item.step.replace(/\D/g, "") || item.step;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={["dashboard-nav-link", active ? "is-active" : ""].filter(Boolean).join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <span className="dashboard-nav-main">
              <span className="dashboard-nav-index" aria-hidden="true">{stepNumber}</span>
              <span className="dashboard-nav-copy">
                <span className="dashboard-nav-step">{item.step}</span>
                <span className="dashboard-nav-title">{item.title}</span>
              </span>
            </span>
            {state ? (
              <span className="dashboard-nav-progress-block">
                <span className="dashboard-nav-progress-meta">
                  <span
                    className={`dashboard-status-chip dashboard-status-chip-compact dashboard-state-chip is-${state.status.replaceAll(" ", "-")}`}
                    aria-label={state.status}
                    title={state.status}
                  >
                    {state.status}
                  </span>
                  <span className="dashboard-progress-label">{state.progress}%</span>
                </span>
                <span className="dashboard-progress-track" aria-hidden="true">
                  <span className="dashboard-progress-fill" style={{ width: `${state.progress}%` }} />
                </span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

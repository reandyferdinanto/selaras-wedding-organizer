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
    <nav className="dashboard-nav">
      <Link
        href="/dashboard"
        className={["dashboard-nav-link", pathname === "/dashboard" ? "is-active" : ""].filter(Boolean).join(" ")}
      >
        <span className="dashboard-nav-step dashboard-nav-step-icon">
          <LayoutDashboard size={14} />
          Ringkasan
        </span>
        <span className="dashboard-nav-title">Lihat progres utama</span>
      </Link>

      {items.map((item) => {
        const active = pathname === item.href;
        const state = states[item.slug];

        return (
          <Link
            key={item.href}
            href={item.href}
            className={["dashboard-nav-link", active ? "is-active" : ""].filter(Boolean).join(" ")}
          >
            <div className="dashboard-nav-row">
              <span className="dashboard-nav-step">{item.step}</span>
              {state ? <span className={`dashboard-status-chip dashboard-status-chip-compact is-${state.status.replaceAll(" ", "-")}`}>{state.status}</span> : null}
            </div>
            <span className="dashboard-nav-title">{item.title}</span>
            {state ? (
              <>
                <span className="dashboard-progress-track" aria-hidden="true">
                  <span className="dashboard-progress-fill" style={{ width: `${state.progress}%` }} />
                </span>
                <span className="dashboard-progress-label">{state.progress}% selesai</span>
              </>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

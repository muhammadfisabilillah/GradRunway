"use client";

import { AlertTriangle, CheckCircle2, Flame } from "lucide-react";
import type { SimulationResult } from "@/lib/financeEngine";

interface VerdictBannerProps {
  simulation: SimulationResult;
}

function currency(value: number): string {
  return `$${Math.round(Math.abs(value)).toLocaleString("en-US")}`;
}

export default function VerdictBanner({ simulation }: VerdictBannerProps) {
  const { riskLevel, runwayDaysAfterGrad, zeroCashMonth, lowestBalance } =
    simulation;

  let tone: "safe" | "moderate" | "critical";
  let icon: typeof CheckCircle2;
  let heading: string;
  let body: string;

  if (riskLevel === "SAFE") {
    tone = "safe";
    icon = CheckCircle2;
    heading = "Safe Transition";
    body = `You have a ${runwayDaysAfterGrad}-day cash cushion after graduation. Your balance stays positive across the next 24 months.`;
  } else if (riskLevel === "MODERATE") {
    tone = "moderate";
    icon = Flame;
    heading = "Tight But Survivable";
    body = `You have about ${runwayDaysAfterGrad} days of runway after graduation. One shock — a delayed offer or a surprise bill — could tip you into the red.`;
  } else {
    tone = "critical";
    icon = AlertTriangle;
    heading = "Graduation Cliff Alert";
    body = zeroCashMonth
      ? `Your cash runs out in ${zeroCashMonth} due to upfront rent deposit and job-hunt burn. You would hit ${currency(lowestBalance)} at the low point.`
      : `Your runway is dangerously short — only ${runwayDaysAfterGrad} days of cash after graduation. Act before the deposit is due.`;
  }

  const styles: Record<typeof tone, string> = {
    safe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    moderate: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };

  const Icon = icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${styles[tone]}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-bold">{heading}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{body}</p>
      </div>
    </div>
  );
}

"use client";

import { AlertTriangle, CheckCircle2, Flame } from "lucide-react";
import type { SimulationResult } from "@/lib/financeEngine";

interface VerdictBannerProps {
  simulation: SimulationResult;
  currencySymbol?: string;
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${Math.round(Math.abs(value)).toLocaleString("en-US")}`;
}

export default function VerdictBanner({ simulation, currencySymbol = "$" }: VerdictBannerProps) {
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
      ? `Your cash runs out in ${zeroCashMonth} due to upfront rent deposit and job-hunt burn. You would hit ${formatCurrency(lowestBalance, currencySymbol)} at the low point.`
      : `Your runway is dangerously short — only ${runwayDaysAfterGrad} days of cash after graduation. Act before the deposit is due.`;
  }

  const styles: Record<typeof tone, string> = {
    safe: "border-emerald-200 bg-emerald-50 text-emerald-700",
    moderate: "border-amber-200 bg-amber-50 text-amber-700",
    critical: "border-rose-200 bg-rose-50 text-rose-700",
  };

  const Icon = icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${styles[tone]}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-bold">{heading}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{body}</p>
      </div>
    </div>
  );
}

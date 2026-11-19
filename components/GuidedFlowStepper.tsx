"use client";

import { Check } from "lucide-react";

export type GuideStage = 1 | 2 | 3;

interface GuidedFlowStepperProps {
  activeStage: GuideStage;
}

const stages = [
  { id: 1, title: "Adjust Numbers", hint: "Sliders on the left" },
  { id: 2, title: "Toggle Crisis Stress-Tests", hint: "What-if shocks" },
  { id: 3, title: "Run AI Advisor & Simulate Plan", hint: "Insights on the right" },
];

export default function GuidedFlowStepper({ activeStage }: GuidedFlowStepperProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        How to use — guided flow
      </p>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {stages.map((stage) => {
          const done = stage.id < activeStage;
          const active = stage.id === activeStage;
          return (
            <li
              key={stage.id}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 transition ${
                active
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : done
                    ? "border-slate-800 bg-slate-900/40"
                    : "border-slate-800/60 bg-transparent"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  done
                    ? "bg-emerald-500 text-emerald-950"
                    : active
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : stage.id}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-semibold ${
                    active || done ? "text-slate-100" : "text-slate-400"
                  }`}
                >
                  {stage.title}
                </span>
                <span className="block truncate text-[10px] text-slate-500">
                  {stage.hint}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

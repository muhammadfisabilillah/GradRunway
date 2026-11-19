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
    <div className="rounded-2xl border border-stone-200 bg-white p-3 sm:p-4">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
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
                  ? "border-emerald-300 bg-emerald-50"
                  : done
                    ? "border-stone-200 bg-stone-50"
                    : "border-stone-200 bg-transparent"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  done
                    ? "bg-emerald-500 text-emerald-950"
                    : active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-stone-100 text-stone-400"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : stage.id}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-semibold ${
                    active || done ? "text-stone-900" : "text-stone-500"
                  }`}
                >
                  {stage.title}
                </span>
                <span className="block truncate text-[10px] text-stone-400">
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

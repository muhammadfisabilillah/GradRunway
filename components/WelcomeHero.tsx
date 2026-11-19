"use client";

import {
  ArrowRight,
  Calculator,
  Home,
  LifeBuoy,
  PiggyBank,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface WelcomeHeroProps {
  onStartGuided: () => void;
  onExploreDemos: () => void;
}

const steps = [
  {
    icon: PiggyBank,
    title: "Enter your campus cash",
    text: "Tell us your savings, income, and monthly spend as a student.",
  },
  {
    icon: Home,
    title: "Simulate post-grad reality",
    text: "Add rent deposit, job-hunt months, and your first-job burn rate.",
  },
  {
    icon: ShieldCheck,
    title: "Stress-test risks, get a plan",
    text: "Toggle crisis shocks and let the AI advisor build a micro-saving plan.",
  },
];

export default function WelcomeHero({
  onStartGuided,
  onExploreDemos,
}: WelcomeHeroProps) {
  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-20">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 shadow-lg shadow-emerald-500/20">
          <Calculator className="h-8 w-8 text-slate-950" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Know your cash runway
          <span className="block bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            before graduation does.
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          GradRunway turns your student finances into a 24-month cash
          simulation, stress-tests the scary what-ifs, and hands you a tiny
          action plan that adds real runway days.
        </p>

        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold text-slate-600">
                  0{index + 1}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-100">
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onStartGuided}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
          >
            <Sparkles className="h-4 w-4" />
            Start Guided 3-Step Setup
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onExploreDemos}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-4 text-sm font-bold text-slate-100 transition hover:border-emerald-500/50 hover:text-emerald-300"
          >
            <LifeBuoy className="h-4 w-4" />
            Explore Instant Demo Scenarios
          </button>
        </div>

        <p className="mt-6 text-[11px] text-slate-500">
          No login. No bank data. Your numbers stay in your browser.
        </p>
      </div>
    </main>
  );
}

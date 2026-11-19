"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Landmark,
  PiggyBank,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { FinanceInputs } from "@/lib/financeEngine";

interface SetupWizardProps {
  inputs: FinanceInputs;
  onInputChange: <K extends keyof FinanceInputs>(
    key: K,
    value: FinanceInputs[K],
  ) => void;
  onFinish: () => void;
  onBack: () => void;
}

interface WizardField {
  key: keyof FinanceInputs;
  label: string;
  helper: string;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
}

const wizardSteps: {
  title: string;
  blurb: string;
  icon: typeof PiggyBank;
  fields: WizardField[];
}[] = [
  {
    title: "Current Campus Finances",
    blurb:
      "Where you stand right now as a student. Be honest — small gaps here change the whole picture.",
    icon: PiggyBank,
    fields: [
      {
        key: "currentSavings",
        label: "Current savings",
        helper: "Cash you could touch today if something went wrong.",
        min: 0,
        max: 20000,
        step: 100,
        prefix: "$",
      },
      {
        key: "monthlyStudentIncome",
        label: "Monthly student income",
        helper: "Allowance, part-time work, or side gigs while on campus.",
        min: 0,
        max: 3000,
        step: 50,
        prefix: "$",
      },
      {
        key: "monthlyStudentSpend",
        label: "Monthly student spend",
        helper: "Everything you spend in a normal month on campus.",
        min: 0,
        max: 3000,
        step: 50,
        prefix: "$",
      },
    ],
  },
  {
    title: "Graduation & Job Hunt Reality",
    blurb:
      "The transition gap. Your deposit is due before your first salary lands.",
    icon: Landmark,
    fields: [
      {
        key: "monthsUntilGraduation",
        label: "Months until graduation",
        helper: "How many months until you walk the stage?",
        min: 1,
        max: 24,
        step: 1,
        suffix: " mo",
      },
      {
        key: "jobSearchMonths",
        label: "Expected job search",
        helper: "Realistic months hunting before your first paycheck.",
        min: 0,
        max: 9,
        step: 1,
        suffix: " mo",
      },
      {
        key: "upfrontMovingDeposit",
        label: "Upfront moving deposit",
        helper: "Security deposit plus first-month rent due at move-in.",
        min: 0,
        max: 8000,
        step: 100,
        prefix: "$",
      },
    ],
  },
  {
    title: "First Job Reality",
    blurb:
      "What your new life costs. If unsure, start with the defaults and adjust.",
    icon: Wallet,
    fields: [
      {
        key: "expectedStartingSalary",
        label: "Expected starting salary",
        helper: "Your expected gross monthly pay in your first role.",
        min: 0,
        max: 8000,
        step: 100,
        prefix: "$",
      },
      {
        key: "postGradMonthlyCost",
        label: "Post-grad monthly cost",
        helper: "Rent, food, transport, and bills once you move out.",
        min: 0,
        max: 6000,
        step: 50,
        prefix: "$",
      },
      {
        key: "monthlyLoanRepayment",
        label: "Monthly loan repayment",
        helper: "Fixed student-loan payment due every month.",
        min: 0,
        max: 1500,
        step: 25,
        prefix: "$",
      },
    ],
  },
];

export default function SetupWizard({
  inputs,
  onInputChange,
  onFinish,
  onBack,
}: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const current = wizardSteps[step];
  const isLast = step === wizardSteps.length - 1;

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-stone-500 transition hover:text-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to welcome
        </button>

        <div className="mb-6 flex items-center justify-between gap-2">
          {wizardSteps.map((s, index) => (
            <div key={s.title} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  index < step
                    ? "bg-emerald-500 text-emerald-950"
                    : index === step
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-stone-100 text-stone-400"
                }`}
              >
                {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              {index < wizardSteps.length - 1 && (
                <span
                  className={`h-0.5 flex-1 rounded-full ${
                    index < step ? "bg-emerald-500" : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="mb-1 flex items-center gap-2">
            <current.icon className="h-5 w-5 text-emerald-400" />
            <h2 className="font-serif text-lg font-bold tracking-tight">
              {current.title}
            </h2>
          </div>
          <p className="mb-6 text-xs leading-relaxed text-stone-500">
            {current.blurb}
          </p>

          <div className="flex flex-col gap-5">
            {current.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-medium text-stone-700">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-1">
                    <span className="text-xs text-stone-400">
                      {field.prefix ?? ""}
                    </span>
                    <input
                      type="number"
                      value={inputs[field.key] as number}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      onChange={(e) =>
                        onInputChange(
                          field.key,
                          Number(e.target.value) as FinanceInputs[typeof field.key],
                        )
                      }
                      className="w-16 bg-transparent text-right text-xs font-semibold text-stone-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="text-xs text-stone-400">
                      {field.suffix ?? ""}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={inputs[field.key] as number}
                  onChange={(e) =>
                    onInputChange(
                      field.key,
                      Number(e.target.value) as FinanceInputs[typeof field.key],
                    )
                  }
                  className="w-full"
                />
                <p className="text-[11px] leading-relaxed text-stone-400">
                  {field.helper}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400"
            >
              {isLast ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Reveal My 24-Month Runway
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-stone-400">
          Step {step + 1} of {wizardSteps.length} — you can change everything
          later.
        </p>
      </div>
    </main>
  );
}

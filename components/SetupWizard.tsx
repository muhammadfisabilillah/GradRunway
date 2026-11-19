"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PiggyBank,
  Sparkles,
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
  lang?: "en" | "id";
}

const t = {
  en: {
    back: "Back to welcome",
    backBtn: "Back",
    next: "Next",
    finish: "Reveal My 24-Month Runway",
    step: "Step",
    of: "of",
    changeLater: "you can change everything later.",
    steps: [
      {
        title: "Current Campus Finances",
        blurb: "Where you stand right now as a student. Be honest — small gaps here change the whole picture.",
        fields: [
          { label: "Current savings", helper: "Cash you could touch today if something went wrong." },
          { label: "Monthly student income", helper: "Allowance, part-time work, or side gigs while on campus." },
          { label: "Monthly student spend", helper: "Everything you spend in a normal month on campus." },
        ],
      },
      {
        title: "Graduation & Job Hunt Reality",
        blurb: "The transition gap. Your deposit is due before your first salary lands.",
        fields: [
          { label: "Months until graduation", helper: "How many months until you walk the stage?" },
          { label: "Expected job search", helper: "Realistic months hunting before your first paycheck." },
          { label: "Upfront moving deposit", helper: "Security deposit plus first-month rent due at move-in." },
        ],
      },
      {
        title: "First Job Reality",
        blurb: "What your new life costs. If unsure, start with the defaults and adjust.",
        fields: [
          { label: "Expected starting salary", helper: "Your expected gross monthly pay in your first role." },
          { label: "Post-grad monthly cost", helper: "Rent, food, transport, and bills once you move out." },
          { label: "Monthly loan repayment", helper: "Fixed student-loan payment due every month." },
        ],
      },
    ],
  },
  id: {
    back: "Kembali ke awal",
    backBtn: "Kembali",
    next: "Lanjut",
    finish: "Lihat Runway 24 Bulan Saya",
    step: "Langkah",
    of: "dari",
    changeLater: "kamu bisa ubah semuanya nanti.",
    steps: [
      {
        title: "Keuangan Kampus Saat Ini",
        blurb: "Posisi kamu sekarang sebagai mahasiswa. Jujur — selisih kecil di sini mengubah gambaran besar.",
        fields: [
          { label: "Tabungan saat ini", helper: "Uang yang bisa kamu ambil hari ini kalau darurat." },
          { label: "Penghasilan bulanan mahasiswa", helper: "Uang bulanan, kerja part-time, atau side gig di kampus." },
          { label: "Pengeluaran bulanan mahasiswa", helper: "Semua yang kamu belanjakan dalam sebulan di kampus." },
        ],
      },
      {
        title: "Kelulusan & Realitas Job Hunt",
        blurb: "Masa transisi. Deposit jatuh tempo sebelum gaji pertama cair.",
        fields: [
          { label: "Bulan menuju kelulusan", helper: "Berapa bulan lagi sampai kamu wisuda?" },
          { label: "Perkiraan job search", helper: "Realistis berapa bulan mencari kerja sebelum gaji pertama." },
          { label: "Deposit pindahan di muka", helper: "Deposit keamanan plus sewa bulan pertama saat pindah." },
        ],
      },
      {
        title: "Realitas Kerja Pertama",
        blurb: "Berapa biaya hidup baru kamu. Kalau ragu, mulai dari default dan sesuaikan.",
        fields: [
          { label: "Perkiraan gaji awal", helper: "Perkiraan gaji kotor bulanan di posisi pertama." },
          { label: "Biaya bulanan pasca-lulus", helper: "Sewa, makan, transportasi, dan tagihan setelah pindah." },
          { label: "Cicilan pinjaman bulanan", helper: "Pembayaran pinjaman mahasiswa tetap setiap bulan." },
        ],
      },
    ],
  },
};

export default function SetupWizard({
  inputs,
  onInputChange,
  onFinish,
  onBack,
  lang = "en",
}: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const tx = t[lang];
  const current = tx.steps[step];
  const isLast = step === tx.steps.length - 1;

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-stone-500 transition hover:text-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" />
          {tx.back}
        </button>

        <div className="mb-6 flex items-center justify-between gap-2">
          {tx.steps.map((s, index) => (
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
              {index < tx.steps.length - 1 && (
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
            <PiggyBank className="h-5 w-5 text-emerald-400" />
            <h2 className="font-serif text-lg font-bold tracking-tight">
              {current.title}
            </h2>
          </div>
          <p className="mb-6 text-xs leading-relaxed text-stone-500">
            {current.blurb}
          </p>

          <div className="flex flex-col gap-5">
            {current.fields.map((field, fieldIndex) => {
              const fieldKeys = [
                "currentSavings", "monthlyStudentIncome", "monthlyStudentSpend",
              ] as const;
              const step2Keys = [
                "monthsUntilGraduation", "jobSearchMonths", "upfrontMovingDeposit",
              ] as const;
              const step3Keys = [
                "expectedStartingSalary", "postGradMonthlyCost", "monthlyLoanRepayment",
              ] as const;
              const allKeys = step === 0 ? [...fieldKeys] : step === 1 ? [...step2Keys] : [...step3Keys];
              const fieldKey = allKeys[fieldIndex];
              const isMoney = fieldKey !== "monthsUntilGraduation" && fieldKey !== "jobSearchMonths";
              const prefix = isMoney ? "$" : "";
              const suffix = fieldKey === "monthsUntilGraduation" || fieldKey === "jobSearchMonths" ? " mo" : "";
              const minVal = fieldKey === "monthsUntilGraduation" ? 1 : fieldKey === "jobSearchMonths" ? 0 : fieldKey === "currentSavings" ? 0 : fieldKey === "upfrontMovingDeposit" ? 0 : 0;
              const maxVal = fieldKey === "monthsUntilGraduation" ? 24 : fieldKey === "jobSearchMonths" ? 9 : fieldKey === "currentSavings" ? 20000 : fieldKey === "upfrontMovingDeposit" ? 8000 : fieldKey === "monthlyLoanRepayment" ? 1500 : fieldKey === "postGradMonthlyCost" ? 6000 : 8000;
              const stepVal = fieldKey === "monthsUntilGraduation" || fieldKey === "jobSearchMonths" ? 1 : fieldKey === "monthlyLoanRepayment" ? 25 : fieldKey === "monthlyStudentIncome" || fieldKey === "monthlyStudentSpend" || fieldKey === "postGradMonthlyCost" ? 50 : 100;

              return (
                <div key={field.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-medium text-stone-700">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2 py-1">
                      {prefix && <span className="text-xs text-stone-400">{prefix}</span>}
                      <input
                        type="number"
                        value={inputs[fieldKey] as number}
                        min={minVal}
                        max={maxVal}
                        step={stepVal}
                        onChange={(e) =>
                          onInputChange(
                            fieldKey,
                            Number(e.target.value) as FinanceInputs[typeof fieldKey],
                          )
                        }
                        className="w-16 bg-transparent text-right text-xs font-semibold text-stone-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      {suffix && <span className="text-xs text-stone-400">{suffix}</span>}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={minVal}
                    max={maxVal}
                    step={stepVal}
                    value={inputs[fieldKey] as number}
                    onChange={(e) =>
                      onInputChange(
                        fieldKey,
                        Number(e.target.value) as FinanceInputs[typeof fieldKey],
                      )
                    }
                    className="w-full"
                  />
                  <p className="text-[11px] leading-relaxed text-stone-400">
                    {field.helper}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              {tx.backBtn}
            </button>
            <button
              type="button"
              onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400"
            >
              {isLast ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  {tx.finish}
                </>
              ) : (
                <>
                  {tx.next}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-stone-400">
          {tx.step} {step + 1} {tx.of} {tx.steps.length} — {tx.changeLater}
        </p>
      </div>
    </main>
  );
}

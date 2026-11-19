export interface FinanceInputs {
  currentSavings: number;
  monthlyStudentIncome: number;
  monthlyStudentSpend: number;
  monthsUntilGraduation: number;
  expectedStartingSalary: number;
  jobSearchMonths: number;
  postGradMonthlyCost: number;
  upfrontMovingDeposit: number;
  monthlyLoanRepayment: number;
  delayedJobOffer: boolean;
  salaryCut20Percent: boolean;
  emergencyShock: boolean;
}

export type Phase = "Campus" | "Job Hunt" | "Employed";

export interface MonthlyPoint {
  monthIndex: number;
  monthLabel: string;
  balance: number;
  baselineBalance?: number;
  phase: Phase;
  netCashflow: number;
}

export type RiskLevel = "SAFE" | "MODERATE" | "CRITICAL";

export interface SimulationResult {
  timeline: MonthlyPoint[];
  zeroCashMonth: string | null;
  lowestBalance: number;
  postGradBurnRate: number;
  runwayDaysAfterGrad: number;
  readinessScore: number;
  riskLevel: RiskLevel;
}

export const DEFAULT_INPUTS: FinanceInputs = {
  currentSavings: 3200,
  monthlyStudentIncome: 650,
  monthlyStudentSpend: 550,
  monthsUntilGraduation: 6,
  expectedStartingSalary: 2400,
  jobSearchMonths: 3,
  postGradMonthlyCost: 1650,
  upfrontMovingDeposit: 2200,
  monthlyLoanRepayment: 200,
  delayedJobOffer: false,
  salaryCut20Percent: false,
  emergencyShock: false,
};

const TOTAL_MONTHS = 24;
const EMERGENCY_COST = 1500;
const EMERGENCY_MONTH_AFTER_GRAD = 2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function monthLabel(monthIndex: number, monthsUntilGraduation: number): string {
  const graduationMonth = Math.max(1, Math.round(monthsUntilGraduation));
  if (monthIndex <= graduationMonth) {
    const remaining = graduationMonth - monthIndex;
    return remaining === 0 ? "Grad Mo." : `M-${remaining}`;
  }
  return `M+${monthIndex - graduationMonth}`;
}

function deriveParams(inputs: FinanceInputs) {
  const gradMonth = clamp(Math.round(inputs.monthsUntilGraduation), 1, 24);
  const baseJobSearch = clamp(Math.round(inputs.jobSearchMonths), 0, 9);
  const jobSearchMonths = inputs.delayedJobOffer
    ? baseJobSearch + 2
    : baseJobSearch;
  const salaryFactor = inputs.salaryCut20Percent ? 0.8 : 1;
  const monthlySalaryNet = inputs.expectedStartingSalary * salaryFactor;
  const studentNet = inputs.monthlyStudentIncome - inputs.monthlyStudentSpend;
  const postGradBurnRate = inputs.postGradMonthlyCost + inputs.monthlyLoanRepayment;
  return {
    gradMonth,
    jobSearchMonths,
    monthlySalaryNet,
    studentNet,
    postGradBurnRate,
  };
}

export function simulateTimeline(
  inputs: FinanceInputs,
  extraMonthlySaving = 0,
): SimulationResult {
  const { gradMonth, jobSearchMonths, monthlySalaryNet, studentNet, postGradBurnRate } =
    deriveParams(inputs);

  const employedStartMonth = gradMonth + jobSearchMonths;
  const extra = Math.max(0, extraMonthlySaving);

  let balance = inputs.currentSavings;
  const timeline: MonthlyPoint[] = [];
  let zeroCashMonth: string | null = null;
  let lowestBalance = inputs.currentSavings;

  for (let monthIndex = 1; monthIndex <= TOTAL_MONTHS; monthIndex += 1) {
    let phase: Phase;
    let netCashflow: number;

    if (monthIndex <= gradMonth) {
      phase = "Campus";
      netCashflow = studentNet;
    } else if (monthIndex <= employedStartMonth) {
      phase = "Job Hunt";
      const isFirstJobHuntMonth = monthIndex === gradMonth + 1;
      const deposit = isFirstJobHuntMonth ? inputs.upfrontMovingDeposit : 0;
      netCashflow = -postGradBurnRate - deposit;
    } else {
      phase = "Employed";
      netCashflow = monthlySalaryNet - postGradBurnRate;
    }

    if (
      inputs.emergencyShock &&
      monthIndex === gradMonth + EMERGENCY_MONTH_AFTER_GRAD
    ) {
      netCashflow -= EMERGENCY_COST;
    }

    netCashflow += extra;
    balance += netCashflow;

    const label = monthLabel(monthIndex, gradMonth);
    if (zeroCashMonth === null && balance <= 0) {
      zeroCashMonth = label;
    }
    lowestBalance = Math.min(lowestBalance, balance);

    timeline.push({
      monthIndex,
      monthLabel: label,
      balance: round2(balance),
      phase,
      netCashflow: round2(netCashflow),
    });
  }

  const gradPoint = timeline.find((p) => p.monthIndex === gradMonth);
  const cashAtGrad = gradPoint ? gradPoint.balance : inputs.currentSavings;
  const deployableCash = Math.max(0, cashAtGrad - inputs.upfrontMovingDeposit);
  const runwayDaysAfterGrad =
    postGradBurnRate > 0
      ? Math.round((deployableCash / postGradBurnRate) * 30)
      : 0;

  const readinessScore = computeReadinessScore({
    lowestBalance,
    runwayDaysAfterGrad,
    postGradBurnRate,
    cashAtGrad,
    zeroCashMonth,
  });

  const riskLevel: RiskLevel =
    readinessScore >= 70 ? "SAFE" : readinessScore >= 40 ? "MODERATE" : "CRITICAL";

  return {
    timeline,
    zeroCashMonth,
    lowestBalance: round2(lowestBalance),
    postGradBurnRate: round2(postGradBurnRate),
    runwayDaysAfterGrad,
    readinessScore,
    riskLevel,
  };
}

function computeReadinessScore(params: {
  lowestBalance: number;
  runwayDaysAfterGrad: number;
  postGradBurnRate: number;
  cashAtGrad: number;
  zeroCashMonth: string | null;
}): number {
  const { lowestBalance, runwayDaysAfterGrad, postGradBurnRate, cashAtGrad, zeroCashMonth } =
    params;

  const runwayScore = clamp((runwayDaysAfterGrad / 180) * 50, 0, 50);
  const bufferMonths = postGradBurnRate > 0 ? cashAtGrad / postGradBurnRate : 6;
  const bufferScore = clamp((bufferMonths / 6) * 30, 0, 30);
  const cliffPenalty = lowestBalance < 0 ? 25 : 0;
  const zeroPenalty = zeroCashMonth ? 10 : 0;

  const raw = runwayScore + bufferScore - cliffPenalty - zeroPenalty;
  return Math.round(clamp(raw, 0, 100));
}

export function simulateImprovedTimeline(
  inputs: FinanceInputs,
  extraMonthlySaving: number,
): MonthlyPoint[] {
  return simulateTimeline(inputs, extraMonthlySaving).timeline;
}

export function withBaseline(
  inputs: FinanceInputs,
  baseline: SimulationResult,
  extraMonthlySaving: number,
): MonthlyPoint[] {
  const improved = simulateImprovedTimeline(inputs, extraMonthlySaving);
  return improved.map((point) => ({
    ...point,
    baselineBalance:
      baseline.timeline.find((b) => b.monthIndex === point.monthIndex)?.balance ??
      point.balance,
  }));
}

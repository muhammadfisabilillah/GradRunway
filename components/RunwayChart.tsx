"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyPoint } from "@/lib/financeEngine";

interface RunwayChartProps {
  timeline: MonthlyPoint[];
  comparison?: MonthlyPoint[] | null;
  showComparison?: boolean;
  currencySymbol?: string;
}

const phaseColor: Record<MonthlyPoint["phase"], string> = {
  Campus: "#38bdf8",
  "Job Hunt": "#fbbf24",
  Employed: "#34d399",
};

interface ChartDatum {
  monthLabel: string;
  balance: number;
  baselineBalance?: number;
}

function currency(value: number, symbol = "$"): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${symbol}${Math.abs(Math.round(value)).toLocaleString("en-US")}`;
}

export default function RunwayChart({
  timeline,
  comparison,
  showComparison = false,
  currencySymbol = "$",
}: RunwayChartProps) {
  const data: ChartDatum[] = useMemo(() => {
    return timeline.map((point) => {
      const comparisonPoint = comparison?.find(
        (c) => c.monthIndex === point.monthIndex,
      );
      return {
        monthLabel: point.monthLabel,
        balance: point.balance,
        baselineBalance: comparisonPoint?.balance,
      };
    });
  }, [timeline, comparison]);

  const showBaseline = showComparison && comparison && comparison.length > 0;

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "#34d399" }}
          />
          Projected balance
        </span>
        {showBaseline && (
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#a78bfa" }}
            />
            With micro-action savings
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />
          Campus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
          Job hunt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Employed
        </span>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="baselineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fill: "#78716c", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#d6d3d1" }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tick={{ fill: "#78716c", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#d6d3d1" }}
              tickFormatter={(value: number) => currency(value, currencySymbol)}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #d6d3d1",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "#1c1917", fontWeight: 600 }}
              formatter={(value: number, name: string) => [
                currency(value, currencySymbol),
                name === "baselineBalance" ? "Micro-action plan" : "Projected balance",
              ]}
            />
            <ReferenceLine
              y={0}
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              label={{
                value: "Bankruptcy cliff",
                position: "insideBottomLeft",
                fill: "#fb7185",
                fontSize: 11,
              }}
            />
            {showBaseline && (
              <Area
                type="monotone"
                dataKey="baselineBalance"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#baselineFill)"
                dot={false}
              />
            )}
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#34d399"
              strokeWidth={2.5}
              fill="url(#balanceFill)"
              dot={false}
              activeDot={{ r: 4, fill: phaseColor.Employed }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

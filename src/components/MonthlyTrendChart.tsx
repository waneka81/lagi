import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { MonthlyTrendItem } from '../types';

interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[];
  year: number;
  onBarClick?: (item: MonthlyTrendItem) => void;
}

const CustomBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#94a3b8"
      textAnchor="middle"
      fontSize={10}
      fontFamily="JetBrains Mono, monospace"
    >
      {value}k
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const actualData = payload.find((p: any) => p.dataKey === 'actual');
    const targetData = payload.find((p: any) => p.dataKey === 'target');
    const actual = actualData?.value;
    const target = targetData?.value;
    const isProjected = label?.includes('*') || actual === null || actual === undefined;

    return (
      <div className="bg-[#0b1324] border border-[#1e2f50] rounded-lg p-3 shadow-xl text-xs backdrop-blur-md">
        <div className="font-semibold text-slate-200 mb-1 flex items-center justify-between gap-3 border-b border-slate-700/60 pb-1">
          <span>Bulan: {label}</span>
          {isProjected && (
            <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-600/40 px-1.5 py-0.5 rounded">
              Proyeksi
            </span>
          )}
        </div>

        <div className="space-y-1 mt-1.5 font-mono">
          <div className="flex items-center justify-between gap-4 text-cyan-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#38bdf8]"></span>
              Actual:
            </span>
            <span className="font-bold">
              {actual !== null && actual !== undefined ? `${actual}.000 Unit` : 'Belum Ada Data'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-amber-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fb923c]"></span>
              Target:
            </span>
            <span className="font-bold">
              {target ? `${target}.000 Unit` : '-'}
            </span>
          </div>

          {actual !== null && actual !== undefined && target && (
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-slate-300">
              <span>Pencapaian:</span>
              <span
                className={`font-semibold ${
                  actual >= target ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {((actual / target) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
  year,
  onBarClick
}) => {
  return (
    <div className="bg-[#121f37] border border-[#1d2f52] rounded-lg p-5 flex flex-col h-full shadow-lg shadow-black/20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h3 className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 uppercase">
          4. TREN DISTRIBUSI PER BULAN TAHUN BERJALAN (YTD {year})
        </h3>
      </div>

      {/* Embedded Chart Legend matching layout screenshot */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mb-2 pl-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center">
            <span className="w-3 h-0.5 bg-[#f59e0b]"></span>
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] -ml-1.5"></span>
          </span>
          <span className="text-[11px] text-slate-300 font-medium">Target Distribusi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#38bdf8] rounded-xs"></span>
          <span className="text-[11px] text-slate-300 font-medium">Actual Distribusi (rb Unit)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full flex-1 min-h-[250px] sm:min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0 && onBarClick) {
                onBarClick(state.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 140]}
              ticks={[0, 20, 40, 60, 80, 100, 120, 140]}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Cyan Bar for Actuals */}
            <Bar
              dataKey="actual"
              fill="#38bdf8"
              radius={[3, 3, 0, 0]}
              barSize={24}
              label={<CustomBarLabel />}
            />

            {/* Orange Line for Target with connected dots */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ fill: '#f59e0b', stroke: '#0b1324', strokeWidth: 1.5, r: 4 }}
              activeDot={{ r: 6, fill: '#fbbf24' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

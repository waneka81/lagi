import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DepoShareItem } from '../types';

interface DepoDistributionChartProps {
  data: DepoShareItem[];
  selectedDepo?: string;
  onSelectDepo?: (depoName: string) => void;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value
}: any) => {
  const RADIAN = Math.PI / 180;
  // Position the label inside the donut slice
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (value < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
      fontFamily="JetBrains Mono, monospace"
      style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }}
    >
      {`${value}%`}
    </text>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item: DepoShareItem = payload[0].payload;
    return (
      <div className="bg-[#0b1324] border border-[#1e2f50] rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md">
        <div className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-xs"
            style={{ backgroundColor: item.color }}
          ></span>
          <span>{item.depo}</span>
        </div>
        <div className="text-slate-300 font-mono space-y-0.5">
          <div>Porsi: <span className="font-bold text-white">{item.percentage}%</span></div>
          {item.volumeUnit && (
            <div>Volume: <span className="text-cyan-400">{item.volumeUnit.toLocaleString('id-ID')} Unit</span></div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const DepoDistributionChart: React.FC<DepoDistributionChartProps> = ({
  data,
  selectedDepo = 'Semua Depo',
  onSelectDepo
}) => {
  return (
    <div className="bg-[#121f37] border border-[#1d2f52] rounded-lg p-5 flex flex-col h-full shadow-lg shadow-black/20">
      {/* Title */}
      <h3 className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 uppercase mb-4">
        6. PROSENTASE DISTRIBUSI PER DEPO
      </h3>

      {/* Donut Chart & Legend layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1">
        {/* Donut graphic */}
        <div className="md:col-span-6 h-[220px] sm:h-[250px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                dataKey="percentage"
                labelLine={false}
                label={renderCustomizedLabel}
                onClick={(entry: any) => {
                  if (onSelectDepo && entry && entry.depo) {
                    onSelectDepo(entry.depo === selectedDepo ? 'Semua Depo' : entry.depo);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                {data.map((entry, index) => {
                  const isSelected = selectedDepo === entry.depo;
                  const isFiltered = selectedDepo !== 'Semua Depo' && !isSelected;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={isFiltered ? 0.35 : 1}
                      stroke={isSelected ? '#ffffff' : '#0e1726'}
                      strokeWidth={isSelected ? 2.5 : 1}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List on Right */}
        <div className="md:col-span-6 flex flex-col justify-center space-y-3.5 pl-0 md:pl-2">
          {data.map((item) => {
            const isSelected = selectedDepo === item.depo;
            return (
              <button
                key={item.depo}
                type="button"
                onClick={() => onSelectDepo && onSelectDepo(isSelected ? 'Semua Depo' : item.depo)}
                className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded transition-colors group cursor-pointer ${
                  isSelected ? 'bg-cyan-950/50 border border-cyan-500/40' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-xs shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className={`font-medium ${isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-300'}`}>
                    {item.depo}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-200">
                  {item.percentage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

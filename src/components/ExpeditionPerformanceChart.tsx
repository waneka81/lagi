import React, { useState } from 'react';
import { ExpeditionPerformanceItem } from '../types';

interface ExpeditionPerformanceChartProps {
  data: ExpeditionPerformanceItem[];
  onSelectExpedition?: (item: ExpeditionPerformanceItem) => void;
}

export const ExpeditionPerformanceChart: React.FC<ExpeditionPerformanceChartProps> = ({
  data,
  onSelectExpedition
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Maximum value for scaling (default max ticks around 450)
  const maxAxis = 450;
  const ticks = [0, 100, 200, 300, 400];

  return (
    <div className="bg-[#121f37] border border-[#1d2f52] rounded-lg p-5 shadow-lg shadow-black/20 flex flex-col">
      {/* Title */}
      <h3 className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 uppercase mb-4">
        8. PERFORMANCE KONTRIBUSI &amp; KUOTA PER EKSPEDISI (REALSASI VS ALOKASI KUOTA)
      </h3>

      {/* Main Chart Area */}
      <div className="relative pt-2 pb-6 px-1 flex-1">
        {/* Vertical grid lines corresponding to ticks */}
        <div className="absolute inset-0 left-28 sm:left-36 right-4 sm:right-28 pointer-events-none">
          {ticks.map((tick) => {
            const leftPercent = (tick / maxAxis) * 100;
            return (
              <div
                key={tick}
                className="absolute top-0 bottom-6 border-l border-[#1e293b] border-dashed"
                style={{ left: `${leftPercent}%` }}
              >
                <span className="absolute bottom-[-22px] -translate-x-1/2 text-[10px] sm:text-xs text-slate-500 font-mono">
                  {tick}
                </span>
              </div>
            );
          })}
        </div>

        {/* Rows for each expedition */}
        <div className="space-y-4 sm:space-y-5 relative z-10 mb-6">
          {data.map((item, idx) => {
            const realisasiPercent = Math.min(100, (item.realisasi / maxAxis) * 100);
            const kuotaPercent = Math.min(100, (item.kuotaAlokasi / maxAxis) * 100);
            const isExceeded = item.capaian >= 100;
            const isHovered = hoveredIdx === idx;

            // Color coding for achievement label matching screenshot
            const achievementColor =
              item.capaian >= 102
                ? 'text-emerald-400'
                : item.capaian >= 96
                ? 'text-cyan-400'
                : 'text-amber-400';

            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectExpedition && onSelectExpedition(item)}
                className={`group cursor-pointer rounded p-1 transition-colors ${
                  isHovered ? 'bg-slate-800/40' : ''
                }`}
              >
                <div className="flex items-center">
                  {/* Left Expedition Name */}
                  <div className="w-28 sm:w-36 pr-3 text-right shrink-0">
                    <span className="text-[11px] sm:text-xs font-medium text-slate-300 group-hover:text-cyan-300 transition-colors block truncate">
                      {item.name}
                    </span>
                  </div>

                  {/* Horizontal Bars & Annotation */}
                  <div className="flex-1 relative flex items-center h-9">
                    {/* The Bar Track */}
                    <div className="w-full relative h-7 flex flex-col justify-center">
                      {/* Kuota Bar (Slate / Dark Steel) */}
                      <div
                        className="h-2.5 bg-[#26354a] rounded-xs transition-all duration-500 relative"
                        style={{ width: `${kuotaPercent}%` }}
                      ></div>

                      {/* Realisasi Bar (Bright Mint / Emerald Green) */}
                      <div
                        className="h-2.5 bg-[#34d399] -mt-1.5 rounded-xs transition-all duration-500 shadow-xs shadow-emerald-500/20"
                        style={{ width: `${realisasiPercent}%` }}
                      ></div>
                    </div>

                    {/* Annotation label to the right of the bars */}
                    <div
                      className="shrink-0 pl-3 whitespace-nowrap text-[10px] sm:text-[11px] font-mono font-medium transition-all"
                    >
                      <span className={achievementColor}>
                        Capaian: {item.capaian.toFixed(1)}% | OTD: {item.otd.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded details when hovered */}
                {isHovered && (
                  <div className="ml-28 sm:ml-36 pl-3 mt-1 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>Realisasi: <strong className="text-emerald-300">{item.realisasi}k Unit</strong></span>
                    <span>Kuota Alokasi: <strong className="text-slate-200">{item.kuotaAlokasi}k Unit</strong></span>
                    <span>Status SLA: <strong className={isExceeded ? 'text-emerald-400' : 'text-amber-400'}>{item.status || 'Normal'}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Right Legend Box matching screenshot */}
      <div className="flex justify-end mt-2 pt-2 border-t border-slate-800/80">
        <div className="bg-[#0e1728] border border-[#1e2d4d] rounded-md px-3 py-2 flex flex-col gap-1.5 text-[11px] font-medium text-slate-300 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-2 bg-[#26354a] rounded-xs inline-block"></span>
            <span>Kuota Alokasi (rb Unit)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-2 bg-[#34d399] rounded-xs inline-block"></span>
            <span>Realisasi Distribusi (rb Unit)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface KpiCardProps {
  numberPrefix?: string;
  title: string;
  value: string;
  unit: string;
  subtext: string;
  badgeText: string;
  badgeType?: 'green' | 'blue' | 'yellow' | 'red';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  numberPrefix,
  title,
  value,
  unit,
  subtext,
  badgeText,
  badgeType = 'green',
  onClick
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'green':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'blue':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/30';
      case 'yellow':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30';
      case 'red':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/30';
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#121f37] hover:bg-[#152542] border border-[#1d2f52] hover:border-cyan-500/40 rounded-lg p-4 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20 flex flex-col justify-between relative group"
    >
      {/* Top row: Title and Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-300 uppercase">
          {numberPrefix ? `${numberPrefix}. ` : ''}{title}
        </span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded font-medium border shrink-0 ${getBadgeStyle()}`}
        >
          {badgeText}
        </span>
      </div>

      {/* Middle row: Big Metric Value & Unit */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl sm:text-3xl xl:text-4xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {unit}
        </span>
      </div>

      {/* Bottom row: Target / Baseline subtext */}
      <div className="text-[11px] text-slate-400 font-normal">
        {subtext}
      </div>

      {/* Subtle hover indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-cyan-400">
        Detail ↗
      </div>
    </div>
  );
};

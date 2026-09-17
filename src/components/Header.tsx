import React from 'react';
import { Upload, Download, RotateCcw, Table, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { FilterState } from '../types';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onOpenUpload: () => void;
  onDownloadTemplate: () => void;
  onOpenDataViewer: () => void;
  onResetData: () => void;
  fileName?: string;
  isCustomData?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  onOpenUpload,
  onDownloadTemplate,
  onOpenDataViewer,
  onResetData,
  fileName,
  isCustomData
}) => {
  const months = [
    'Semua Bulan',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  const depos = [
    'Semua Depo',
    'Depo Jakarta',
    'Depo Surabaya',
    'Depo Medan',
    'Depo Makassar',
    'Depo Semarang'
  ];

  return (
    <header className="mb-6 space-y-4">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Title & Subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight uppercase">
            EXECUTIVE DISTRIBUTION &amp; LOGISTICS DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span>Ringkasan Kinerja Distribusi YTD, MTD, NRFS, OTD &amp; Ekspedisi</span>
            {isCustomData && (
              <span className="inline-flex items-center gap-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                Sumber: {fileName}
              </span>
            )}
          </p>
        </div>

        {/* Right Action & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Filter: Tahun */}
          <div className="relative">
            <select
              value={filters.year}
              onChange={(e) => onFilterChange({ year: Number(e.target.value) })}
              className="appearance-none bg-[#121f37] hover:bg-[#162644] text-slate-200 border border-[#1e2f50] rounded-md px-3.5 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-500 transition-colors pr-7 cursor-pointer shadow-sm"
            >
              <option value={2026}>Tahun: 2026</option>
              <option value={2025}>Tahun: 2025</option>
              <option value={2024}>Tahun: 2024</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Filter: Bulan */}
          <div className="relative">
            <select
              value={filters.month}
              onChange={(e) => onFilterChange({ month: e.target.value })}
              className="appearance-none bg-[#121f37] hover:bg-[#162644] text-slate-200 border border-[#1e2f50] rounded-md px-3.5 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-500 transition-colors pr-7 cursor-pointer shadow-sm"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  Bulan: {m}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Filter: Depo */}
          <div className="relative">
            <select
              value={filters.depo}
              onChange={(e) => onFilterChange({ depo: e.target.value })}
              className="appearance-none bg-[#121f37] hover:bg-[#162644] text-slate-200 border border-[#1e2f50] rounded-md px-3.5 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-500 transition-colors pr-7 cursor-pointer shadow-sm"
            >
              {depos.map((d) => (
                <option key={d} value={d}>
                  Depo: {d}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>

          {/* Action: Upload Excel/CSV */}
          <button
            onClick={onOpenUpload}
            type="button"
            className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-md text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Excel / CSV</span>
          </button>

          {/* Action: Download Sample Template */}
          <button
            onClick={onDownloadTemplate}
            type="button"
            title="Unduh Template Excel (.xlsx) &amp; CSV"
            className="inline-flex items-center gap-1 bg-[#152542] hover:bg-[#1a2f54] text-slate-200 border border-[#23385f] px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Template</span>
          </button>

          {/* Action: View Raw Data */}
          <button
            onClick={onOpenDataViewer}
            type="button"
            title="Lihat Data Tabel Mentah"
            className="inline-flex items-center gap-1 bg-[#152542] hover:bg-[#1a2f54] text-slate-200 border border-[#23385f] px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Tabel</span>
          </button>

          {/* Action: Reset Data */}
          {isCustomData && (
            <button
              onClick={onResetData}
              type="button"
              title="Kembalikan ke data awal"
              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

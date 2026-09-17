import React, { useState } from 'react';
import { X, Table, Search, Download, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DashboardData } from '../types';

interface DataViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DashboardData;
}

export const DataViewerModal: React.FC<DataViewerModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [activeTab, setActiveTab] = useState<'kpi' | 'trend' | 'depo' | 'expeditions'>('trend');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const exportCurrentTable = () => {
    const wb = XLSX.utils.book_new();

    // Add all sheets
    const wsKpi = XLSX.utils.json_to_sheet([
      { Metric: 'QTY DISTRIBUSI YTD', Nilai: data.kpis.qtyYtd, Target: data.kpis.qtyYtdTarget, Growth: `${data.kpis.yoyGrowth}% YoY` },
      { Metric: 'QTY DISTRIBUSI MTD', Nilai: data.kpis.qtyMtd, Target: data.kpis.qtyMtdTarget, Growth: `${data.kpis.momGrowth}% MoM` },
      { Metric: 'QTY BULAN LALU', Nilai: data.kpis.qtyLastMonth, Target: '-', Growth: data.kpis.lastMonthName },
      { Metric: 'UNIT CACAT (NRFS)', Nilai: `${data.kpis.nrfsRate}%`, Target: `< ${data.kpis.nrfsMaxLimit}%`, Growth: data.kpis.nrfsStatus },
      { Metric: 'ON-TIME DELIVERY', Nilai: `${data.kpis.otdRate}%`, Target: `> ${data.kpis.otdMinTarget}%`, Growth: data.kpis.otdStatus }
    ]);
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPI');

    const wsTrend = XLSX.utils.json_to_sheet(data.monthlyTrend);
    XLSX.utils.book_append_sheet(wb, wsTrend, 'Tren_Bulanan');

    const wsDepo = XLSX.utils.json_to_sheet(data.depoDistribution);
    XLSX.utils.book_append_sheet(wb, wsDepo, 'Distribusi_Depo');

    const wsExp = XLSX.utils.json_to_sheet(data.expeditionPerformance);
    XLSX.utils.book_append_sheet(wb, wsExp, 'Kinerja_Ekspedisi');

    XLSX.writeFile(wb, `Export_Data_Distribusi_${data.year}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0f1a2e] border border-[#203358] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Inspeksi Data Tabel Aktif</h2>
              <p className="text-xs text-slate-400">
                Sumber aktif: {data.fileName || 'Data Bawaan'} &bull; Diperbarui: {data.lastUpdated}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCurrentTable}
              className="inline-flex items-center gap-1.5 bg-[#172746] hover:bg-[#1d3157] text-slate-200 border border-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 bg-[#0c1424]">
          <div className="flex space-x-2">
            {[
              { id: 'trend', label: 'Tren Bulanan' },
              { id: 'depo', label: 'Distribusi Depo' },
              { id: 'expeditions', label: 'Kinerja Ekspedisi' },
              { id: 'kpi', label: 'Ringkasan KPI' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative my-1.5">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari baris..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#121f37] text-slate-200 text-xs rounded-md pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:border-cyan-500 w-40 sm:w-56"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'trend' && (
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#121f37] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Bulan</th>
                    <th className="p-3 text-right">Actual (rb Unit)</th>
                    <th className="p-3 text-right">Target (rb Unit)</th>
                    <th className="p-3 text-right">Pencapaian (%)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {data.monthlyTrend
                    .filter((m) => m.month.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item) => {
                      const achievement =
                        item.actual !== null && item.actual !== undefined && item.target
                          ? ((item.actual / item.target) * 100).toFixed(1)
                          : '-';
                      return (
                        <tr key={item.month} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-white">{item.month}</td>
                          <td className="p-3 text-right text-cyan-400">
                            {item.actual !== null && item.actual !== undefined
                              ? `${item.actual}.000`
                              : '-'}
                          </td>
                          <td className="p-3 text-right text-amber-400">{item.target}.000</td>
                          <td className="p-3 text-right font-semibold">
                            {achievement !== '-' ? `${achievement}%` : '-'}
                          </td>
                          <td className="p-3 text-center">
                            {item.isProjected ? (
                              <span className="bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] px-2 py-0.5 rounded">
                                Proyeksi
                              </span>
                            ) : (
                              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-[10px] px-2 py-0.5 rounded">
                                Realisasi
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'depo' && (
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#121f37] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Nama Depo</th>
                    <th className="p-3 text-right">Porsi (%)</th>
                    <th className="p-3 text-right">Estimasi Volume (Unit)</th>
                    <th className="p-3 text-center">Warna Visual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {data.depoDistribution
                    .filter((d) => d.depo.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item) => (
                      <tr key={item.depo} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-white">{item.depo}</td>
                        <td className="p-3 text-right font-bold text-cyan-400">
                          {item.percentage}%
                        </td>
                        <td className="p-3 text-right text-slate-300">
                          {item.volumeUnit ? item.volumeUnit.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className="inline-block w-4 h-4 rounded-xs border border-white/20"
                            style={{ backgroundColor: item.color }}
                          ></span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'expeditions' && (
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#121f37] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ekspedisi Mitra</th>
                    <th className="p-3 text-right">Realisasi (rb Unit)</th>
                    <th className="p-3 text-right">Kuota Alokasi (rb Unit)</th>
                    <th className="p-3 text-right">Capaian (%)</th>
                    <th className="p-3 text-right">OTD Rate (%)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {data.expeditionPerformance
                    .filter((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item) => (
                      <tr key={item.name} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-white">{item.name}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">
                          {item.realisasi}k
                        </td>
                        <td className="p-3 text-right text-slate-400">{item.kuotaAlokasi}k</td>
                        <td className="p-3 text-right font-bold text-cyan-400">
                          {item.capaian.toFixed(1)}%
                        </td>
                        <td className="p-3 text-right text-amber-400 font-bold">
                          {item.otd.toFixed(1)}%
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                              item.capaian >= 100
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : item.capaian >= 95
                                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                                : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {item.status || 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'kpi' && (
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#121f37] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Indikator Metrik</th>
                    <th className="p-3 text-right">Nilai Aktual</th>
                    <th className="p-3 text-right">Target / Standar</th>
                    <th className="p-3 text-right">Pertumbuhan / Baseline</th>
                    <th className="p-3 text-center">Kategori Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">1. QTY DISTRIBUSI YTD</td>
                    <td className="p-3 text-right font-bold text-cyan-400">
                      {data.kpis.qtyYtd.toLocaleString('id-ID')} Unit
                    </td>
                    <td className="p-3 text-right">
                      {data.kpis.qtyYtdTarget.toLocaleString('id-ID')} Unit
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{data.kpis.yoyGrowth}% YoY
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                        Target Tercapai
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">2. QTY DISTRIBUSI MTD</td>
                    <td className="p-3 text-right font-bold text-cyan-400">
                      {data.kpis.qtyMtd.toLocaleString('id-ID')} Unit
                    </td>
                    <td className="p-3 text-right">
                      {data.kpis.qtyMtdTarget.toLocaleString('id-ID')} Unit
                    </td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{data.kpis.momGrowth}% MoM
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                        Target Tercapai
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">3. QTY BULAN LALU</td>
                    <td className="p-3 text-right font-bold text-cyan-400">
                      {data.kpis.qtyLastMonth.toLocaleString('id-ID')} Unit
                    </td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right text-blue-400">{data.kpis.lastMonthName}</td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded text-[10px]">
                        Baseline
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">5. UNIT CACAT (NRFS)</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {data.kpis.nrfsRate}%
                    </td>
                    <td className="p-3 text-right">&lt; {data.kpis.nrfsMaxLimit}%</td>
                    <td className="p-3 text-right text-slate-400">Di bawah batas toleransi</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                        Good
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">7. ON-TIME DELIVERY</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {data.kpis.otdRate}%
                    </td>
                    <td className="p-3 text-right">&gt; {data.kpis.otdMinTarget}%</td>
                    <td className="p-3 text-right text-slate-400">SLA Memenuhi Standar</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                        On Target
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, TrendingUp, ShieldCheck, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { KpiSummary } from '../types';

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: 'ytd' | 'mtd' | 'last_month' | 'nrfs' | 'otd' | 'expedition' | 'depo' | null;
  metricPayload?: any;
  kpis: KpiSummary;
}

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  isOpen,
  onClose,
  metricType,
  metricPayload,
  kpis
}) => {
  if (!isOpen || !metricType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0f1a2e] border border-[#203358] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Analisis Mendalam Metrik
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {metricType === 'ytd' && (
            <div className="space-y-3">
              <div className="text-base font-bold text-white">1. QTY DISTRIBUSI YTD (Year-to-Date)</div>
              <div className="bg-[#121f37] border border-slate-800 rounded-lg p-4 font-mono space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Realisasi Kumulatif:</span>
                  <span className="font-bold text-cyan-400">{kpis.qtyYtd.toLocaleString('id-ID')} Unit</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Target Tahunan:</span>
                  <span className="font-bold text-slate-200">{kpis.qtyYtdTarget.toLocaleString('id-ID')} Unit</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Surplus Pencapaian:</span>
                  <span className="font-bold text-emerald-400">+{(kpis.qtyYtd - kpis.qtyYtdTarget).toLocaleString('id-ID')} Unit ({((kpis.qtyYtd / kpis.qtyYtdTarget) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
                  <span>Pertumbuhan Tahunan (YoY):</span>
                  <span className="font-bold text-emerald-400">+{kpis.yoyGrowth}% vs Periode Sama 2025</span>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Kinerja distribusi kumulatif tahun berjalan melampaui target yang ditetapkan dengan tren pertumbuhan positif di kuartal 3.
              </p>
            </div>
          )}

          {metricType === 'mtd' && (
            <div className="space-y-3">
              <div className="text-base font-bold text-white">2. QTY DISTRIBUSI MTD (Month-to-Date)</div>
              <div className="bg-[#121f37] border border-slate-800 rounded-lg p-4 font-mono space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Realisasi Bulan Berjalan:</span>
                  <span className="font-bold text-cyan-400">{kpis.qtyMtd.toLocaleString('id-ID')} Unit</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Target Bulanan:</span>
                  <span className="font-bold text-slate-200">{kpis.qtyMtdTarget.toLocaleString('id-ID')} Unit</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Pertumbuhan Bulanan (MoM):</span>
                  <span className="font-bold text-emerald-400">+{kpis.momGrowth}% vs Bulan Lalu</span>
                </div>
              </div>
            </div>
          )}

          {metricType === 'last_month' && (
            <div className="space-y-3">
              <div className="text-base font-bold text-white">3. QTY BULAN LALU (Baseline)</div>
              <div className="bg-[#121f37] border border-slate-800 rounded-lg p-4 font-mono space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Total Unit Terkirim:</span>
                  <span className="font-bold text-blue-400">{kpis.qtyLastMonth.toLocaleString('id-ID')} Unit</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Status Periode:</span>
                  <span className="font-bold text-slate-200">{kpis.lastMonthName}</span>
                </div>
              </div>
            </div>
          )}

          {metricType === 'nrfs' && (
            <div className="space-y-3">
              <div className="text-base font-bold text-white">5. UNIT CACAT / DEFECT (NRFS)</div>
              <div className="bg-[#121f37] border border-slate-800 rounded-lg p-4 font-mono space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Tingkat Kerusakan Terkini:</span>
                  <span className="font-bold text-emerald-400">{kpis.nrfsRate}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Batas Toleransi Maksimal:</span>
                  <span className="font-bold text-amber-400">&lt; {kpis.nrfsMaxLimit}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Indeks Kualitas (NRFS):</span>
                  <span className="font-bold text-emerald-400">Status Baik (Dalam Kontrol)</span>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Tingkat Not-Ready-For-Sale (NRFS) berada di bawah ambang batas kritis 2.00%, menandakan proses penanganan material dan penataan muatan berjalan optimal.
              </p>
            </div>
          )}

          {metricType === 'otd' && (
            <div className="space-y-3">
              <div className="text-base font-bold text-white">7. ON-TIME DELIVERY (OTD)</div>
              <div className="bg-[#121f37] border border-slate-800 rounded-lg p-4 font-mono space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Tingkat Ketepatan Waktu:</span>
                  <span className="font-bold text-emerald-400">{kpis.otdRate}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Target Minimal SLA:</span>
                  <span className="font-bold text-slate-200">&gt; {kpis.otdMinTarget}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Deviasi SLA:</span>
                  <span className="font-bold text-emerald-400">+{(kpis.otdRate - kpis.otdMinTarget).toFixed(1)}% di atas batas minimal</span>
                </div>
              </div>
            </div>
          )}

          {metricType === 'expedition' && metricPayload && (
            <div className="space-y-3">
              <div className="text-base font-bold text-white">
                Mitra Ekspedisi: {metricPayload.name}
              </div>
              <div className="bg-[#121f37] border border-slate-800 rounded-lg p-4 font-mono space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Realisasi Distribusi:</span>
                  <span className="font-bold text-emerald-400">{metricPayload.realisasi}.000 Unit</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Kuota Alokasi:</span>
                  <span className="font-bold text-slate-200">{metricPayload.kuotaAlokasi}.000 Unit</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Capaian Kuota:</span>
                  <span className="font-bold text-cyan-400">{metricPayload.capaian}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>On-Time Delivery (OTD):</span>
                  <span className="font-bold text-amber-400">{metricPayload.otd}%</span>
                </div>
              </div>
            </div>
          )}

          {metricType === 'depo' && metricPayload && (
            <div className="space-y-3">
              <div className="text-base font-bold text-white">
                Cabang: {metricPayload.depo}
              </div>
              <div className="bg-[#121f37] border border-slate-800 rounded-lg p-4 font-mono space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Porsi Distribusi:</span>
                  <span className="font-bold text-cyan-400">{metricPayload.percentage}%</span>
                </div>
                {metricPayload.volumeUnit && (
                  <div className="flex justify-between text-slate-300">
                    <span>Total Volume:</span>
                    <span className="font-bold text-white">{metricPayload.volumeUnit.toLocaleString('id-ID')} Unit</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0c1424] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-md text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

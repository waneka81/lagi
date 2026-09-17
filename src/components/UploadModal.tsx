import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  Info
} from 'lucide-react';
import { parseExcelOrCsv, downloadSampleExcel, downloadSampleCsv } from '../utils/excelParser';
import { DashboardData } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: DashboardData) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<DashboardData | null>(null);
  const [detectedSheets, setDetectedSheets] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'template_guide'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setPreviewData(null);

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Format file tidak didukung. Mohon unggah file berekstensi .xlsx, .xls, atau .csv');
      setIsLoading(false);
      return;
    }

    const result = await parseExcelOrCsv(file);

    if (result.success && result.data) {
      setPreviewData(result.data);
      setDetectedSheets(result.sheetsFound || []);
    } else {
      setErrorMessage(result.error || 'Terjadi kesalahan saat memproses file Excel/CSV.');
    }
    setIsLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleApply = () => {
    if (previewData) {
      onDataLoaded(previewData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0f1a2e] border border-[#203358] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Unggah Data Distribusi Logistik</h2>
              <p className="text-xs text-slate-400">Dukungan format file Excel (.xlsx, .xls) dan CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800/80 px-6 pt-2 bg-[#0c1424]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Form Unggah File
          </button>
          <button
            onClick={() => setActiveTab('template_guide')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'template_guide'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Format &amp; Unduh Template
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'upload' && (
            <>
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/20'
                    : 'border-[#22365c] hover:border-cyan-500/50 hover:bg-[#132039]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mx-auto w-12 h-12 mb-3 rounded-full bg-slate-800/80 flex items-center justify-center text-cyan-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Klik untuk pilih file atau seret file ke sini
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Format file: .xlsx, .xls, atau .csv (Maksimal 10 MB)
                </p>
                <span className="inline-block text-[11px] bg-[#1a2b4a] text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/20">
                  Otomatis memetakan KPI, Tren Bulanan, Depo &amp; Ekspedisi
                </span>
              </div>

              {/* Status & Error */}
              {isLoading && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-slate-300">
                  Sedang membaca dan menganalisis struktur data file...
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-600/40 rounded-lg flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Success Preview */}
              {previewData && (
                <div className="bg-[#121f37] border border-emerald-500/40 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-700/60 pb-2">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      File berhasil diuraikan: {previewData.fileName}
                    </span>
                    {detectedSheets.length > 0 && (
                      <span className="text-slate-400 text-[11px]">
                        {detectedSheets.length} Lembar Kerja (Sheets)
                      </span>
                    )}
                  </div>

                  {/* Highlights of parsed data */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                    <div className="bg-[#0b1424] p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">Qty YTD</div>
                      <div className="font-bold text-cyan-400">
                        {previewData.kpis.qtyYtd.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-[#0b1424] p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">Qty MTD</div>
                      <div className="font-bold text-emerald-400">
                        {previewData.kpis.qtyMtd.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-[#0b1424] p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">NRFS Cacat</div>
                      <div className="font-bold text-amber-400">
                        {previewData.kpis.nrfsRate}%
                      </div>
                    </div>
                    <div className="bg-[#0b1424] p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">OTD Rate</div>
                      <div className="font-bold text-purple-400">
                        {previewData.kpis.otdRate}%
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    Memuat {previewData.monthlyTrend.length} periode bulan,{' '}
                    {previewData.depoDistribution.length} cabang depo, dan{' '}
                    {previewData.expeditionPerformance.length} mitra ekspedisi.
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'template_guide' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-lg flex items-start gap-2 text-cyan-200">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                <p>
                  Sistem mendukung dua tipe file: File Excel multi-sheet terstruktur, atau satu tabel datar
                  CSV/Excel. Anda dapat mengunduh contoh siap pakai di bawah ini.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#121f37] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white mb-1">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      Template Excel (.xlsx)
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Lengkap dengan 4 sheet: Ringkasan_KPI, Tren_Bulanan, Distribusi_Depo, dan
                      Kinerja_Ekspedisi.
                    </p>
                  </div>
                  <button
                    onClick={downloadSampleExcel}
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 px-3 rounded text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh File Template (.xlsx)
                  </button>
                </div>

                <div className="bg-[#121f37] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white mb-1">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      Template CSV (.csv)
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Satu file tabel datar baris-kolom (Bulan, Depo, Ekspedisi, Realisasi, Kuota, OTD).
                    </p>
                  </div>
                  <button
                    onClick={downloadSampleCsv}
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-1.5 px-3 rounded text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh File Template (.csv)
                  </button>
                </div>
              </div>

              {/* Table Schema Specification */}
              <div className="border border-slate-800 rounded-lg p-3 bg-[#0b1424] space-y-2">
                <div className="font-semibold text-slate-200">Format Kolom yang Dikenali:</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                  <li><strong>KPI:</strong> Metric / Metrik, Nilai / Value, Target, Pertumbuhan / Growth</li>
                  <li><strong>Tren Bulanan:</strong> Bulan / Month, Actual / Realisasi, Target</li>
                  <li><strong>Depo:</strong> Depo / Cabang, Persentase / Share, Volume</li>
                  <li><strong>Ekspedisi:</strong> Ekspedisi / Vendor, Realisasi, Kuota / Alokasi, OTD</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-[#0c1424]">
          <span className="text-xs text-slate-500">
            {previewData ? 'File siap diterapkan ke dashboard' : 'Belum ada data baru yang dipilih'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!previewData}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                previewData
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Terapkan ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

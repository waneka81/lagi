import * as XLSX from 'xlsx';
import { DashboardData, KpiSummary, MonthlyTrendItem, DepoShareItem, ExpeditionPerformanceItem } from '../types';
import { initialDashboardData } from '../data/defaultData';

export function formatNumberIndo(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('id-ID').format(Math.round(val));
}

export function formatPercentIndo(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  return `${val.toFixed(decimals).replace('.', ',')}%`;
}

const DEPO_COLORS = ['#38bdf8', '#34d399', '#facc15', '#a78bfa', '#fb7185', '#60a5fa', '#f43f5e', '#2dd4bf'];

export async function parseExcelOrCsv(file: File): Promise<{
  success: boolean;
  data?: DashboardData;
  error?: string;
  sheetsFound?: string[];
  rawRows?: Record<string, any>[];
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    if (sheetNames.length === 0) {
      return { success: false, error: 'File Excel/CSV tidak memiliki lembar kerja (sheet) yang valid.' };
    }

    // Prepare result with defaults in case of partial data
    let kpis: KpiSummary = { ...initialDashboardData.kpis };
    let monthlyTrend: MonthlyTrendItem[] = [...initialDashboardData.monthlyTrend];
    let depoDistribution: DepoShareItem[] = [...initialDashboardData.depoDistribution];
    let expeditionPerformance: ExpeditionPerformanceItem[] = [...initialDashboardData.expeditionPerformance];
    let allRawRows: Record<string, any>[] = [];

    // Check if workbook contains separate dedicated sheets
    const normalizeName = (name: string) => name.toLowerCase().replace(/[\s_-]/g, '');

    const kpiSheetName = sheetNames.find(s => {
      const n = normalizeName(s);
      return n.includes('kpi') || n.includes('summary') || n.includes('ringkasan');
    });

    const trendSheetName = sheetNames.find(s => {
      const n = normalizeName(s);
      return n.includes('trend') || n.includes('tren') || n.includes('bulanan') || n.includes('month');
    });

    const depoSheetName = sheetNames.find(s => {
      const n = normalizeName(s);
      return n.includes('depo') || n.includes('cabang') || n.includes('warehouse') || n.includes('wilayah');
    });

    const expeditionSheetName = sheetNames.find(s => {
      const n = normalizeName(s);
      return n.includes('ekspedisi') || n.includes('expedition') || n.includes('vendor') || n.includes('carrier') || n.includes('logistics');
    });

    // Parse KPI sheet if present
    if (kpiSheetName) {
      const sheet = workbook.Sheets[kpiSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      allRawRows.push(...rows.map(r => ({ ...r, _sheet: kpiSheetName })));
      
      rows.forEach(r => {
        // Can be key-value pair or columns
        const metric = String(r.Metric || r.Metrik || r.Indikator || r.KPI || Object.values(r)[0] || '').toLowerCase();
        const val = Number(r.Nilai ?? r.Value ?? r.Aktual ?? Object.values(r)[1]);
        const target = Number(r.Target ?? r.Batas ?? Object.values(r)[2]);
        const growth = Number(r.Pertumbuhan ?? r.Growth ?? Object.values(r)[3]);

        if (metric.includes('ytd') || metric.includes('qty tahun')) {
          if (!isNaN(val)) kpis.qtyYtd = val;
          if (!isNaN(target)) kpis.qtyYtdTarget = target;
          if (!isNaN(growth)) kpis.yoyGrowth = growth;
        } else if (metric.includes('mtd') || metric.includes('qty bulan')) {
          if (!isNaN(val)) kpis.qtyMtd = val;
          if (!isNaN(target)) kpis.qtyMtdTarget = target;
          if (!isNaN(growth)) kpis.momGrowth = growth;
        } else if (metric.includes('lalu') || metric.includes('last month') || metric.includes('baseline')) {
          if (!isNaN(val)) kpis.qtyLastMonth = val;
          if (r.Keterangan || r.Label) kpis.lastMonthName = String(r.Keterangan || r.Label);
        } else if (metric.includes('nrfs') || metric.includes('cacat') || metric.includes('defect')) {
          if (!isNaN(val)) kpis.nrfsRate = val;
          if (!isNaN(target)) kpis.nrfsMaxLimit = target;
          kpis.nrfsStatus = kpis.nrfsRate <= kpis.nrfsMaxLimit ? 'Good' : 'Critical';
        } else if (metric.includes('otd') || metric.includes('on-time') || metric.includes('tepat waktu')) {
          if (!isNaN(val)) kpis.otdRate = val;
          if (!isNaN(target)) kpis.otdMinTarget = target;
          kpis.otdStatus = kpis.otdRate >= kpis.otdMinTarget ? 'On Target' : 'Below Target';
        }
      });
    }

    // Parse Trend sheet if present
    if (trendSheetName) {
      const sheet = workbook.Sheets[trendSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      allRawRows.push(...rows.map(r => ({ ...r, _sheet: trendSheetName })));
      
      const parsedTrend: MonthlyTrendItem[] = rows.map((r) => {
        const month = String(r.Bulan || r.Month || r.Period || r.Bulan_Tahun || 'Bulan');
        const actualVal = r.Actual ?? r.Aktual ?? r.Realisasi;
        const targetVal = Number(r.Target ?? r.Sasaran ?? 120);
        const actual = actualVal !== null && actualVal !== undefined && actualVal !== '' && !isNaN(Number(actualVal))
          ? Number(actualVal)
          : null;
        const isProjected = actual === null || month.includes('*') || Boolean(r.Projected || r.Proyeksi);
        return {
          month,
          actual,
          target: isNaN(targetVal) ? 120 : targetVal,
          isProjected
        };
      });

      if (parsedTrend.length > 0) {
        monthlyTrend = parsedTrend;
      }
    }

    // Parse Depo sheet if present
    if (depoSheetName) {
      const sheet = workbook.Sheets[depoSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      allRawRows.push(...rows.map(r => ({ ...r, _sheet: depoSheetName })));

      const totalVol = rows.reduce((acc, r) => acc + (Number(r.Volume || r.Jumlah || r.Qty) || 0), 0);

      const parsedDepo: DepoShareItem[] = rows.map((r, idx) => {
        const name = String(r.Depo || r.Cabang || r.Warehouse || r.Nama_Depo || `Depo ${idx + 1}`);
        let percentage = Number(r.Persentase || r.Percentage || r.Prosentase || r.Share);
        const vol = Number(r.Volume || r.Jumlah || r.Qty);

        if (isNaN(percentage) || percentage === 0) {
          percentage = totalVol > 0 && !isNaN(vol) ? Math.round((vol / totalVol) * 100) : 0;
        }

        return {
          depo: name.startsWith('Depo') ? name : `Depo ${name}`,
          percentage: Math.round(percentage),
          volumeUnit: !isNaN(vol) ? vol : undefined,
          color: DEPO_COLORS[idx % DEPO_COLORS.length]
        };
      });

      if (parsedDepo.length > 0) {
        depoDistribution = parsedDepo;
      }
    }

    // Parse Expedition sheet if present
    if (expeditionSheetName) {
      const sheet = workbook.Sheets[expeditionSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);
      allRawRows.push(...rows.map(r => ({ ...r, _sheet: expeditionSheetName })));

      const parsedExpeditions: ExpeditionPerformanceItem[] = rows.map((r) => {
        const name = String(r.Ekspedisi || r.Expedition || r.Nama || r.Vendor || r.Carrier || 'Ekspedisi');
        const realisasi = Number(r.Realisasi || r.Actual || r.Aktual || 0);
        const kuotaAlokasi = Number(r.Kuota || r.Quota || r.Alokasi || r.Target || 0);
        let capaian = Number(r.Capaian || r.Achievement);
        let otd = Number(r.OTD || r.OnTime || r.Tepat_Waktu || 95);

        if (isNaN(capaian) || capaian === 0) {
          capaian = kuotaAlokasi > 0 ? Number(((realisasi / kuotaAlokasi) * 100).toFixed(1)) : 100;
        }

        return {
          name,
          realisasi: isNaN(realisasi) ? 0 : realisasi,
          kuotaAlokasi: isNaN(kuotaAlokasi) ? 0 : kuotaAlokasi,
          capaian: Number(capaian.toFixed(1)),
          otd: Number((isNaN(otd) ? 95 : otd).toFixed(1)),
          status: capaian >= 100 ? 'Excellent' : capaian >= 95 ? 'Good' : 'Attention'
        };
      });

      if (parsedExpeditions.length > 0) {
        expeditionPerformance = parsedExpeditions;
      }
    }

    // If it was a single sheet or CSV file without dedicated sheet names
    if (!kpiSheetName && !trendSheetName && !depoSheetName && !expeditionSheetName) {
      const firstSheet = workbook.Sheets[sheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(firstSheet);
      allRawRows = rows;

      if (rows.length > 0) {
        const firstRow = rows[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());

        // Check if it's a flat transaction / aggregated logistics table
        const hasDepo = keys.some(k => k.includes('depo') || k.includes('cabang'));
        const hasExp = keys.some(k => k.includes('ekspedisi') || k.includes('vendor'));
        const hasMonth = keys.some(k => k.includes('bulan') || k.includes('month'));

        if (hasExp) {
          // Group by Expedition
          const expMap = new Map<string, { realisasi: number; kuota: number; otdSum: number; count: number }>();
          rows.forEach(r => {
            const expKey = Object.keys(r).find(k => k.toLowerCase().includes('ekspedisi') || k.toLowerCase().includes('vendor')) || '';
            const expName = String(r[expKey] || 'Lainnya');
            const realKey = Object.keys(r).find(k => k.toLowerCase().includes('realisasi') || k.toLowerCase().includes('aktual') || k.toLowerCase().includes('actual')) || '';
            const kuotaKey = Object.keys(r).find(k => k.toLowerCase().includes('kuota') || k.toLowerCase().includes('quota') || k.toLowerCase().includes('alokasi') || k.toLowerCase().includes('target')) || '';
            const otdKey = Object.keys(r).find(k => k.toLowerCase().includes('otd') || k.toLowerCase().includes('ontime')) || '';

            const real = Number(r[realKey]) || 0;
            const kuota = Number(r[kuotaKey]) || 0;
            const otd = Number(r[otdKey]) || 95;

            const existing = expMap.get(expName) || { realisasi: 0, kuota: 0, otdSum: 0, count: 0 };
            existing.realisasi += real;
            existing.kuota += kuota;
            existing.otdSum += otd;
            existing.count += 1;
            expMap.set(expName, existing);
          });

          expeditionPerformance = Array.from(expMap.entries()).map(([name, data]) => {
            const capaian = data.kuota > 0 ? Number(((data.realisasi / data.kuota) * 100).toFixed(1)) : 100;
            const otdAvg = Number((data.otdSum / (data.count || 1)).toFixed(1));
            return {
              name,
              realisasi: Math.round(data.realisasi),
              kuotaAlokasi: Math.round(data.kuota),
              capaian,
              otd: otdAvg,
              status: capaian >= 100 ? 'Excellent' : capaian >= 95 ? 'Good' : 'Attention'
            };
          });
        }

        if (hasDepo) {
          // Group by Depo
          const depoMap = new Map<string, number>();
          rows.forEach(r => {
            const depoKey = Object.keys(r).find(k => k.toLowerCase().includes('depo') || k.toLowerCase().includes('cabang')) || '';
            const depoName = String(r[depoKey] || 'Depo Jakarta');
            const volKey = Object.keys(r).find(k => k.toLowerCase().includes('volume') || k.toLowerCase().includes('realisasi') || k.toLowerCase().includes('qty') || k.toLowerCase().includes('jumlah')) || '';
            const vol = Number(r[volKey]) || 1;
            depoMap.set(depoName, (depoMap.get(depoName) || 0) + vol);
          });

          const totalVol = Array.from(depoMap.values()).reduce((a, b) => a + b, 0);
          depoDistribution = Array.from(depoMap.entries()).map(([depo, vol], idx) => ({
            depo: depo.startsWith('Depo') ? depo : `Depo ${depo}`,
            percentage: totalVol > 0 ? Math.round((vol / totalVol) * 100) : 20,
            volumeUnit: vol,
            color: DEPO_COLORS[idx % DEPO_COLORS.length]
          }));
        }

        if (hasMonth) {
          // Group by Month
          const monthMap = new Map<string, { actual: number; target: number }>();
          rows.forEach(r => {
            const mKey = Object.keys(r).find(k => k.toLowerCase().includes('bulan') || k.toLowerCase().includes('month')) || '';
            const mName = String(r[mKey] || 'Jan');
            const actKey = Object.keys(r).find(k => k.toLowerCase().includes('actual') || k.toLowerCase().includes('aktual') || k.toLowerCase().includes('realisasi')) || '';
            const tgtKey = Object.keys(r).find(k => k.toLowerCase().includes('target') || k.toLowerCase().includes('sasaran')) || '';

            const act = Number(r[actKey]) || 0;
            const tgt = Number(r[tgtKey]) || 120;
            const existing = monthMap.get(mName) || { actual: 0, target: 0 };
            existing.actual += act;
            existing.target += tgt;
            monthMap.set(mName, existing);
          });

          monthlyTrend = Array.from(monthMap.entries()).map(([month, val]) => ({
            month,
            actual: val.actual > 0 ? val.actual : null,
            target: val.target,
            isProjected: val.actual === 0 || month.includes('*')
          }));
        }

        // Auto calculate KPIs if possible from aggregates
        const totalActualUnits = monthlyTrend.reduce((acc, m) => acc + (m.actual || 0) * 1000, 0);
        if (totalActualUnits > 0) {
          kpis.qtyYtd = totalActualUnits;
          kpis.qtyYtdTarget = Math.round(totalActualUnits * 0.96);
        }
      }
    }

    const resultData: DashboardData = {
      year: 2026,
      month: 'September',
      selectedDepo: 'Semua Depo',
      kpis,
      monthlyTrend,
      depoDistribution,
      expeditionPerformance,
      rawRows: allRawRows,
      fileName: file.name,
      lastUpdated: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB'
    };

    return {
      success: true,
      data: resultData,
      sheetsFound: sheetNames,
      rawRows: allRawRows
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Gagal membaca file: ${err?.message || 'Format tidak didukung'}`
    };
  }
}

/**
 * Generates and downloads a complete sample Excel workbook (.xlsx)
 * with matching sheets and columns ready for testing and uploading.
 */
export function downloadSampleExcel(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan KPI
  const kpiData = [
    {
      Metric: '1. QTY DISTRIBUSI YTD',
      Nilai: 1450000,
      Target: 1400000,
      Pertumbuhan: 8.2,
      Satuan: 'Unit',
      Keterangan: '+8.2% YoY'
    },
    {
      Metric: '2. QTY DISTRIBUSI MTD',
      Nilai: 125000,
      Target: 120000,
      Pertumbuhan: 5.9,
      Satuan: 'Unit',
      Keterangan: '+5.9% MoM'
    },
    {
      Metric: '3. QTY BULAN LALU',
      Nilai: 118000,
      Target: 115000,
      Pertumbuhan: 0,
      Satuan: 'Unit',
      Keterangan: 'Agustus 2026 Baseline'
    },
    {
      Metric: '5. UNIT CACAT (NRFS)',
      Nilai: 1.15,
      Target: 2.00,
      Pertumbuhan: -0.2,
      Satuan: 'Rate %',
      Keterangan: 'Good (< 2.00%)'
    },
    {
      Metric: '7. ON-TIME DELIVERY',
      Nilai: 96.8,
      Target: 95.0,
      Pertumbuhan: 1.2,
      Satuan: 'OTD Rate %',
      Keterangan: 'On Target (> 95.0%)'
    }
  ];
  const wsKpi = XLSX.utils.json_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, wsKpi, 'Ringkasan_KPI');

  // Sheet 2: Tren Bulanan
  const trendData = [
    { Bulan: 'Jan', Actual: 110, Target: 112, Keterangan: 'Selesai' },
    { Bulan: 'Feb', Actual: 112, Target: 113, Keterangan: 'Selesai' },
    { Bulan: 'Mar', Actual: 115, Target: 114, Keterangan: 'Selesai' },
    { Bulan: 'Apr', Actual: 120, Target: 117, Keterangan: 'Selesai' },
    { Bulan: 'May', Actual: 118, Target: 118, Keterangan: 'Selesai' },
    { Bulan: 'Jun', Actual: 122, Target: 120, Keterangan: 'Selesai' },
    { Bulan: 'Jul', Actual: 124, Target: 121, Keterangan: 'Selesai' },
    { Bulan: 'Aug', Actual: 118, Target: 121, Keterangan: 'Selesai' },
    { Bulan: 'Sep', Actual: 125, Target: 123, Keterangan: 'Berjalan (MTD)' },
    { Bulan: 'Oct*', Actual: null, Target: 126, Keterangan: 'Proyeksi' },
    { Bulan: 'Nov*', Actual: null, Target: 128, Keterangan: 'Proyeksi' },
    { Bulan: 'Dec*', Actual: null, Target: 130, Keterangan: 'Proyeksi' }
  ];
  const wsTrend = XLSX.utils.json_to_sheet(trendData);
  XLSX.utils.book_append_sheet(wb, wsTrend, 'Tren_Bulanan');

  // Sheet 3: Distribusi Depo
  const depoData = [
    { Depo: 'Depo Jakarta', Persentase: 35, Volume: 507500, Wilayah: 'Jabodetabek' },
    { Depo: 'Depo Surabaya', Persentase: 25, Volume: 362500, Wilayah: 'Jawa Timur' },
    { Depo: 'Depo Medan', Persentase: 18, Volume: 261000, Wilayah: 'Sumatera Utara' },
    { Depo: 'Depo Makassar', Persentase: 12, Volume: 174000, Wilayah: 'Sulawesi Selatan' },
    { Depo: 'Depo Semarang', Persentase: 10, Volume: 145000, Wilayah: 'Jawa Tengah' }
  ];
  const wsDepo = XLSX.utils.json_to_sheet(depoData);
  XLSX.utils.book_append_sheet(wb, wsDepo, 'Distribusi_Depo');

  // Sheet 4: Kinerja Ekspedisi
  const expData = [
    { Ekspedisi: 'JNE Logistics', Realisasi: 320, Kuota: 350, Capaian: 91.4, OTD: 97.2, Status: 'Good' },
    { Ekspedisi: 'J&T Cargo', Realisasi: 275, Kuota: 270, Capaian: 101.8, OTD: 96.5, Status: 'Excellent' },
    { Ekspedisi: 'SiCepat Express', Realisasi: 210, Kuota: 220, Capaian: 95.5, OTD: 95.8, Status: 'Good' },
    { Ekspedisi: 'Internal Fleet', Realisasi: 420, Kuota: 400, Capaian: 105.0, OTD: 98.1, Status: 'Excellent' },
    { Ekspedisi: 'DHL Supply Chain', Realisasi: 180, Kuota: 200, Capaian: 90.0, OTD: 94.0, Status: 'Attention' }
  ];
  const wsExp = XLSX.utils.json_to_sheet(expData);
  XLSX.utils.book_append_sheet(wb, wsExp, 'Kinerja_Ekspedisi');

  XLSX.writeFile(wb, 'Template_Dashboard_Logistik.xlsx');
}

/**
 * Generates and downloads a unified CSV sample
 */
export function downloadSampleCsv(): void {
  const csvContent = 
`Bulan,Depo,Ekspedisi,Realisasi_rbUnit,Kuota_rbUnit,OTD_Persen,Cacat_NRFS_Persen
Jan,Depo Jakarta,Internal Fleet,45,40,98.5,0.9
Jan,Depo Surabaya,JNE Logistics,35,38,97.0,1.1
Jan,Depo Medan,J&T Cargo,30,30,96.2,1.2
Feb,Depo Jakarta,Internal Fleet,48,42,98.0,0.8
Feb,Depo Makassar,SiCepat Express,24,25,95.5,1.3
Mar,Depo Semarang,DHL Supply Chain,20,22,94.1,1.5
Mar,Depo Jakarta,JNE Logistics,40,42,97.5,1.0
Apr,Depo Surabaya,J&T Cargo,32,30,96.8,1.2
May,Depo Jakarta,Internal Fleet,50,45,98.3,0.9
Jun,Depo Medan,SiCepat Express,26,27,95.9,1.1
Jul,Depo Surabaya,Internal Fleet,44,40,98.2,1.0
Aug,Depo Jakarta,JNE Logistics,38,40,97.1,1.2
Sep,Depo Jakarta,Internal Fleet,52,48,98.4,0.8
Sep,Depo Surabaya,J&T Cargo,35,34,96.9,1.1`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Data_Logistik.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

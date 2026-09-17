export interface KpiSummary {
  qtyYtd: number;
  qtyYtdTarget: number;
  yoyGrowth: number; // e.g. 8.2%
  
  qtyMtd: number;
  qtyMtdTarget: number;
  momGrowth: number; // e.g. 5.9%

  qtyLastMonth: number;
  lastMonthName: string; // e.g. "Agustus 2026 Baseline"

  nrfsRate: number; // e.g. 1.15%
  nrfsMaxLimit: number; // e.g. 2.00%
  nrfsStatus: 'Good' | 'Warning' | 'Critical';

  otdRate: number; // e.g. 96.8%
  otdMinTarget: number; // e.g. 95.0%
  otdStatus: 'On Target' | 'Below Target';
}

export interface MonthlyTrendItem {
  month: string;
  actual: number | null; // in thousands (e.g. 110 for 110k), null if projection only
  target: number; // in thousands (e.g. 112)
  isProjected?: boolean;
}

export interface DepoShareItem {
  depo: string;
  percentage: number; // e.g. 35
  volumeUnit?: number; // total units
  color: string;
}

export interface ExpeditionPerformanceItem {
  name: string;
  kuotaAlokasi: number; // in thousands (e.g. 350 for 350k)
  realisasi: number; // in thousands (e.g. 320 for 320k)
  capaian: number; // percentage e.g. 91.4
  otd: number; // percentage e.g. 97.2
  status?: 'Excellent' | 'Good' | 'Attention';
}

export interface DashboardData {
  year: number;
  month: string;
  selectedDepo: string;
  kpis: KpiSummary;
  monthlyTrend: MonthlyTrendItem[];
  depoDistribution: DepoShareItem[];
  expeditionPerformance: ExpeditionPerformanceItem[];
  rawRows?: Record<string, any>[];
  fileName?: string;
  lastUpdated?: string;
}

export interface FilterState {
  year: number;
  month: string;
  depo: string;
}

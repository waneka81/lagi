import { DashboardData } from '../types';

export const initialDashboardData: DashboardData = {
  year: 2026,
  month: 'September',
  selectedDepo: 'Semua Depo',
  fileName: 'Data_Distribusi_Default.xlsx',
  lastUpdated: '17 Sep 2026, 14:30 WIB',
  kpis: {
    qtyYtd: 1450000,
    qtyYtdTarget: 1400000,
    yoyGrowth: 8.2,
    
    qtyMtd: 1250000,
    qtyMtdTarget: 1200000,
    momGrowth: 5.9,

    qtyLastMonth: 118000,
    lastMonthName: 'Agustus 2026 Baseline',

    nrfsRate: 1.15,
    nrfsMaxLimit: 2.00,
    nrfsStatus: 'Good',

    otdRate: 96.8,
    otdMinTarget: 95.0,
    otdStatus: 'On Target'
  },
  monthlyTrend: [
    { month: 'Jan', actual: 110, target: 112 },
    { month: 'Feb', actual: 112, target: 113 },
    { month: 'Mar', actual: 115, target: 114 },
    { month: 'Apr', actual: 120, target: 117 },
    { month: 'May', actual: 118, target: 118 },
    { month: 'Jun', actual: 122, target: 120 },
    { month: 'Jul', actual: 124, target: 121 },
    { month: 'Aug', actual: 118, target: 121 },
    { month: 'Sep', actual: 125, target: 123 },
    { month: 'Oct*', actual: null, target: 126, isProjected: true },
    { month: 'Nov*', actual: null, target: 128, isProjected: true },
    { month: 'Dec*', actual: null, target: 130, isProjected: true }
  ],
  depoDistribution: [
    { depo: 'Depo Jakarta', percentage: 35, volumeUnit: 507500, color: '#38bdf8' },
    { depo: 'Depo Surabaya', percentage: 25, volumeUnit: 362500, color: '#34d399' },
    { depo: 'Depo Medan', percentage: 18, volumeUnit: 261000, color: '#facc15' },
    { depo: 'Depo Makassar', percentage: 12, volumeUnit: 174000, color: '#a78bfa' },
    { depo: 'Depo Semarang', percentage: 10, volumeUnit: 145000, color: '#fb7185' }
  ],
  expeditionPerformance: [
    {
      name: 'JNE Logistics',
      realisasi: 320,
      kuotaAlokasi: 350,
      capaian: 91.4,
      otd: 97.2,
      status: 'Good'
    },
    {
      name: 'J&T Cargo',
      realisasi: 275,
      kuotaAlokasi: 270,
      capaian: 101.8,
      otd: 96.5,
      status: 'Excellent'
    },
    {
      name: 'SiCepat Express',
      realisasi: 210,
      kuotaAlokasi: 220,
      capaian: 95.5,
      otd: 95.8,
      status: 'Good'
    },
    {
      name: 'Internal Fleet',
      realisasi: 420,
      kuotaAlokasi: 400,
      capaian: 105.0,
      otd: 98.1,
      status: 'Excellent'
    },
    {
      name: 'DHL Supply Chain',
      realisasi: 180,
      kuotaAlokasi: 200,
      capaian: 90.0,
      otd: 94.0,
      status: 'Attention'
    }
  ]
};

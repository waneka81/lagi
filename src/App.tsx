/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { initialDashboardData } from './data/defaultData';
import { DashboardData, FilterState } from './types';
import { Header } from './components/Header';
import { KpiCard } from './components/KpiCard';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { DepoDistributionChart } from './components/DepoDistributionChart';
import { ExpeditionPerformanceChart } from './components/ExpeditionPerformanceChart';
import { UploadModal } from './components/UploadModal';
import { DataViewerModal } from './components/DataViewerModal';
import { MetricDetailModal } from './components/MetricDetailModal';
import { downloadSampleExcel } from './utils/excelParser';
import { formatNumberIndo } from './utils/excelParser';

export default function App() {
  const [data, setData] = useState<DashboardData>(initialDashboardData);
  const [isCustomData, setIsCustomData] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    year: 2026,
    month: 'September',
    depo: 'Semua Depo'
  });

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDataViewerOpen, setIsDataViewerOpen] = useState(false);
  const [detailModalState, setDetailModalState] = useState<{
    isOpen: boolean;
    type: 'ytd' | 'mtd' | 'last_month' | 'nrfs' | 'otd' | 'expedition' | 'depo' | null;
    payload?: any;
  }>({
    isOpen: false,
    type: null
  });

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Upload handler
  const handleDataLoaded = (uploadedData: DashboardData) => {
    setData(uploadedData);
    setIsCustomData(true);
    setFilters({
      year: uploadedData.year || 2026,
      month: uploadedData.month || 'September',
      depo: 'Semua Depo'
    });
  };

  // Reset handler
  const handleResetData = () => {
    setData(initialDashboardData);
    setIsCustomData(false);
    setFilters({
      year: 2026,
      month: 'September',
      depo: 'Semua Depo'
    });
  };

  // Filtered/computed data based on Depo selection
  const activeKpis = useMemo(() => {
    if (filters.depo === 'Semua Depo') {
      return data.kpis;
    }
    const targetDepo = data.depoDistribution.find((d) => d.depo === filters.depo);
    const multiplier = targetDepo ? targetDepo.percentage / 100 : 1;

    return {
      ...data.kpis,
      qtyYtd: Math.round(data.kpis.qtyYtd * multiplier),
      qtyYtdTarget: Math.round(data.kpis.qtyYtdTarget * multiplier),
      qtyMtd: Math.round(data.kpis.qtyMtd * multiplier),
      qtyMtdTarget: Math.round(data.kpis.qtyMtdTarget * multiplier),
      qtyLastMonth: Math.round(data.kpis.qtyLastMonth * multiplier)
    };
  }, [data, filters.depo]);

  const activeTrendData = useMemo(() => {
    if (filters.depo === 'Semua Depo') {
      return data.monthlyTrend;
    }
    const targetDepo = data.depoDistribution.find((d) => d.depo === filters.depo);
    const multiplier = targetDepo ? targetDepo.percentage / 100 : 1;

    return data.monthlyTrend.map((m) => ({
      ...m,
      actual: m.actual !== null ? Math.round(m.actual * multiplier) : null,
      target: Math.round(m.target * multiplier)
    }));
  }, [data.monthlyTrend, filters.depo]);

  const activeExpeditions = useMemo(() => {
    if (filters.depo === 'Semua Depo') {
      return data.expeditionPerformance;
    }
    const targetDepo = data.depoDistribution.find((d) => d.depo === filters.depo);
    const multiplier = targetDepo ? targetDepo.percentage / 100 : 1;

    return data.expeditionPerformance.map((e) => ({
      ...e,
      realisasi: Math.round(e.realisasi * multiplier),
      kuotaAlokasi: Math.round(e.kuotaAlokasi * multiplier)
    }));
  }, [data.expeditionPerformance, filters.depo]);

  return (
    <div className="min-h-screen bg-[#0b1324] text-slate-100 p-3 sm:p-5 lg:p-7">
      <div className="max-w-[1680px] mx-auto">
        {/* Top Header & Global Controls */}
        <Header
          filters={filters}
          onFilterChange={handleFilterChange}
          onOpenUpload={() => setIsUploadOpen(true)}
          onDownloadTemplate={downloadSampleExcel}
          onOpenDataViewer={() => setIsDataViewerOpen(true)}
          onResetData={handleResetData}
          fileName={data.fileName}
          isCustomData={isCustomData}
        />

        {/* Top Row: 5 KPI Cards (Matching numbers 1, 2, 3, 5, 7 in layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-5">
          {/* Card 1: QTY DISTRIBUSI YTD */}
          <KpiCard
            numberPrefix="1"
            title="QTY DISTRIBUSI YTD"
            value={formatNumberIndo(activeKpis.qtyYtd)}
            unit="Unit"
            subtext={`Target: ${formatNumberIndo(activeKpis.qtyYtdTarget)}`}
            badgeText={`+${activeKpis.yoyGrowth}% YoY`}
            badgeType="green"
            onClick={() =>
              setDetailModalState({ isOpen: true, type: 'ytd' })
            }
          />

          {/* Card 2: QTY DISTRIBUSI MTD */}
          <KpiCard
            numberPrefix="2"
            title="QTY DISTRIBUSI MTD"
            value={formatNumberIndo(activeKpis.qtyMtd)}
            unit="Unit"
            subtext={`Target: ${formatNumberIndo(activeKpis.qtyMtdTarget)}`}
            badgeText={`+${activeKpis.momGrowth}% MoM`}
            badgeType="green"
            onClick={() =>
              setDetailModalState({ isOpen: true, type: 'mtd' })
            }
          />

          {/* Card 3: QTY BULAN LALU */}
          <KpiCard
            numberPrefix="3"
            title="QTY BULAN LALU"
            value={formatNumberIndo(activeKpis.qtyLastMonth)}
            unit="Unit"
            subtext={activeKpis.lastMonthName}
            badgeText="Baseline"
            badgeType="blue"
            onClick={() =>
              setDetailModalState({ isOpen: true, type: 'last_month' })
            }
          />

          {/* Card 5: UNIT CACAT (NRFS) */}
          <KpiCard
            numberPrefix="5"
            title="UNIT CACAT (NRFS)"
            value={`${activeKpis.nrfsRate.toFixed(2)}%`}
            unit="Rate"
            subtext={`Max Limit: < ${activeKpis.nrfsMaxLimit.toFixed(2)}%`}
            badgeText={activeKpis.nrfsStatus}
            badgeType={activeKpis.nrfsStatus === 'Good' ? 'green' : 'red'}
            onClick={() =>
              setDetailModalState({ isOpen: true, type: 'nrfs' })
            }
          />

          {/* Card 7: ON-TIME DELIVERY */}
          <KpiCard
            numberPrefix="7"
            title="ON-TIME DELIVERY"
            value={`${activeKpis.otdRate.toFixed(1)}%`}
            unit="OTD Rate"
            subtext={`Target Min: > ${activeKpis.otdMinTarget.toFixed(1)}%`}
            badgeText={activeKpis.otdStatus}
            badgeType={activeKpis.otdStatus === 'On Target' ? 'green' : 'yellow'}
            onClick={() =>
              setDetailModalState({ isOpen: true, type: 'otd' })
            }
          />
        </div>

        {/* Middle Row: Left (Monthly Trend) & Right (Depo Share) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
          {/* Card 4: TREN DISTRIBUSI PER BULAN TAHUN BERJALAN */}
          <div className="lg:col-span-7">
            <MonthlyTrendChart
              data={activeTrendData}
              year={filters.year}
              onBarClick={(item) =>
                setDetailModalState({
                  isOpen: true,
                  type: 'mtd',
                  payload: item
                })
              }
            />
          </div>

          {/* Card 6: PROSENTASE DISTRIBUSI PER DEPO */}
          <div className="lg:col-span-5">
            <DepoDistributionChart
              data={data.depoDistribution}
              selectedDepo={filters.depo}
              onSelectDepo={(depoName) =>
                handleFilterChange({ depo: depoName })
              }
            />
          </div>
        </div>

        {/* Bottom Row: Card 8 (PERFORMANCE KONTRIBUSI & KUOTA PER EKSPEDISI) */}
        <div className="w-full">
          <ExpeditionPerformanceChart
            data={activeExpeditions}
            onSelectExpedition={(exp) =>
              setDetailModalState({
                isOpen: true,
                type: 'expedition',
                payload: exp
              })
            }
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* Raw Data Table Viewer Modal */}
      <DataViewerModal
        isOpen={isDataViewerOpen}
        onClose={() => setIsDataViewerOpen(false)}
        data={data}
      />

      {/* Metric Detail Drill-Down Modal */}
      <MetricDetailModal
        isOpen={detailModalState.isOpen}
        onClose={() =>
          setDetailModalState({ isOpen: false, type: null })
        }
        metricType={detailModalState.type}
        metricPayload={detailModalState.payload}
        kpis={activeKpis}
      />
    </div>
  );
}

'use client';

import { ProgressCard } from './progress-card';
import { StatCard } from './stat-card';
import { fmt, fmtP, fmtR } from '@/lib/utils';
import type { DashboardSummary, DailyTarget } from '@/types';

interface SummaryGridProps {
  summary: DashboardSummary;
  targets: DailyTarget;
}

export function SummaryGrid({ summary, targets }: SummaryGridProps) {
  const s = summary;
  const adPercent = s.totalSales > 0 ? (s.adCost / s.totalSales) * 100 : 0;
  const closeRate = s.messages > 0 ? (s.closed / s.messages) * 100 : 0;
  const costPerClick = s.messages > 0 ? s.adCost / s.messages : 0;
  const roas = s.adCost > 0 ? s.totalSales / s.adCost : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Progress Cards — 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ProgressCard label="กำไรรวม" value={s.profitTotal} displayVal={`${fmt(s.profitTotal)} ฿`} target={targets.profit} icon="💰" color={s.profitTotal >= 0 ? '#34d399' : '#f87171'} accent="rgba(52,211,153,0.12)" />
        <ProgressCard label="%ค่าแอด" value={adPercent} displayVal={fmtP(adPercent)} target={targets.adPercent} targetLabel={`ไม่เกิน ${targets.adPercent}%`} icon="📢" color="#fbbf24" accent="rgba(251,191,36,0.12)" />
        <ProgressCard label="%ปิดการขาย" value={closeRate} displayVal={fmtP(closeRate)} target={targets.closeRate} icon="🎯" color="#818cf8" accent="rgba(129,140,248,0.12)" />
        <ProgressCard label="ค่าคลิก/ทัก" value={costPerClick} displayVal={`${fmt(costPerClick)} ฿`} target={targets.costPerClick} targetLabel={`ไม่เกิน ${fmt(targets.costPerClick)} ฿`} icon="👆" color="#f472b6" accent="rgba(244,114,182,0.12)" />
      </div>

      {/* Stat Cards — rows */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="ค่าแอดรวม" value={`${fmt(s.adCost)} ฿`} icon="💸" accent="rgba(251,191,36,0.12)" />
        <StatCard label="คนทักรวม" value={fmt(s.messages)} icon="💬" accent="rgba(129,140,248,0.12)" />
        <StatCard label="ปิดได้รวม" value={fmt(s.closed)} icon="✅" accent="rgba(52,211,153,0.12)" />
        <StatCard label="ยอดขายรวม" value={`${fmt(s.totalSales)} ฿`} icon="📈" accent="rgba(52,211,153,0.12)" />
        <StatCard label="ROAS" value={fmtR(roas)} icon="🔄" accent="rgba(167,139,250,0.12)" />
        <StatCard label="ยอดขายเพจ" value={`${fmt(s.salesPage)} ฿`} icon="🛒" accent="rgba(52,211,153,0.12)" />
        <StatCard label="ยอดขาย CRM" value={`${fmt(s.crmSales)} ฿`} icon="🤝" accent="rgba(99,102,241,0.12)" />
        <StatCard label="ชิ้น CRM" value={fmt(s.crmQty)} icon="📦" accent="rgba(129,140,248,0.12)" />
        <StatCard label="กำไรเพจ" value={`${fmt(s.profitPage)} ฿`} icon="💚" accent="rgba(52,211,153,0.12)" />
        <StatCard label="กำไร CRM" value={`${fmt(s.profitCRM)} ฿`} icon="💜" accent="rgba(99,102,241,0.12)" />
      </div>
    </div>
  );
}

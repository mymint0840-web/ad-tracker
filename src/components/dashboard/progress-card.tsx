'use client';

import { Card } from '@/components/ui/card';
import { fmt } from '@/lib/utils';

interface ProgressCardProps {
  label: string;
  value: number | null;
  displayVal: string;
  target: number;
  targetLabel?: string;
  icon: string;
  color?: string;
  accent?: string;
}

export function ProgressCard({ label, value, displayVal, target, targetLabel, icon, color, accent }: ProgressCardProps) {
  const isInverse = label === '%ค่าแอด' || label === 'ค่าคลิก/ทัก';
  let pct = 0;
  if (target && value != null && isFinite(value)) {
    if (isInverse) {
      pct = value <= target ? 100 : Math.max(0, Math.min((target / value) * 100, 100));
    } else {
      pct = Math.min((value / target) * 100, 100);
    }
  }
  const barColor = pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171';

  return (
    <Card className="relative overflow-hidden bg-white/[0.04] border-white/[0.08] rounded-[18px] p-[22px_24px]">
      <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full blur-[24px]" style={{ background: accent || 'rgba(99,102,241,0.12)' }} />
      <div className="flex items-center gap-2.5 mb-2">
        <span className="text-[22px]">{icon}</span>
        <span className="text-sm text-white/55 font-semibold">{label}</span>
      </div>
      <div className="text-[28px] font-extrabold font-mono mb-2.5" style={{ color: color || '#fff' }}>
        {displayVal}
      </div>
      {target != null && (
        <>
          <div className="bg-white/[0.08] rounded-md h-2 overflow-hidden mb-1.5">
            <div className="h-full rounded-md transition-all duration-[600ms]" style={{ width: `${pct}%`, background: barColor }} />
          </div>
          <div className="text-xs text-white/35">
            เป้า: {targetLabel || fmt(target)} ({pct.toFixed(0)}%)
          </div>
        </>
      )}
    </Card>
  );
}

import { Card } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  accent?: string;
}

export function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden bg-white/[0.04] border-white/[0.08] rounded-[18px] p-[20px_24px]">
      <div className="absolute -top-5 -right-5 w-[70px] h-[70px] rounded-full blur-[20px]" style={{ background: accent || 'rgba(99,102,241,0.12)' }} />
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-xl">{icon}</span>
        <span className="text-[13px] text-white/50 font-semibold">{label}</span>
      </div>
      <div className="text-[26px] font-extrabold text-white font-mono">{value}</div>
    </Card>
  );
}

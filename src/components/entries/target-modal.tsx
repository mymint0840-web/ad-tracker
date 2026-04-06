'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DailyTarget } from '@/types';

interface TargetModalProps {
  open: boolean;
  onClose: () => void;
  targets: DailyTarget;
  onSave: (data: Partial<DailyTarget>) => void;
}

export function TargetModal({ open, onClose, targets, onSave }: TargetModalProps) {
  const [form, setForm] = useState(targets);
  const set = (k: keyof DailyTarget) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md bg-gradient-to-br from-[#1a1b2e] to-[#131424] border-white/[0.08] text-white">
        <DialogHeader><DialogTitle className="text-xl font-extrabold">🎯 ตั้งเป้าหมายรายวัน</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Field label="เป้ากำไร (฿/วัน)" value={form.profit} onChange={set('profit')} />
          <Field label="เป้า %ค่าแอด" value={form.adPercent} onChange={set('adPercent')} />
          <Field label="เป้า %ปิดการขาย" value={form.closeRate} onChange={set('closeRate')} />
          <Field label="เป้าค่าคลิก/ทัก (฿)" value={form.costPerClick} onChange={set('costPerClick')} />
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="ghost" onClick={onClose} className="text-white/60">ยกเลิก</Button>
          <Button onClick={() => { onSave({ profit: Number(form.profit) || 0, adPercent: Number(form.adPercent) || 0, closeRate: Number(form.closeRate) || 0, costPerClick: Number(form.costPerClick) || 0 }); onClose(); }} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold">💾 บันทึก</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[13px] text-white/50 font-semibold">{label}</label>
      <Input type="number" value={value} onChange={onChange} className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl" />
    </div>
  );
}

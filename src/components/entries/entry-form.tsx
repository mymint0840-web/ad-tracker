'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateEntry } from '@/lib/calculations';
import { fmt, fmtP, fmtR } from '@/lib/utils';
import type { Entry, Product, AdAccount, Page, EntryFormData } from '@/types';

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EntryFormData) => void;
  entry?: Entry | null;
  products: Product[];
  accounts: AdAccount[];
  pages: Page[];
}

const emptyForm: EntryFormData = {
  date: new Date().toISOString().split('T')[0],
  accountId: '', productId: '', pageId: '',
  adCost: '', messages: '', closed: '', orders: '',
  salesFromPage: '', salesHot: '', quantity: '',
  crmSales: '', crmQty: '', crmOrders: '', crmProductId: '',
  shippingCost: '', packingCost: '', adminCommission: '',
  note: '',
};

export function EntryForm({ open, onClose, onSave, entry, products, accounts, pages }: EntryFormProps) {
  const [form, setForm] = useState<EntryFormData>(emptyForm);
  const isNew = !entry;

  useEffect(() => {
    if (entry) {
      setForm({
        date: entry.date, accountId: entry.accountId, productId: entry.productId, pageId: entry.pageId || '',
        adCost: entry.adCost, messages: entry.messages, closed: entry.closed, orders: entry.orders,
        salesFromPage: entry.salesFromPage, salesHot: entry.salesHot || '', quantity: entry.quantity,
        crmSales: entry.crmSales, crmQty: entry.crmQty, crmOrders: entry.crmOrders || '', crmProductId: entry.crmProductId || '',
        shippingCost: entry.shippingCost, packingCost: entry.packingCost, adminCommission: entry.adminCommission,
        note: entry.note || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [entry, open]);

  const set = (key: keyof EntryFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

  const prod = products.find(p => p.id === Number(form.productId));
  const calc = calculateEntry({
    adCost: Number(form.adCost) || 0, messages: Number(form.messages) || 0,
    closed: Number(form.closed) || 0, orders: Number(form.orders) || 0,
    salesFromPage: Number(form.salesFromPage) || 0, quantity: Number(form.quantity) || 0,
    salesHot: Number(form.salesHot) || 0, crmOrders: Number(form.crmOrders) || 0,
    crmSales: Number(form.crmSales) || 0, crmQty: Number(form.crmQty) || 0,
    shippingCost: Number(form.shippingCost) || 0, packingCost: Number(form.packingCost) || 0,
    adminCommission: Number(form.adminCommission) || 0,
    productCost: prod?.cost || 0,
  });

  const handleSave = () => { onSave(form); onClose(); };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[780px] max-h-[92vh] overflow-y-auto bg-gradient-to-br from-[#1a1b2e] to-[#131424] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{isNew ? '➕ เพิ่มข้อมูลใหม่' : '✏️ แก้ไขข้อมูล'}</DialogTitle>
          <p className="text-sm text-white/35">กรอกข้อมูลด้านล่าง • คำนวณอัตโนมัติ</p>
        </DialogHeader>

        {/* Basic Info */}
        <Section title="ข้อมูลพื้นฐาน" color="rgba(129,140,248,0.8)">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="วันที่" type="date" value={String(form.date)} onChange={set('date')} />
            <div className="space-y-1">
              <label className="text-[13px] text-white/50 font-semibold">บัญชียิงแอด</label>
              <select value={String(form.accountId)} onChange={set('accountId')} className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm px-4 outline-none">
                <option value="">เลือกบัญชี</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] text-white/50 font-semibold">เพจ</label>
              <select value={String(form.pageId)} onChange={set('pageId')} className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm px-4 outline-none">
                <option value="">เลือกเพจ</option>
                {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <label className="text-[13px] text-white/50 font-semibold">สินค้า</label>
            <select value={String(form.productId)} onChange={set('productId')} className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm px-4 outline-none">
              <option value="">เลือกสินค้า</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} — ต้นทุน {p.cost}฿ / ขาย {p.price}฿ / สต๊อก {p.stock}</option>)}
            </select>
          </div>
        </Section>

        {/* Ad Results */}
        <Section title="ผลการยิงแอด" color="rgba(251,191,36,0.8)">
          <div className="grid grid-cols-4 gap-3">
            <FormField label="ค่าแอด (฿)" type="number" value={String(form.adCost)} onChange={set('adCost')} />
            <FormField label="คนทัก" type="number" value={String(form.messages)} onChange={set('messages')} />
            <FormField label="ปิดได้" type="number" value={String(form.closed)} onChange={set('closed')} />
            <FormField label="ออเดอร์" type="number" value={String(form.orders)} onChange={set('orders')} />
          </div>
        </Section>

        {/* Sales */}
        <Section title="ยอดขาย" color="rgba(52,211,153,0.8)">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="ยอดขายเพจ (฿)" type="number" value={String(form.salesFromPage)} onChange={set('salesFromPage')} />
            <FormField label="ยอดขาย HOT (฿)" type="number" value={String(form.salesHot)} onChange={set('salesHot')} />
            <FormField label="จำนวนชิ้น (เพจ)" type="number" value={String(form.quantity)} onChange={set('quantity')} />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-3">
            <FormField label="ยอดขาย CRM (฿)" type="number" value={String(form.crmSales)} onChange={set('crmSales')} />
            <FormField label="ออเดอร์ CRM" type="number" value={String(form.crmOrders)} onChange={set('crmOrders')} />
            <div className="space-y-1">
              <label className="text-[13px] text-white/50 font-semibold">สินค้า CRM</label>
              <select value={String(form.crmProductId)} onChange={set('crmProductId')} className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm px-4 outline-none">
                <option value="">เลือกสินค้า</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <FormField label="จำนวนชิ้น (CRM)" type="number" value={String(form.crmQty)} onChange={set('crmQty')} />
          </div>
        </Section>

        {/* Extra Costs */}
        <Section title="ค่าใช้จ่ายเพิ่มเติม" color="rgba(244,114,182,0.8)">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="ค่าส่ง (฿)" type="number" value={String(form.shippingCost)} onChange={set('shippingCost')} />
            <FormField label="ค่าแพ็ค (฿)" type="number" value={String(form.packingCost)} onChange={set('packingCost')} />
            <FormField label="คอมแอดมิน (฿)" type="number" value={String(form.adminCommission)} onChange={set('adminCommission')} />
          </div>
        </Section>

        {/* Auto Calc */}
        <Section title="📊 คำนวณอัตโนมัติ" color="rgba(167,139,250,0.8)">
          <div className="grid grid-cols-3 gap-3 bg-white/[0.02] rounded-2xl p-5 border border-white/[0.05]">
            {[
              { label: 'Total Spend', val: `${fmt(Number(form.adCost) || 0)} ฿`, color: '#fbbf24' },
              { label: 'Revenue', val: `${fmt(calc.totalSales + (Number(form.salesHot) || 0))} ฿`, color: '#34d399' },
              { label: '%ค่าแอด', val: fmtP(calc.adPercent), color: '#fbbf24' },
              { label: '%ปิดการขาย', val: fmtP(calc.closeRate), color: '#818cf8' },
              { label: 'ค่าคลิก/ทัก', val: calc.costPerClick != null ? `${fmt(calc.costPerClick)} ฿` : '-', color: '#f472b6' },
              { label: 'ROAS', val: fmtR(calc.roas), color: '#a78bfa' },
              { label: 'กำไรเพจ', val: `${fmt(calc.profitPage)} ฿`, color: calc.profitPage >= 0 ? '#34d399' : '#f87171' },
              { label: 'กำไร CRM', val: `${fmt(calc.profitCRM)} ฿`, color: calc.profitCRM >= 0 ? '#34d399' : '#f87171' },
              { label: 'กำไรรวม', val: `${fmt(calc.profitTotal)} ฿`, color: calc.profitTotal >= 0 ? '#34d399' : '#f87171' },
            ].map(s => (
              <div key={s.label} className="text-center py-2">
                <div className="text-xs text-white/40 mb-1.5">{s.label}</div>
                <div className="text-xl font-extrabold font-mono" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </Section>

        <div className="flex gap-3 justify-end mt-2">
          <Button variant="ghost" onClick={onClose} className="text-white/60">ยกเลิก</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-8">💾 บันทึก</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[13px] font-bold tracking-wide uppercase mb-3" style={{ color }}>{title}</div>
      {children}
    </div>
  );
}

function FormField({ label, type = 'text', value, onChange }: { label: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[13px] text-white/50 font-semibold">{label}</label>
      <Input type={type} value={value} onChange={onChange} className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl h-10" />
    </div>
  );
}

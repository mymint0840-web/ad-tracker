'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThaiDatePicker } from '@/components/ui/thai-date-picker';
import { calculateEntry } from '@/lib/calculations';
import { fmt, fmtP, fmtR } from '@/lib/utils';
import { Plus, Trash2, ChevronDown, Search } from 'lucide-react';
import type { Entry, Product, AdAccount, Page, EntryFormData } from '@/types';

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EntryFormData) => Promise<void>;
  entry?: Entry | null;
  products: Product[];
  accounts: AdAccount[];
  pages: Page[];
  onAddPage?: (name: string) => Promise<unknown>;
}

interface ProductRow {
  productId: number | '';
  quantity: number | '';
}

// Searchable dropdown — uses fixed positioning + portal to escape Dialog overflow clipping
function FormSearchSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || dropRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, updatePos]);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm px-4 outline-none flex items-center gap-2 hover:bg-white/[0.08] transition-colors"
      >
        <span className="truncate flex-1 text-left text-white/90">{selected?.label || <span className="text-white/40">{placeholder}</span>}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/50 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropRef}
          className="fixed bg-[#1a1b2e] border border-white/[0.12] rounded-lg shadow-2xl overflow-hidden"
          style={{ top: pos.top, left: pos.left, width: Math.max(pos.width, 220), zIndex: 9999 }}
        >
          <div className="p-2 border-b border-white/[0.08]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="พิมพ์ค้นหา..."
                autoFocus
                className="w-full h-8 pl-8 pr-3 rounded-md bg-white/[0.08] border border-white/[0.1] text-sm text-white placeholder:text-white/40 outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  o.value === value ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-white/80 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-3 py-3 text-center text-xs text-white/40">ไม่พบ</div>}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const emptyForm: EntryFormData = {
  date: new Date().toISOString().split('T')[0],
  accountId: '', productId: '', pageId: '',
  adCost: '', messages: '', closed: '', orders: '',
  salesFromPage: '', hotSales: '', quantity: '',
  crmSales: '', crmQty: '', crmOrders: '', crmProductId: '',
  shippingCost: '', packingCost: '', adminCommission: '',
  note: '',
};

export function EntryForm({ open, onClose, onSave, entry, products, accounts, pages, onAddPage }: EntryFormProps) {
  const [form, setForm] = useState<EntryFormData>(emptyForm);
  const [adProducts, setAdProducts] = useState<ProductRow[]>([{ productId: '', quantity: '' }]);
  const [hotProducts, setHotProducts] = useState<ProductRow[]>([{ productId: '', quantity: '' }]);
  const [crmProducts, setCrmProducts] = useState<ProductRow[]>([{ productId: '', quantity: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !entry;

  useEffect(() => {
    if (entry) {
      setForm({
        date: entry.date, accountId: entry.accountId, productId: entry.productId, pageId: entry.pageId || '',
        adCost: entry.adCost, messages: entry.messages, closed: entry.closed, orders: entry.orders,
        salesFromPage: entry.salesFromPage, hotSales: entry.hotSales || '', quantity: entry.quantity,
        crmSales: entry.crmSales, crmQty: entry.crmQty, crmOrders: entry.crmOrders || '', crmProductId: entry.crmProductId || '',
        shippingCost: entry.shippingCost, packingCost: entry.packingCost, adminCommission: entry.adminCommission,
        note: entry.note || '',
      });
      // Load multi-product rows from API response
      const adRows = entry.products?.length
        ? entry.products.map((p: any) => ({ productId: p.productId || '', quantity: p.quantity || '' }))
        : [{ productId: entry.productId || '', quantity: entry.quantity || '' }];
      setAdProducts(adRows);

      const crmRows = (entry as any).crmProducts?.length
        ? (entry as any).crmProducts.map((p: any) => ({ productId: p.productId || '', quantity: p.quantity || '' }))
        : [{ productId: entry.crmProductId || '', quantity: entry.crmQty || '' }];
      setCrmProducts(crmRows);

      const hotRows = (entry as any).hotProducts?.length
        ? (entry as any).hotProducts.map((p: any) => ({ productId: p.productId || '', quantity: p.quantity || '' }))
        : [{ productId: '', quantity: '' }];
      setHotProducts(hotRows);
    } else {
      setForm(emptyForm);
      setAdProducts([{ productId: '', quantity: '' }]);
      setHotProducts([{ productId: '', quantity: '' }]);
      setCrmProducts([{ productId: '', quantity: '' }]);
    }
  }, [entry, open]);

  const set = (key: keyof EntryFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const setVal = (key: keyof EntryFormData, val: string | number) =>
    setForm(p => ({ ...p, [key]: val }));

  // Totals from product rows
  const mainProductId = adProducts[0]?.productId;
  const prod = products.find(p => p.id === Number(mainProductId));
  const totalAdQty = adProducts.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const totalCrmQty = crmProducts.reduce((s, r) => s + (Number(r.quantity) || 0), 0);

  const calc = calculateEntry({
    adCost: Number(form.adCost) || 0,
    messages: Number(form.messages) || 0,
    closed: Number(form.closed) || 0,
    orders: Number(form.orders) || 0,
    salesFromPage: Number(form.salesFromPage) || 0,
    quantity: totalAdQty,
    hotSales: Number(form.hotSales) || 0,
    crmOrders: Number(form.crmOrders) || 0,
    crmSales: Number(form.crmSales) || 0,
    crmQty: totalCrmQty,
    shippingCost: Number(form.shippingCost) || 0,
    packingCost: Number(form.packingCost) || 0,
    adminCommission: Number(form.adminCommission) || 0,
    productCost: prod?.cost || 0,
  });

  const handleSave = async () => {
    setError(null);

    // Validate required fields
    if (!form.accountId || String(form.accountId) === 'all') {
      setError('กรุณาเลือกบัญชียิงแอด');
      return;
    }
    if (!adProducts[0]?.productId) {
      setError('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const validAdProducts = adProducts
      .filter(r => r.productId && r.quantity)
      .map(r => ({ productId: Number(r.productId), quantity: Number(r.quantity) }));
    const validHotProducts = hotProducts
      .filter(r => r.productId && r.quantity)
      .map(r => ({ productId: Number(r.productId), quantity: Number(r.quantity) }));
    const validCrmProducts = crmProducts
      .filter(r => r.productId && r.quantity)
      .map(r => ({ productId: Number(r.productId), quantity: Number(r.quantity) }));

    const data = {
      ...form,
      quantity: totalAdQty || form.quantity,
      productId: adProducts[0]?.productId || form.productId,
      crmQty: totalCrmQty || form.crmQty,
      crmProductId: crmProducts[0]?.productId || form.crmProductId,
      adProducts: validAdProducts,
      hotProducts: validHotProducts,
      crmProducts: validCrmProducts,
    };

    setSaving(true);
    try {
      await onSave(data as EntryFormData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ — กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  const accountOpts = [{ value: 'all', label: 'ทั้งหมด' }, ...accounts.map(a => ({ value: String(a.id), label: a.name }))];
  const pageOpts = [{ value: 'all', label: 'ทั้งหมด' }, ...pages.map(p => ({ value: String(p.id), label: p.name }))];
  const productOpts = [{ value: '', label: 'เลือกสินค้า' }, ...products.map(p => ({ value: String(p.id), label: p.name }))];

  const handleAddPage = async () => {
    if (!newPageName.trim() || !onAddPage) return;
    await onAddPage(newPageName.trim());
    setNewPageName('');
    setShowAddPage(false);
  };

  function updateProductRow(rows: ProductRow[], setRows: (r: ProductRow[]) => void, idx: number, key: keyof ProductRow, val: string) {
    const next = [...rows];
    next[idx] = { ...next[idx], [key]: val };
    setRows(next);
  }

  function addProductRow(rows: ProductRow[], setRows: (r: ProductRow[]) => void) {
    setRows([...rows, { productId: '', quantity: '' }]);
  }

  function removeProductRow(rows: ProductRow[], setRows: (r: ProductRow[]) => void, idx: number) {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[820px] max-h-[92vh] overflow-y-auto bg-gradient-to-br from-[#1a1b2e] to-[#131424] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-white">{isNew ? '➕ เพิ่มข้อมูลใหม่' : '✏️ แก้ไขข้อมูล'}</DialogTitle>
          <p className="text-sm text-white/60">กรอกข้อมูลด้านล่าง • คำนวณอัตโนมัติ</p>
        </DialogHeader>

        {/* ข้อมูลพื้นฐาน */}
        <Section title="ข้อมูลพื้นฐาน" color="rgba(129,140,248,0.8)">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[13px] text-white/70 font-semibold">วันที่</label>
              <ThaiDatePicker value={String(form.date)} onChange={v => setVal('date', v)} />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] text-white/70 font-semibold">บัญชียิงแอด</label>
              <FormSearchSelect value={String(form.accountId)} onChange={v => setForm(p => ({ ...p, accountId: v as EntryFormData['accountId'] }))} options={accountOpts} placeholder="เลือกบัญชี" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[13px] text-white/70 font-semibold">เพจ</label>
                {onAddPage && (
                  <button type="button" onClick={() => setShowAddPage(!showAddPage)} className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> เพิ่มเพจ
                  </button>
                )}
              </div>
              {showAddPage && (
                <div className="flex gap-1.5 mb-1">
                  <input
                    type="text"
                    value={newPageName}
                    onChange={e => setNewPageName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddPage()}
                    placeholder="ชื่อเพจใหม่"
                    autoFocus
                    className="flex-1 h-8 rounded-lg bg-white/[0.08] border border-indigo-500/30 text-sm text-white px-3 outline-none placeholder:text-white/40 focus:border-indigo-500/60"
                  />
                  <button type="button" onClick={handleAddPage} className="h-8 px-3 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition-colors">บันทึก</button>
                </div>
              )}
              <FormSearchSelect value={String(form.pageId)} onChange={v => setForm(p => ({ ...p, pageId: v as EntryFormData['pageId'] }))} options={pageOpts} placeholder="เลือกเพจ" />
            </div>
          </div>
        </Section>

        {/* ผลการยิงแอด */}
        <Section title="ผลการยิงแอด" color="rgba(251,191,36,0.8)">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <FormField label="ค่าแอด (฿)" type="number" value={String(form.adCost)} onChange={set('adCost')} />
            <FormField label="คนทัก" type="number" value={String(form.messages)} onChange={set('messages')} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <FormField label="ยอดขาย (฿)" type="number" value={String(form.salesFromPage)} onChange={set('salesFromPage')} />
            <FormField label="ออเดอร์" type="number" value={String(form.orders)} onChange={set('orders')} />
          </div>

          {/* สินค้า multi-product */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] text-white/60 font-semibold uppercase tracking-wider">สินค้า (กดเพิ่มได้)</label>
              <button type="button" onClick={() => addProductRow(adProducts, setAdProducts)} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> เพิ่มสินค้า
              </button>
            </div>
            {adProducts.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_120px_32px] gap-2 items-end">
                <div className="space-y-1">
                  {idx === 0 && <label className="text-[12px] text-white/60">เลือกสินค้า</label>}
                  <FormSearchSelect
                    value={String(row.productId)}
                    onChange={v => updateProductRow(adProducts, setAdProducts, idx, 'productId', v)}
                    options={productOpts}
                    placeholder="เลือกสินค้า"
                  />
                </div>
                <div className="space-y-1">
                  {idx === 0 && <label className="text-[12px] text-white/60">จำนวนชิ้น</label>}
                  <Input type="number" value={String(row.quantity)} onChange={e => updateProductRow(adProducts, setAdProducts, idx, 'quantity', e.target.value)} placeholder="0" className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl h-10" />
                </div>
                <div>
                  {adProducts.length > 1 && (
                    <button type="button" onClick={() => removeProductRow(adProducts, setAdProducts, idx)} className="h-10 w-8 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ยอดขาย HOT */}
        <Section title="ยอดขาย HOT" color="rgba(251,146,60,0.8)">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <FormField label="ยอดขาย HOT (฿)" type="number" value={String(form.hotSales)} onChange={set('hotSales')} />
            <FormField label="ออเดอร์ HOT" type="number" value={String(form.orders)} onChange={set('orders')} />
          </div>

          {/* สินค้า HOT multi-product */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] text-white/60 font-semibold uppercase tracking-wider">สินค้า HOT (กดเพิ่มได้)</label>
              <button type="button" onClick={() => addProductRow(hotProducts, setHotProducts)} className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> เพิ่มสินค้า
              </button>
            </div>
            {hotProducts.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_120px_32px] gap-2 items-end">
                <div className="space-y-1">
                  {idx === 0 && <label className="text-[12px] text-white/60">เลือกสินค้า</label>}
                  <FormSearchSelect
                    value={String(row.productId)}
                    onChange={v => updateProductRow(hotProducts, setHotProducts, idx, 'productId', v)}
                    options={productOpts}
                    placeholder="เลือกสินค้า"
                  />
                </div>
                <div className="space-y-1">
                  {idx === 0 && <label className="text-[12px] text-white/60">จำนวนชิ้น</label>}
                  <Input type="number" value={String(row.quantity)} onChange={e => updateProductRow(hotProducts, setHotProducts, idx, 'quantity', e.target.value)} placeholder="0" className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl h-10" />
                </div>
                <div>
                  {hotProducts.length > 1 && (
                    <button type="button" onClick={() => removeProductRow(hotProducts, setHotProducts, idx)} className="h-10 w-8 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ยอดขาย CRM */}
        <Section title="ยอดขาย CRM" color="rgba(96,165,250,0.8)">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <FormField label="ยอดขาย CRM (฿)" type="number" value={String(form.crmSales)} onChange={set('crmSales')} />
            <FormField label="ออเดอร์ CRM" type="number" value={String(form.crmOrders)} onChange={set('crmOrders')} />
          </div>

          {/* สินค้า CRM multi-product */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] text-white/60 font-semibold uppercase tracking-wider">สินค้า CRM (กดเพิ่มได้)</label>
              <button type="button" onClick={() => addProductRow(crmProducts, setCrmProducts)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> เพิ่มสินค้า
              </button>
            </div>
            {crmProducts.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_120px_32px] gap-2 items-end">
                <div className="space-y-1">
                  {idx === 0 && <label className="text-[12px] text-white/60">เลือกสินค้า</label>}
                  <FormSearchSelect
                    value={String(row.productId)}
                    onChange={v => updateProductRow(crmProducts, setCrmProducts, idx, 'productId', v)}
                    options={productOpts}
                    placeholder="เลือกสินค้า"
                  />
                </div>
                <div className="space-y-1">
                  {idx === 0 && <label className="text-[12px] text-white/60">จำนวนชิ้น</label>}
                  <Input type="number" value={String(row.quantity)} onChange={e => updateProductRow(crmProducts, setCrmProducts, idx, 'quantity', e.target.value)} placeholder="0" className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl h-10" />
                </div>
                <div>
                  {crmProducts.length > 1 && (
                    <button type="button" onClick={() => removeProductRow(crmProducts, setCrmProducts, idx)} className="h-10 w-8 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ค่าใช้จ่ายเพิ่มเติม */}
        <Section title="ค่าใช้จ่ายเพิ่มเติม" color="rgba(244,114,182,0.8)">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="ค่าส่ง (฿)" type="number" value={String(form.shippingCost)} onChange={set('shippingCost')} />
            <FormField label="ค่าแพ็ค (฿)" type="number" value={String(form.packingCost)} onChange={set('packingCost')} />
            <FormField label="คอมแอดมิน (฿)" type="number" value={String(form.adminCommission)} onChange={set('adminCommission')} />
          </div>
        </Section>

        {/* คำนวณอัตโนมัติ */}
        <Section title="📊 คำนวณอัตโนมัติ" color="rgba(167,139,250,0.8)">
          <div className="grid grid-cols-3 gap-3 bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06]">
            {[
              { label: 'Total Spend', val: `${fmt(Number(form.adCost) || 0)} ฿`, color: '#fbbf24' },
              { label: 'Revenue', val: `${fmt((Number(form.salesFromPage) || 0) + (Number(form.hotSales) || 0) + (Number(form.crmSales) || 0))} ฿`, color: '#34d399' },
              { label: '%ค่าแอด', val: fmtP(calc.adPercent), color: '#fbbf24' },
              { label: '%ปิดการขาย', val: fmtP(calc.closeRate), color: '#818cf8' },
              { label: 'ค่าคลิก/ทัก', val: calc.costPerClick != null ? `${fmt(calc.costPerClick)} ฿` : '-', color: '#f472b6' },
              { label: 'ROAS', val: fmtR(calc.roas), color: '#a78bfa' },
              { label: 'กำไรเพจ', val: `${fmt(calc.profitPage)} ฿`, color: calc.profitPage >= 0 ? '#34d399' : '#f87171' },
              { label: 'กำไร CRM', val: `${fmt(calc.profitCRM)} ฿`, color: calc.profitCRM >= 0 ? '#34d399' : '#f87171' },
              { label: 'กำไรรวม', val: `${fmt(calc.profitTotal)} ฿`, color: calc.profitTotal >= 0 ? '#34d399' : '#f87171' },
            ].map(s => (
              <div key={s.label} className="text-center py-2">
                <div className="text-xs text-white/60 mb-1.5">{s.label}</div>
                <div className="text-xl font-extrabold font-mono" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Error toast */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving} className="text-white/70">ยกเลิก</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-8 disabled:opacity-50">
            {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
          </Button>
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
      <label className="text-[13px] text-white/70 font-semibold">{label}</label>
      <Input type={type} value={value} onChange={onChange} placeholder="0" className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl h-10" />
    </div>
  );
}

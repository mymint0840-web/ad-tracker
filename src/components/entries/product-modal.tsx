'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import type { Product } from '@/types';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onAdd: (p: Omit<Product, 'id' | 'isActive'>) => void;
  onUpdate: (id: number, data: Partial<Product>) => void;
  onDelete: (id: number) => void;
}

export function ProductModal({ open, onClose, products, onAdd, onUpdate, onDelete }: ProductModalProps) {
  const [newP, setNewP] = useState({ name: '', cost: '', price: '', stock: '' });

  const handleAdd = () => {
    if (!newP.name.trim()) return;
    onAdd({ name: newP.name.trim(), cost: Number(newP.cost) || 0, price: Number(newP.price) || 0, stock: Number(newP.stock) || 0 });
    setNewP({ name: '', cost: '', price: '', stock: '' });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[700px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-[#1a1b2e] to-[#131424] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">📦 จัดการสินค้า</DialogTitle>
          <p className="text-sm text-white/35">เพิ่ม แก้ไข ลบสินค้า และจัดการสต๊อก</p>
        </DialogHeader>

        {/* Add new */}
        <div className="bg-indigo-500/[0.06] border border-indigo-500/[0.12] rounded-2xl p-5 mb-4">
          <div className="text-[13px] text-indigo-300/80 font-bold mb-3">➕ เพิ่มสินค้าใหม่</div>
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2.5 items-end">
            <div className="space-y-1"><label className="text-xs text-white/50">ชื่อ</label><Input value={newP.name} onChange={e => setNewP(p => ({ ...p, name: e.target.value }))} className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl" /></div>
            <div className="space-y-1"><label className="text-xs text-white/50">ต้นทุน</label><Input type="number" value={newP.cost} onChange={e => setNewP(p => ({ ...p, cost: e.target.value }))} className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl" /></div>
            <div className="space-y-1"><label className="text-xs text-white/50">ราคาขาย</label><Input type="number" value={newP.price} onChange={e => setNewP(p => ({ ...p, price: e.target.value }))} className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl" /></div>
            <div className="space-y-1"><label className="text-xs text-white/50">สต๊อก</label><Input type="number" value={newP.stock} onChange={e => setNewP(p => ({ ...p, stock: e.target.value }))} className="bg-white/[0.06] border-white/[0.1] text-white font-mono rounded-xl" /></div>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold h-9">เพิ่ม</Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          {products.length === 0 && <div className="text-center py-8 text-white/25">ยังไม่มีสินค้า</div>}
          {products.map(p => (
            <div key={p.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2.5 items-center bg-white/[0.03] rounded-xl px-3.5 py-2.5 border border-white/[0.05]">
              <span className="text-white font-semibold text-sm">{p.name}</span>
              <span className="text-amber-300 font-mono text-sm">{p.cost} ฿</span>
              <span className="text-emerald-300 font-mono text-sm">{p.price} ฿</span>
              <span className="text-indigo-300 font-mono text-sm">{p.stock} ชิ้น</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/60 hover:text-red-400" onClick={() => onDelete(p.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onClose} className="text-white/60">ปิด</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

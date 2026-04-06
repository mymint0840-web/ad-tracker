'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fmt, fmtP, fmtR } from '@/lib/utils';
import { calculateEntry } from '@/lib/calculations';
import { Pencil, Trash2 } from 'lucide-react';
import type { Entry, Product } from '@/types';

interface EntryTableProps {
  entries: Entry[];
  products: Product[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: number) => void;
}

export function EntryTable({ entries, products, onEdit, onDelete }: EntryTableProps) {
  return (
    <Card className="bg-white/[0.04] border-white/[0.08] rounded-[18px] p-5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/[0.08]">
              {['วันที่','บัญชี','สินค้า','ค่าแอด','คนทัก','ปิดได้','ออเดอร์','ยอดเพจ','ชิ้น','CRM','ชิ้นCRM','ค่าส่ง','ค่าแพ็ค','คอม','ยอดรวม','%แอด','%ปิด','ROAS','กำไร',''].map((h, i) => (
                <th key={i} className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider pb-3 px-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={20} className="text-center py-12 text-white/25 text-base">ยังไม่มีข้อมูล — กดเพิ่มข้อมูลใหม่</td></tr>
            )}
            {entries.map(entry => {
              const prod = products.find(p => p.id === entry.productId);
              const c = calculateEntry({ ...entry, productCost: prod?.cost || 0 });
              return (
                <tr key={entry.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-2 text-white/70">{entry.date}</td>
                  <td className="py-2.5 px-2 text-white/70">{entry.account?.name || '-'}</td>
                  <td className="py-2.5 px-2 text-white font-medium">{entry.product?.name || '-'}</td>
                  <td className="py-2.5 px-2 text-amber-300 font-mono">{fmt(entry.adCost)}</td>
                  <td className="py-2.5 px-2 text-white/70 font-mono">{entry.messages}</td>
                  <td className="py-2.5 px-2 text-white/70 font-mono">{entry.closed}</td>
                  <td className="py-2.5 px-2 text-white/70 font-mono">{entry.orders}</td>
                  <td className="py-2.5 px-2 text-emerald-300 font-mono">{fmt(entry.salesFromPage)}</td>
                  <td className="py-2.5 px-2 text-white/70 font-mono">{entry.quantity}</td>
                  <td className="py-2.5 px-2 text-indigo-300 font-mono">{fmt(entry.crmSales)}</td>
                  <td className="py-2.5 px-2 text-white/70 font-mono">{entry.crmQty}</td>
                  <td className="py-2.5 px-2 text-white/50 font-mono">{fmt(entry.shippingCost)}</td>
                  <td className="py-2.5 px-2 text-white/50 font-mono">{fmt(entry.packingCost)}</td>
                  <td className="py-2.5 px-2 text-white/50 font-mono">{fmt(entry.adminCommission)}</td>
                  <td className="py-2.5 px-2 text-emerald-400 font-mono font-bold">{fmt(c.totalSales)}</td>
                  <td className="py-2.5 px-2 text-amber-300 font-mono">{fmtP(c.adPercent)}</td>
                  <td className="py-2.5 px-2 text-indigo-300 font-mono">{fmtP(c.closeRate)}</td>
                  <td className="py-2.5 px-2 text-purple-300 font-mono">{fmtR(c.roas)}</td>
                  <td className={`py-2.5 px-2 font-mono font-bold ${c.profitTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(c.profitTotal)}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white" onClick={() => onEdit(entry)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-red-400" onClick={() => onDelete(entry.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

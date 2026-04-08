'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import type { Page } from '@/types';

interface PageModalProps {
  open: boolean;
  onClose: () => void;
  pages: Page[];
  onAdd: (name: string) => Promise<unknown>;
  onDelete?: (id: number) => void;
}

export function PageModal({ open, onClose, pages, onAdd, onDelete }: PageModalProps) {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await onAdd(newName.trim());
      setNewName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md bg-gradient-to-br from-[#1a1b2e] to-[#131424] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">📄 จัดการเพจ</DialogTitle>
        </DialogHeader>

        {/* Add new page */}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="ชื่อเพจใหม่"
            className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl"
          />
          <Button onClick={handleAdd} disabled={loading || !newName.trim()} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold gap-1 shrink-0">
            <Plus className="h-4 w-4" />
            เพิ่ม
          </Button>
        </div>

        {/* Page list */}
        <div className="space-y-1 max-h-60 overflow-y-auto mt-2">
          {pages.length === 0 && (
            <p className="text-center text-white/40 text-sm py-4">ยังไม่มีเพจ</p>
          )}
          {pages.map(page => (
            <div key={page.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] group">
              <span className="text-sm text-white/80">{page.name}</span>
              {onDelete && (
                <button onClick={() => onDelete(page.id)} className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-2">
          <Button variant="ghost" onClick={onClose} className="text-white/70">ปิด</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

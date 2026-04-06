'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import type { AdAccount } from '@/types';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  accounts: AdAccount[];
  onAdd: (name: string) => void;
  onDelete: (id: number) => void;
}

export function AccountModal({ open, onClose, accounts, onAdd, onDelete }: AccountModalProps) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md bg-gradient-to-br from-[#1a1b2e] to-[#131424] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">💳 จัดการบัญชียิงแอด</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อบัญชีใหม่" className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <Button onClick={handleAdd} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold">เพิ่ม</Button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {accounts.map(a => (
            <div key={a.id} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.05]">
              <span className="text-white font-medium">{a.name}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/60 hover:text-red-400" onClick={() => onDelete(a.id)}>
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

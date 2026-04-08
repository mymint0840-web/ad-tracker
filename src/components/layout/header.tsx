'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Target, Package, CreditCard, FileText, LogOut } from 'lucide-react';

interface HeaderProps {
  onShowTargets: () => void;
  onShowProducts: () => void;
  onShowAccounts: () => void;
  onShowPages?: () => void;
}

export function Header({ onShowTargets, onShowProducts, onShowAccounts, onShowPages }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          📊 Ad Performance Tracker
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">ติดตามผลยิงแอด • วิเคราะห์ต้นทุน • คำนวณกำไร</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1.5" onClick={onShowTargets}>
          <Target className="h-4 w-4" />
          เป้าหมาย
        </Button>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1.5" onClick={onShowProducts}>
          <Package className="h-4 w-4" />
          สินค้า
        </Button>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1.5" onClick={onShowAccounts}>
          <CreditCard className="h-4 w-4" />
          บัญชี
        </Button>
        {onShowPages && (
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1.5" onClick={onShowPages}>
            <FileText className="h-4 w-4" />
            เพจ
          </Button>
        )}
        {session && (
          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/[0.08]">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
              {session.user?.name?.[0] || '?'}
            </div>
            <span className="text-sm text-zinc-300">{session.user?.name}</span>
            <Button variant="outline" size="sm" className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300 gap-1.5 ml-1" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="h-3.5 w-3.5" />
              ออกจากระบบ
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

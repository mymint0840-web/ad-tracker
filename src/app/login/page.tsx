'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e1a] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📊</div>
          <h1 className="text-2xl font-bold text-white">Ad Performance Tracker</h1>
          <p className="text-sm text-zinc-500 mt-1">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-zinc-400">อีเมล</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-zinc-400">รหัสผ่าน</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              required
              className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl h-11"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Ad Performance Tracker v1.0
        </p>
      </div>
    </div>
  );
}

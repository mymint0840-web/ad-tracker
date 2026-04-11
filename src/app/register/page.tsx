'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('รหัสผ่านอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: normalizedEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'สมัครไม่สำเร็จ');
        setLoading(false);
        return;
      }

      // Auto-signin with the same normalized email the API stored
      const result = await signIn('credentials', {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (result?.ok && !result.error) {
        router.push('/');
        router.refresh();
        return;
      }

      // Auto-signin failed (e.g., NEXTAUTH_SECRET missing) — fall back to /login
      // with a one-shot success flag so the login page can show a confirmation toast.
      router.push('/login?registered=1');
    } catch {
      // Network/fetch error — surface inline so the user knows what happened
      // instead of staying silently on /register.
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0e1a] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📊</div>
          <h1 className="text-2xl font-bold text-white">สมัครสมาชิก</h1>
          <p className="text-sm text-zinc-500 mt-1">สร้างบัญชีเพื่อเริ่มใช้งาน</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-zinc-400">ชื่อ</label>
            <Input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ชื่อของคุณ"
              required
              className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl h-11"
            />
          </div>
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
              placeholder="อย่างน้อย 8 ตัวอักษร"
              required
              minLength={8}
              className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-zinc-400">ยืนยันรหัสผ่าน</label>
            <Input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              required
              minLength={8}
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
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            เข้าสู่ระบบ
          </Link>
        </p>

        <p className="text-center text-xs text-zinc-600 mt-3">
          Ad Performance Tracker v1.0
        </p>
      </div>
    </div>
  );
}

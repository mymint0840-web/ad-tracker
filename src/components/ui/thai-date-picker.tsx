'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

interface ThaiDatePickerProps {
  value: string; // ISO format: yyyy-mm-dd
  onChange: (value: string) => void;
}

export function ThaiDatePicker({ value, onChange }: ThaiDatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [viewYear, setViewYear] = useState(selected.getFullYear());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [value, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDaysCount = new Date(viewYear, viewMonth, 0).getDate();

  const days: { day: number; current: boolean; date: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevDaysCount - i, current: false, date: '' });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const m = (viewMonth + 1).toString().padStart(2, '0');
    const d = i.toString().padStart(2, '0');
    days.push({ day: i, current: true, date: `${viewYear}-${m}-${d}` });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false, date: '' });
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isSelected = (dateStr: string) => dateStr === value;
  const isToday = (dateStr: string) => dateStr === todayStr;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm px-4 outline-none flex items-center gap-2.5 hover:bg-white/[0.08] transition-colors"
      >
        <Calendar className="w-4 h-4 text-indigo-400/70 shrink-0" />
        <span className={value ? 'text-white/90 font-mono tracking-wide' : 'text-white/40'}>
          {value ? formatThaiDate(value) : 'เลือกวันที่'}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-[300px] bg-gradient-to-br from-[#1e1f35] to-[#181928] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden p-4">
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-bold text-white">
              {THAI_MONTHS[viewMonth]} <span className="text-indigo-300">{viewYear + 543}</span>
            </div>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {THAI_DAYS.map(d => (
              <div key={d} className="text-center text-[11px] text-white/35 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => (
              <button
                key={i}
                type="button"
                disabled={!d.current}
                onClick={() => {
                  if (d.current) {
                    onChange(d.date);
                    setOpen(false);
                  }
                }}
                className={`h-9 rounded-lg text-sm font-medium transition-all ${
                  !d.current
                    ? 'text-white/10 cursor-default'
                    : isSelected(d.date)
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/20'
                      : isToday(d.date)
                        ? 'bg-white/[0.06] text-indigo-300 ring-1 ring-indigo-500/40'
                        : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {d.day}
              </button>
            ))}
          </div>

          {/* Today shortcut */}
          <button
            type="button"
            onClick={() => {
              onChange(todayStr);
              setOpen(false);
              setViewMonth(new Date().getMonth());
              setViewYear(new Date().getFullYear());
            }}
            className="w-full mt-3 py-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-white/[0.04] rounded-xl border border-white/[0.06] transition-colors"
          >
            📅 วันนี้
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { Calendar } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/':            '대시보드',
  '/customers':   '고객관리',
  '/reservations':'예약관리',
  '/passes':      '이용권관리',
  '/finance':     '입출금관리',
  '/settings':    '설정',
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'DL STUDIO';

  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });

  return (
    <header className="h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 shrink-0">
      <h1 className="text-lg font-bold text-[#1F2937]">{title}</h1>
      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
        <Calendar size={15} />
        <span>{dateStr}</span>
      </div>
    </header>
  );
}

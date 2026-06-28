'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, TrendingUp, CalendarDays, Settings, Ticket, Wallet, Stethoscope } from 'lucide-react';

const navItems = [
  { href: '/',             label: '대시보드',    icon: LayoutDashboard },
  { href: '/customers',   label: '고객관리',    icon: Users },
  { href: '/reservations',label: '예약관리',    icon: CalendarDays },
  { href: '/passes',      label: '이용권관리',  icon: Ticket },
  { href: '/martin-prescription', label: '마틴골프처방전', icon: Stethoscope },
  { href: '/sales',       label: '매출관리',    icon: Wallet },
  { href: '/finance',     label: '입출금관리',  icon: TrendingUp },
];

const bottomNavItems = [
  { href: '/settings', label: '설정', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (href: string) => {
    const active = pathname === href;
    return `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 ${
      active
        ? 'bg-[#111827] text-white shadow-sm'
        : 'text-[#C8D0DA] hover:bg-[#2D3748] hover:text-white'
    }`;
  };

  return (
    <aside className="w-60 min-h-screen bg-[#202B3F] flex flex-col shrink-0">
      {/* 로고 */}
      <div className="px-5 py-6 border-b border-[#2D3748]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2F80A7] rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-xs tracking-tight">DL</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">DL STUDIO</p>
            <p className="text-[#4BA3C7] text-[10px] mt-0.5">Golf Body Mechanism</p>
          </div>
        </div>
      </div>

      {/* 메인 네비 */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold text-[#4B5A72] uppercase tracking-widest px-4 mb-3">Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <Icon size={17} className={pathname === href ? 'text-[#4BA3C7]' : 'text-[#4BA3C7]/70'} />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </nav>

      {/* 하단 설정 */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-[#2D3748] pt-3">
        {bottomNavItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <Icon size={17} className={pathname === href ? 'text-[#4BA3C7]' : 'text-[#4BA3C7]/70'} />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
        <div className="px-4 pt-3">
          <p className="text-[#4B5A72] text-[10px] text-center leading-relaxed">몸을 바꾸어 스윙을 바꾼다</p>
        </div>
      </div>
    </aside>
  );
}

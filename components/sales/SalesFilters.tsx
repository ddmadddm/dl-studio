'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  SalePaymentStatus, SaleType, SALE_PAYMENT_STATUSES, SALE_TYPES,
} from '@/types/sale';

export interface SalesFilterState {
  year: string;                          // '전체' | '2026' ...
  month: string;                         // '전체' | '01' ~ '12'
  search: string;                        // 매출명/고객명/프로그램명/메모
  dateUnknownOnly: boolean;
  unlinkedOnly: boolean;                 // 입금·이용권 미연결 매출만
  paymentStatus: SalePaymentStatus | '전체';
  saleType: SaleType | '전체';
}

export function makeDefaultFilters(): SalesFilterState {
  return {
    year: String(new Date().getFullYear()),
    month: '전체',
    search: '',
    dateUnknownOnly: false,
    unlinkedOnly: false,
    paymentStatus: '전체',
    saleType: '전체',
  };
}

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

interface Props {
  filters: SalesFilterState;
  years: string[];            // 선택 가능 연도 목록
  onChange: (f: SalesFilterState) => void;
}

export default function SalesFilters({ filters, years, onChange }: Props) {
  const set = (patch: Partial<SalesFilterState>) => onChange({ ...filters, ...patch });

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-[#202B3F] text-white' : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'}`;

  const selectCls =
    'h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2F80A7]/30';

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
      {/* 상단: 연/월/검색/날짜미정 */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={filters.year} onChange={(e) => set({ year: e.target.value })} className={selectCls}>
          <option value="전체">연도 전체</option>
          {years.map((y) => <option key={y} value={y}>{y}년</option>)}
        </select>

        <select value={filters.month} onChange={(e) => set({ month: e.target.value })} className={selectCls}>
          <option value="전체">월 전체</option>
          {MONTHS.map((m) => <option key={m} value={m}>{parseInt(m, 10)}월</option>)}
        </select>

        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            placeholder="매출명 · 고객명 · 프로그램명 · 메모 검색"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="pl-8 border-[#E5E7EB] h-9 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.dateUnknownOnly}
            onChange={(e) => set({ dateUnknownOnly: e.target.checked })}
            className="w-4 h-4 rounded border-[#E5E7EB] accent-[#2F80A7]"
          />
          날짜미정만
        </label>

        <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.unlinkedOnly}
            onChange={(e) => set({ unlinkedOnly: e.target.checked })}
            className="w-4 h-4 rounded border-[#E5E7EB] accent-[#A17400]"
          />
          미연결만
        </label>
      </div>

      {/* 결제상태 필터 */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-[#9CA3AF] w-16">결제상태</span>
        <button onClick={() => set({ paymentStatus: '전체' })} className={chip(filters.paymentStatus === '전체')}>전체</button>
        {SALE_PAYMENT_STATUSES.map((s) => (
          <button key={s} onClick={() => set({ paymentStatus: s })} className={chip(filters.paymentStatus === s)}>{s}</button>
        ))}
      </div>

      {/* 매출유형 필터 */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-[#9CA3AF] w-16">매출유형</span>
        <button onClick={() => set({ saleType: '전체' })} className={chip(filters.saleType === '전체')}>전체</button>
        {SALE_TYPES.map((t) => (
          <button key={t} onClick={() => set({ saleType: t })} className={chip(filters.saleType === t)}>{t}</button>
        ))}
      </div>
    </div>
  );
}

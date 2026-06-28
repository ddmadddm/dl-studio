'use client';

import { useState } from 'react';
import { Sale, SalePaymentStatus } from '@/types/sale';
import { Pencil, EyeOff, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

const payBadge: Record<SalePaymentStatus, string> = {
  결제완료: 'bg-[#E8F6EF] text-[#2F8F5B]',
  미수금:  'bg-[#FDECEA] text-[#C24132]',
  부분결제: 'bg-[#FFF6D8] text-[#A17400]',
  환불:    'bg-[#F3F4F6] text-[#9CA3AF]',
};

interface Props {
  sales: Sale[];                         // 이미 필터링된 매출 목록
  onSelect: (s: Sale) => void;
  onEdit: (s: Sale) => void;
  onDeactivate: (id: string) => void;
}

type SortKey = 'saleDate' | 'customerName' | 'saleTitle' | 'saleType' | 'programName' | 'amount' | 'paymentMethod' | 'paymentStatus';

export default function SalesTable({ sales, onSelect, onEdit, onDeactivate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>('saleDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = sortKey
    ? [...sales].sort((a, b) => {
        const cmp = sortKey === 'amount'
          ? a.amount - b.amount
          : String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), 'ko');
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : sales;

  const headers: { label: string; key?: SortKey }[] = [
    { label: '매출일', key: 'saleDate' },
    { label: '고객명', key: 'customerName' },
    { label: '매출명', key: 'saleTitle' },
    { label: '매출유형', key: 'saleType' },
    { label: '프로그램명', key: 'programName' },
    { label: '금액', key: 'amount' },
    { label: '결제수단', key: 'paymentMethod' },
    { label: '결제상태', key: 'paymentStatus' },
    { label: '계산서' },
    { label: '메모' },
    { label: '' },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6F8] border-b border-[#E5E7EB]">
            <tr>
              {headers.map((h, i) => (
                <th key={h.label || i} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] whitespace-nowrap">
                  {h.key ? (
                    <button
                      onClick={() => toggleSort(h.key!)}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-[#2F80A7] ${sortKey === h.key ? 'text-[#2F80A7]' : ''}`}
                    >
                      {h.label}
                      {sortKey === h.key
                        ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                        : <ChevronsUpDown size={12} className="text-[#C0C6CF]" />}
                    </button>
                  ) : h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F6F8]">
            {sorted.length === 0 ? (
              <tr><td colSpan={headers.length} className="text-center py-12 text-[#9CA3AF]">매출 내역이 없습니다.</td></tr>
            ) : sorted.map((s) => (
              <tr key={s.id} className="hover:bg-[#F4F6F8]/60 transition-colors cursor-pointer" onClick={() => onSelect(s)}>
                <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                  {s.isDateUnknown ? <span className="text-[#A17400]">날짜미정</span> : s.saleDate}
                </td>
                <td className="px-4 py-3 font-medium text-[#1F2937] whitespace-nowrap">{s.customerName}</td>
                <td className="px-4 py-3 text-[#374151] max-w-[160px] truncate">{s.saleTitle}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#EAF4FA] text-[#1F6A8C]">{s.saleType}</span>
                </td>
                <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{s.programName || '—'}</td>
                <td className="px-4 py-3 font-semibold text-[#1F2937] whitespace-nowrap">
                  {s.paymentStatus === '환불' ? '-' : ''}{s.amount.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{s.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payBadge[s.paymentStatus]}`}>{s.paymentStatus}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {s.invoiceStatus === '발행완료'
                    ? <span className="text-xs font-medium text-[#2F8F5B]">✓ 발행</span>
                    : s.invoiceStatus === '해당없음'
                      ? <span className="text-xs text-[#9CA3AF]">해당없음</span>
                      : <span className="text-xs text-[#D1D5DB]">미발행</span>}
                </td>
                <td className="px-4 py-3 text-[#9CA3AF] text-xs max-w-32 truncate">{s.memo || '—'}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button title="수정" onClick={() => onEdit(s)} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><Pencil size={15} /></button>
                    <button title="비활성화 (삭제 아님)" onClick={() => onDeactivate(s.id)} className="p-1.5 rounded-lg hover:bg-[#FFF6D8] text-[#9CA3AF] hover:text-[#A17400] transition-colors"><EyeOff size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F4F6F8]/50">
        <p className="text-xs text-[#9CA3AF]">총 {sorted.length}건</p>
      </div>
    </div>
  );
}

'use client';

import { Transaction, TransactionType } from '@/types/transaction';
import { useState } from 'react';
import { Plus, Pencil, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransactionForm from './TransactionForm';

interface Props {
  transactions: Transaction[];
  onChange: (transactions: Transaction[]) => void;
}

export default function TransactionTable({ transactions, onChange }: Props) {
  const [typeFilter, setTypeFilter] = useState<TransactionType | '전체'>('전체');
  const [monthFilter, setMonthFilter] = useState<string>('전체');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  const months = ['전체', ...Array.from(new Set(transactions.map((t) => t.date.slice(0, 7)))).sort().reverse()];

  const filtered = transactions.filter((t) => {
    if (!t.isActive) return false; // 비활성 내역 기본 숨김
    const matchType  = typeFilter  === '전체' || t.type  === typeFilter;
    const matchMonth = monthFilter === '전체' || t.date.startsWith(monthFilter);
    return matchType && matchMonth;
  });

  const income  = filtered.filter((t) => t.type === '입금').reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === '출금').reduce((s, t) => s + t.amount, 0);
  const profit  = income - expense;

  function handleSave(t: Transaction) {
    if (editTarget) {
      onChange(transactions.map((x) => x.id === t.id
        ? { ...t, updatedAt: new Date().toISOString(), prevSnapshot: JSON.stringify(x) }
        : x));
    } else {
      onChange([...transactions, { ...t, isActive: true, createdAt: t.date, updatedAt: new Date().toISOString() }]);
    }
    setFormOpen(false); setEditTarget(null);
  }

  /** 삭제 없음 — isActive: false */
  function handleDeactivate(id: string) {
    if (confirm('이 내역을 비활성화하시겠습니까?\n데이터는 삭제되지 않습니다.')) {
      onChange(transactions.map((t) => t.id === id
        ? { ...t, isActive: false, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : t));
    }
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-[#202B3F] text-white' : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'}`;

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-[#2F8F5B]" />
            <span className="text-xs text-[#6B7280] font-medium">총 입금</span>
          </div>
          <p className="text-xl font-bold text-[#1F2937]">{income.toLocaleString()}원</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={15} className="text-[#E76F51]" />
            <span className="text-xs text-[#6B7280] font-medium">총 출금</span>
          </div>
          <p className="text-xl font-bold text-[#E76F51]">{expense.toLocaleString()}원</p>
        </div>
        <div className={`border rounded-xl p-4 ${profit >= 0 ? 'bg-[#202B3F] border-[#2D3748]' : 'bg-[#FDECEA] border-[#F5B8B0]'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${profit >= 0 ? 'text-[#8BC6D9]' : 'text-[#C24132]'}`}>순이익</span>
          </div>
          <p className={`text-xl font-bold ${profit >= 0 ? 'text-white' : 'text-[#C24132]'}`}>
            {profit >= 0 ? '+' : ''}{profit.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(['전체', '입금', '출금'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={chip(typeFilter === t)}>{t}</button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {months.map((m) => (
            <button key={m} onClick={() => setMonthFilter(m)} className={chip(monthFilter === m)}>{m}</button>
          ))}
        </div>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-[#2F80A7] hover:bg-[#256B8D] text-white ml-auto">
          <Plus size={16} className="mr-1" /> 내역 추가
        </Button>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F8] border-b border-[#E5E7EB]">
              <tr>
                {['거래일', '구분', '항목', '거래처', '금액', '결제수단', '증빙', '계산서', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F8]">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[#9CA3AF]">내역이 없습니다.</td></tr>
              ) : filtered.sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                <tr key={t.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.type === '입금' ? 'bg-[#E8F6EF] text-[#2F8F5B]' : 'bg-[#FDECEA] text-[#C24132]'}`}>{t.type}</span>
                  </td>
                  <td className="px-4 py-3 text-[#374151]">{t.category}</td>
                  <td className="px-4 py-3 font-medium text-[#1F2937]">{t.counterpart}</td>
                  <td className={`px-4 py-3 font-semibold whitespace-nowrap ${t.type === '입금' ? 'text-[#2F8F5B]' : 'text-[#E76F51]'}`}>
                    {t.type === '입금' ? '+' : '-'}{t.amount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{t.method}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${t.hasReceipt ? 'text-[#2F8F5B]' : 'text-[#D1D5DB]'}`}>{t.hasReceipt ? '✓' : '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${t.hasTaxInvoice ? 'text-[#2F8F5B]' : 'text-[#D1D5DB]'}`}>{t.hasTaxInvoice ? '✓' : '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditTarget(t); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><Pencil size={15} /></button>
                      <button title="비활성화 (삭제 아님)" onClick={() => handleDeactivate(t.id)} className="p-1.5 rounded-lg hover:bg-[#FFF6D8] text-[#9CA3AF] hover:text-[#A17400] transition-colors"><EyeOff size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F4F6F8]/50">
          <p className="text-xs text-[#9CA3AF]">총 {filtered.length}건</p>
        </div>
      </div>

      {formOpen && <TransactionForm transaction={editTarget} onSave={handleSave} onClose={() => { setFormOpen(false); setEditTarget(null); }} />}
    </div>
  );
}

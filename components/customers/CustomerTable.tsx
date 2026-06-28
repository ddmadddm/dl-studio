'use client';

import { Customer } from '@/types/customer';
import { useState } from 'react';
import { Search, Plus, Pencil, EyeOff, Eye, ArrowUp, ArrowDown, ChevronsUpDown, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CustomerForm from './CustomerForm';
import CustomerDetail from './CustomerDetail';
import { useSettings } from '@/context/SettingsContext';
import { useCustomer } from '@/context/CustomerContext';

const gradeBadge: Record<string, string> = {
  신규: 'bg-[#EAF4FA] text-[#1F6A8C]',
  체험: 'bg-[#E0F4F8] text-[#2F80A7]',
  일반: 'bg-[#E8F6EF] text-[#2F8F5B]',
  VIP:  'bg-[#202B3F] text-white',
  휴면: 'bg-[#F3F4F6] text-[#9CA3AF]',
};

const payBadge: Record<string, string> = {
  미결제:  'bg-[#FDECEA] text-[#C24132]',
  결제완료: 'bg-[#E8F6EF] text-[#2F8F5B]',
  부분결제: 'bg-[#FFF6D8] text-[#A17400]',
};

export default function CustomerTable() {
  const { customers, addCustomer, updateCustomer, deactivateCustomer, reactivateCustomer } = useCustomer();
  const { getLabels } = useSettings();

  const gradeLabels  = ['전체', ...getLabels('customerGrade')];
  const sourceLabels = ['전체', ...getLabels('inflowPath')];

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('전체');
  const [sourceFilter, setSourceFilter] = useState('전체');
  const [viewMode, setViewMode] = useState<'active' | 'inactive'>('active');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [detailTarget, setDetailTarget] = useState<Customer | null>(null);

  type SortKey = 'name' | 'firstVisit' | 'lastVisit' | 'totalPayment';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const inactiveCount = customers.filter((c) => !c.isActive).length;

  const filtered = customers.filter((c) => {
    if (viewMode === 'active' ? !c.isActive : c.isActive) return false;
    const matchSearch = c.name.includes(search) || c.phone.includes(search);
    const matchGrade  = gradeFilter  === '전체' || c.grade  === gradeFilter;
    const matchSource = sourceFilter === '전체' || c.source === sourceFilter;
    return matchSearch && matchGrade && matchSource;
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'name') {
          cmp = a.name.localeCompare(b.name, 'ko');
        } else if (sortKey === 'totalPayment') {
          cmp = a.totalPayment - b.totalPayment;
        } else {
          // firstVisit / lastVisit: 'YYYY-MM-DD' 문자열 비교
          cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '');
        }
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  function handleSave(customer: Customer) {
    if (editTarget) {
      updateCustomer(customer.id, customer);
    } else {
      addCustomer(customer);
    }
    setFormOpen(false);
    setEditTarget(null);
  }

  function handleDeactivate(id: string) {
    if (confirm('이 고객을 비활성화하시겠습니까?\n데이터는 보존됩니다.')) {
      deactivateCustomer(id);
    }
  }

  function handleReactivate(id: string) {
    if (confirm('이 고객을 다시 활성화하시겠습니까?')) {
      reactivateCustomer(id);
    }
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-[#202B3F] text-white' : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'}`;

  const tab = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[#202B3F] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'}`;

  return (
    <div className="space-y-4">
      {/* 보기 전환 (활성 / 비활성화) */}
      <div className="flex items-center gap-2">
        <button onClick={() => setViewMode('active')} className={tab(viewMode === 'active')}>
          활성 고객
        </button>
        <button onClick={() => setViewMode('inactive')} className={tab(viewMode === 'inactive')}>
          비활성화 고객{inactiveCount > 0 && <span className="ml-1.5 opacity-80">({inactiveCount})</span>}
        </button>
      </div>

      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <Input placeholder="고객명 또는 연락처 검색" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 border-[#E5E7EB] h-9 text-sm" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {gradeLabels.map((g) => <button key={g} onClick={() => setGradeFilter(g)} className={chip(gradeFilter === g)}>{g}</button>)}
        </div>
        <div className="flex gap-1 flex-wrap">
          {sourceLabels.map((s) => <button key={s} onClick={() => setSourceFilter(s)} className={chip(sourceFilter === s)}>{s}</button>)}
        </div>
        {viewMode === 'active' && (
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-[#2F80A7] hover:bg-[#256B8D] text-white ml-auto">
            <Plus size={15} className="mr-1" /> 고객 추가
          </Button>
        )}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F8] border-b border-[#E5E7EB]">
              <tr>
                {([
                  { label: '고객명',  key: 'name' as const },
                  { label: '성별' },
                  { label: '연락처' },
                  { label: '등급' },
                  { label: '유입경로' },
                  { label: '첫방문',  key: 'firstVisit' as const },
                  { label: '최근방문', key: 'lastVisit' as const },
                  { label: '결제상태' },
                  { label: '누적결제', key: 'totalPayment' as const },
                  { label: '담당코치' },
                  { label: '' },
                ]).map((h, i) => (
                  <th key={h.label || i} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] whitespace-nowrap">
                    {h.key ? (
                      <button
                        onClick={() => toggleSort(h.key)}
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
                <tr><td colSpan={11} className="text-center py-12 text-[#9CA3AF]">검색 결과가 없습니다.</td></tr>
              ) : sorted.map((c) => (
                <tr key={c.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1F2937]">{c.name}</td>
                  <td className="px-4 py-3">
                    {c.gender && c.gender !== '미입력' && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.gender === '남성' ? 'bg-[#EAF4FA] text-[#1F6A8C]' : 'bg-[#FCE8F0] text-[#9B3066]'}`}>
                        {c.gender === '남성' ? '♂' : '♀'} {c.gender}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${gradeBadge[c.grade] ?? 'bg-[#F3F4F6] text-[#6B7280]'}`}>{c.grade}</span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{c.source}</td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{c.firstVisit}</td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{c.lastVisit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payBadge[c.paymentStatus] ?? 'bg-[#F3F4F6] text-[#6B7280]'}`}>{c.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1F2937] whitespace-nowrap">{c.totalPayment.toLocaleString()}원</td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{c.coachName || c.coach || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetailTarget(c)} className="p-1.5 rounded-lg hover:bg-[#EAF4FA] text-[#2F80A7] transition-colors"><Eye size={15} /></button>
                      {viewMode === 'active' ? (
                        <>
                          <button onClick={() => { setEditTarget(c); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><Pencil size={15} /></button>
                          <button title="비활성화" onClick={() => handleDeactivate(c.id)} className="p-1.5 rounded-lg hover:bg-[#FFF6D8] text-[#9CA3AF] hover:text-[#A17400] transition-colors"><EyeOff size={15} /></button>
                        </>
                      ) : (
                        <button title="활성화 복원" onClick={() => handleReactivate(c.id)} className="p-1.5 rounded-lg hover:bg-[#E8F6EF] text-[#9CA3AF] hover:text-[#2F8F5B] transition-colors"><RotateCcw size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F4F6F8]/50">
          <p className="text-xs text-[#9CA3AF]">총 {filtered.length}명</p>
        </div>
      </div>

      {formOpen && <CustomerForm customer={editTarget} onSave={handleSave} onClose={() => { setFormOpen(false); setEditTarget(null); }} />}
      {detailTarget && <CustomerDetail customer={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  );
}

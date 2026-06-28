'use client';

import { useState } from 'react';
import { Pass, PassStatus, PassPaymentStatus } from '@/types/pass';
import { usePass } from '@/context/PassContext';
import { Plus, Pencil, EyeOff, History, PlusCircle, Search, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PassForm from './PassForm';
import PassUsageHistory from './PassUsageHistory';

const statusStyle: Record<PassStatus, string> = {
  사용중:   'bg-[#EAF4FA] text-[#1F6A8C] border-[#BDD9EA]',
  만료예정: 'bg-[#FFF6D8] text-[#A17400] border-[#F0D875]',
  사용완료: 'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]',
  중지:     'bg-[#FDECEA] text-[#C24132] border-[#F5B8B0]',
};

const payStyle: Record<PassPaymentStatus, string> = {
  결제완료: 'bg-[#E8F6EF] text-[#2F8F5B]',
  미결제:  'bg-[#FDECEA] text-[#C24132]',
  부분결제: 'bg-[#FFF6D8] text-[#A17400]',
};

interface Props { passes: Pass[] }

export default function PassTable({ passes: propPasses }: Props) {
  const { activePasses, addPass, updatePass, deactivatePass, addCount, getUsages } = usePass();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PassStatus | '전체'>('전체');
  const [payFilter, setPayFilter] = useState<PassPaymentStatus | '전체'>('전체');
  const [lowOnly, setLowOnly] = useState(false);
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Pass | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Pass | null>(null);

  type SortKey = 'customerName' | 'passName' | 'remainCount' | 'purchaseDate' | 'expiryDate' | 'paymentAmount' | 'paymentStatus' | 'status';
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

  // 활성 이용권만 필터링 (isActive: false 제외)
  const visiblePasses = propPasses.filter((p) => p.isActive);
  const unsorted = visiblePasses.filter((p) => {
    if (search && !p.customerName.includes(search) && !p.passName.includes(search)) return false;
    if (statusFilter !== '전체' && p.status !== statusFilter) return false;
    if (payFilter !== '전체' && p.paymentStatus !== payFilter) return false;
    if (lowOnly && p.remainCount > 3) return false;
    if (expiringOnly && p.status !== '만료예정') return false;
    return true;
  });

  const numericKeys: SortKey[] = ['remainCount', 'paymentAmount'];
  const filtered = sortKey
    ? [...unsorted].sort((a, b) => {
        const cmp = numericKeys.includes(sortKey)
          ? (a[sortKey] as number) - (b[sortKey] as number)
          : String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), 'ko');
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : unsorted;

  function handleSave(p: Pass) {
    if (editTarget) updatePass(p.id, p); else addPass(p);
    setFormOpen(false); setEditTarget(null);
  }
  function handleDeactivate(id: string) {
    if (confirm('이 이용권을 비활성화하시겠습니까?\n데이터는 삭제되지 않고 숨겨집니다.')) deactivatePass(id);
  }
  function handleAddCount(pass: Pass) {
    const input = prompt(`${pass.customerName}님 "${pass.passName}" 추가 횟수 입력`);
    const count = parseInt(input ?? '0', 10);
    if (count > 0) addCount(pass.id, count);
  }

  const statusBtns: (PassStatus | '전체')[] = ['전체', '사용중', '만료예정', '사용완료', '중지'];
  const payBtns: (PassPaymentStatus | '전체')[] = ['전체', '결제완료', '미결제', '부분결제'];
  const chip = (active: boolean) => `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-[#202B3F] text-white' : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'}`;

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <Input placeholder="고객명 또는 이용권명 검색" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 border-[#E5E7EB] h-9 text-sm" />
          </div>
          <button onClick={() => setLowOnly(!lowOnly)} className={chip(lowOnly)}>잔여 3회 이하</button>
          <button onClick={() => setExpiringOnly(!expiringOnly)} className={chip(expiringOnly)}>만료 예정</button>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-[#9CA3AF] w-12">상태</span>
          {statusBtns.map((s) => <button key={s} onClick={() => setStatusFilter(s)} className={chip(statusFilter === s)}>{s}</button>)}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-[#9CA3AF] w-12">결제</span>
          {payBtns.map((s) => <button key={s} onClick={() => setPayFilter(s)} className={chip(payFilter === s)}>{s}</button>)}
        </div>
      </div>

      {/* 툴바 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">총 <span className="font-semibold text-[#1F2937]">{filtered.length}</span>건</p>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-[#2F80A7] hover:bg-[#256B8D] text-white">
          <Plus size={15} className="mr-1" /> 이용권 추가
        </Button>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F8] border-b border-[#E5E7EB]">
              <tr>
                {([
                  { label: '고객명',      key: 'customerName' as const },
                  { label: '이용권명',     key: 'passName' as const },
                  { label: '총/사용/잔여', key: 'remainCount' as const },
                  { label: '구매일',      key: 'purchaseDate' as const },
                  { label: '만료일',      key: 'expiryDate' as const },
                  { label: '결제금액',     key: 'paymentAmount' as const },
                  { label: '결제상태',     key: 'paymentStatus' as const },
                  { label: '이용권상태',   key: 'status' as const },
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
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[#9CA3AF]">이용권 내역이 없습니다.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1F2937]">{p.customerName}</p>
                    <p className="text-xs text-[#9CA3AF]">{p.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[140px]">
                    <p className="font-medium text-[#1F2937] truncate">{p.passName}</p>
                    {p.memo && <p className="text-xs text-[#9CA3AF] truncate">{p.memo}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#9CA3AF]">{p.totalCount}회</span>
                      <span className="text-[#D1D5DB]">/</span>
                      <span className="text-xs text-[#9CA3AF]">{p.usedCount}회</span>
                      <span className="text-[#D1D5DB]">/</span>
                      <span className={`text-sm font-bold ${p.remainCount <= 3 ? 'text-[#E76F51]' : 'text-[#2F80A7]'}`}>{p.remainCount}회</span>
                    </div>
                    <div className="mt-1 w-24 bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-[#2F80A7] rounded-full" style={{ width: `${(p.usedCount / p.totalCount) * 100}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap text-xs">{p.purchaseDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-medium ${p.status === '만료예정' ? 'text-[#A17400]' : 'text-[#6B7280]'}`}>{p.expiryDate}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1F2937] whitespace-nowrap">{p.paymentAmount.toLocaleString()}원</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payStyle[p.paymentStatus]}`}>{p.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="횟수 추가" onClick={() => handleAddCount(p)} className="p-1.5 rounded-lg hover:bg-[#EAF4FA] text-[#2F80A7] transition-colors"><PlusCircle size={14} /></button>
                      <button title="사용 내역" onClick={() => setHistoryTarget(p)} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><History size={14} /></button>
                      <button title="수정" onClick={() => { setEditTarget(p); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><Pencil size={14} /></button>
                      <button title="비활성화 (삭제 아님)" onClick={() => handleDeactivate(p.id)} className="p-1.5 rounded-lg hover:bg-[#FFF6D8] text-[#9CA3AF] hover:text-[#A17400] transition-colors"><EyeOff size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && <PassForm pass={editTarget} onSave={handleSave} onClose={() => { setFormOpen(false); setEditTarget(null); }} />}
      {historyTarget && <PassUsageHistory passName={historyTarget.passName} usages={getUsages(historyTarget.id)} onClose={() => setHistoryTarget(null)} />}
    </div>
  );
}

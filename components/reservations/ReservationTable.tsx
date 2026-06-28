'use client';

import { Reservation, ReservationStatus } from '@/types/reservation';
import { useState } from 'react';
import { Plus, Pencil, EyeOff, Phone, X, CheckCircle, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReservationForm from './ReservationForm';
import ReservationFilters, { FilterState, defaultFilters } from './ReservationFilters';
import { usePass } from '@/context/PassContext';
import ReservationDetailModal from './ReservationDetailModal';

const statusStyle: Record<ReservationStatus, string> = {
  예약완료: 'bg-[#EAF4FA] text-[#1F6A8C] border-[#BDD9EA]',
  수업완료: 'bg-[#E8F6EF] text-[#2F8F5B] border-[#B6DECA]',
  취소:    'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]',
  노쇼:    'bg-[#FDECEA] text-[#C24132] border-[#F5B8B0]',
  변경요청: 'bg-[#FFF6D8] text-[#A17400] border-[#F0D875]',
};

const payStyle: Record<string, string> = {
  미결제:  'bg-[#FDECEA] text-[#C24132]',
  결제완료: 'bg-[#E8F6EF] text-[#2F8F5B]',
  부분결제: 'bg-[#FFF6D8] text-[#A17400]',
};

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { start: mon.toISOString().split('T')[0], end: sun.toISOString().split('T')[0] };
}

interface Props {
  reservations: Reservation[];
  onChange: (r: Reservation[]) => void;
}

export default function ReservationTable({ reservations, onChange }: Props) {
  const { deductPass } = usePass();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [detailTarget, setDetailTarget] = useState<Reservation | null>(null);
  const [deductMsg, setDeductMsg] = useState<{ msg: string; ok: boolean } | null>(null);

  type SortKey = 'date' | 'time' | 'customerName' | 'program' | 'instructor' | 'room' | 'status' | 'paymentStatus';
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

  function handleComplete(r: Reservation) {
    onChange(reservations.map((x) => x.id === r.id ? { ...x, status: '수업완료' } : x));
    const result = deductPass(r.customerId, {
      passId: '', customerId: r.customerId, customerName: r.customerName,
      usedDate: r.date, program: r.program, instructor: r.instructor,
      reservationId: r.id, deductCount: 1, memo: '',
    });
    setDeductMsg({ msg: result.message, ok: result.ok });
    setTimeout(() => setDeductMsg(null), 3000);
  }

  const today = new Date().toISOString().split('T')[0];
  const week = getWeekRange();

  const filtered = reservations.filter((r) => {
    if (!r.isActive) return false; // 비활성 예약 기본 숨김
    if (filters.noShowOnly && r.status !== '노쇼') return false;
    if (filters.todayOnly && r.date !== today) return false;
    if (filters.thisWeekOnly && (r.date < week.start || r.date > week.end)) return false;
    if (filters.date && r.date !== filters.date) return false;
    if (filters.customerName && !r.customerName.includes(filters.customerName)) return false;
    if (filters.instructor !== '전체' && r.instructor !== filters.instructor) return false;
    if (filters.room !== '전체' && r.room !== filters.room) return false;
    if (filters.status !== '전체' && r.status !== filters.status) return false;
    if (filters.paymentStatus !== '전체' && r.paymentStatus !== filters.paymentStatus) return false;
    if (filters.program !== '전체' && r.program !== filters.program) return false;
    return true;
  }).sort((a, b) => {
    if (!sortKey) {
      // 기본 정렬: 예약일 + 시간 오름차순
      return `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
    }
    let cmp = 0;
    if (sortKey === 'date') {
      cmp = `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
    } else {
      cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), 'ko');
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function handleSave(r: Reservation) {
    if (editTarget) {
      onChange(reservations.map((x) => x.id === r.id
        ? { ...r, updatedAt: new Date().toISOString(), prevSnapshot: JSON.stringify(x) }
        : x));
    } else {
      onChange([...reservations, { ...r, isActive: true, updatedAt: new Date().toISOString() }]);
    }
    setFormOpen(false); setEditTarget(null);
  }

  /** 삭제 없음 — isActive: false */
  function handleDeactivate(id: string) {
    if (confirm('이 예약을 비활성화하시겠습니까?\n데이터는 삭제되지 않습니다.')) {
      onChange(reservations.map((r) => r.id === id
        ? { ...r, isActive: false, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : r));
    }
  }

  return (
    <div className="space-y-4">
      <ReservationFilters filters={filters} onChange={setFilters} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">총 <span className="font-semibold text-[#1F2937]">{filtered.length}</span>건</p>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-[#2F80A7] hover:bg-[#256B8D] text-white">
          <Plus size={15} className="mr-1" /> 예약 추가
        </Button>
      </div>

      {/* 토스트 */}
      {deductMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${deductMsg.ok ? 'bg-[#202B3F] text-white' : 'bg-[#E76F51] text-white'}`}>
          <CheckCircle size={15} /> {deductMsg.msg}
        </div>
      )}

      {/* 데스크탑 테이블 */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F8] border-b border-[#E5E7EB]">
              <tr>
                {([
                  { label: '예약일',  key: 'date' as const },
                  { label: '시간',    key: 'time' as const },
                  { label: '고객명',  key: 'customerName' as const },
                  { label: '프로그램', key: 'program' as const },
                  { label: '담당강사', key: 'instructor' as const },
                  { label: '장소',    key: 'room' as const },
                  { label: '예약상태', key: 'status' as const },
                  { label: '결제상태', key: 'paymentStatus' as const },
                  { label: '메모' },
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
                <tr><td colSpan={10} className="text-center py-12 text-[#9CA3AF]">예약 내역이 없습니다.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className={`hover:bg-[#F4F6F8]/60 transition-colors cursor-pointer ${r.status === '노쇼' ? 'bg-[#FDECEA]/20' : ''}`} onClick={() => setDetailTarget(r)}>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-3 font-semibold text-[#1F2937] whitespace-nowrap">{r.time}</td>
                  <td className="px-4 py-3 font-medium text-[#1F2937]">{r.customerName}</td>
                  <td className="px-4 py-3 text-[#374151] whitespace-nowrap">{r.program}</td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{r.instructor}</td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{r.room}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payStyle[r.paymentStatus]}`}>{r.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-[#9CA3AF] text-xs max-w-32 truncate">{r.memo || r.cancelReason || '—'}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {r.status === '예약완료' && (
                        <button title="수업완료 처리" onClick={() => handleComplete(r)} className="p-1.5 rounded-lg hover:bg-[#E8F6EF] text-[#2F8F5B] transition-colors">
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button onClick={() => { setEditTarget(r); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><Pencil size={15} /></button>
                      <button title="비활성화 (삭제 아님)" onClick={() => handleDeactivate(r.id)} className="p-1.5 rounded-lg hover:bg-[#FFF6D8] text-[#9CA3AF] hover:text-[#A17400] transition-colors"><EyeOff size={15} /></button>
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

      {/* 모바일 카드 */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#9CA3AF] bg-white rounded-xl border border-[#E5E7EB]">예약 내역이 없습니다.</div>
        ) : filtered.map((r) => (
          <div key={r.id} className={`bg-white rounded-xl border p-4 space-y-3 ${r.status === '노쇼' ? 'border-[#F5B8B0] bg-[#FDECEA]/10' : 'border-[#E5E7EB]'}`} onClick={() => setDetailTarget(r)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-[#1F2937] text-base">{r.customerName}</p>
                <p className="text-sm text-[#6B7280]">{r.date} <span className="font-semibold text-[#1F2937]">{r.time}</span></p>
              </div>
              <div className="flex gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[r.status]}`}>{r.status}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payStyle[r.paymentStatus]}`}>{r.paymentStatus}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-[#9CA3AF]">프로그램</span><p className="font-medium text-[#374151] mt-0.5">{r.program}</p></div>
              <div><span className="text-[#9CA3AF]">강사</span><p className="font-medium text-[#374151] mt-0.5">{r.instructor}</p></div>
              <div><span className="text-[#9CA3AF]">장소</span><p className="font-medium text-[#374151] mt-0.5">{r.room}</p></div>
            </div>
            {(r.memo || r.cancelReason) && <p className="text-xs text-[#9CA3AF] bg-[#F4F6F8] rounded-lg px-3 py-2">{r.memo || r.cancelReason}</p>}
            <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              {r.status === '예약완료' && (
                <button onClick={() => handleComplete(r)} className="flex-1 py-1.5 rounded-lg border border-[#B6DECA] text-xs font-medium text-[#2F8F5B] hover:bg-[#E8F6EF] flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> 완료처리
                </button>
              )}
              <button onClick={() => { setEditTarget(r); setFormOpen(true); }} className="flex-1 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6] flex items-center justify-center gap-1"><Pencil size={12} />수정</button>
              <button onClick={() => handleDeactivate(r.id)} className="flex-1 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#9CA3AF] hover:bg-[#FFF6D8] flex items-center justify-center gap-1"><EyeOff size={12} />숨기기</button>
            </div>
          </div>
        ))}
      </div>

      {detailTarget && (
        <ReservationDetailModal reservation={detailTarget} onClose={() => setDetailTarget(null)} onEdit={(r) => { setDetailTarget(null); setEditTarget(r); setFormOpen(true); }} />
      )}
      {formOpen && <ReservationForm reservation={editTarget} existingReservations={reservations} onSave={handleSave} onClose={() => { setFormOpen(false); setEditTarget(null); }} />}
    </div>
  );
}

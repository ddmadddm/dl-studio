'use client';

import { useState, useMemo } from 'react';
import { Reservation, ReservationStatus, InstructorType, RoomType, ProgramType } from '@/types/reservation';
import { getWeekDays, moveWeek, formatDayLabel, getToday, getReservationsByDateTime, TIME_SLOTS } from '@/utils/date';
import ReservationCell from './ReservationCell';
import ReservationDetailModal from './ReservationDetailModal';
import ReservationForm from './ReservationForm';
import { ChevronLeft, ChevronRight, CalendarDays, SlidersHorizontal, X } from 'lucide-react';

interface CalendarFilter {
  instructor: InstructorType | '전체';
  room: RoomType | '전체';
  program: ProgramType | '전체';
  status: ReservationStatus | '전체';
}
const defaultFilter: CalendarFilter = { instructor: '전체', room: '전체', program: '전체', status: '전체' };
const instructors: (InstructorType | '전체')[] = ['전체', '김보형', '마틴프로', '기타강사'];
const rooms: (RoomType | '전체')[]             = ['전체', '1번룸', '2번룸', '골프존', '상담룸', '외부필드', '기타'];
const statuses: (ReservationStatus | '전체')[] = ['전체', '예약완료', '수업완료', '취소', '노쇼', '변경요청'];
const programs: (ProgramType | '전체')[]       = ['전체', '패시브스트레칭', '바디메커니즘', 'AI영상분석', '싱글프로젝트', 'VIP코칭', '통증개선', '비거리향상'];

interface Props {
  reservations: Reservation[];
  onChange?: (r: Reservation[]) => void;
  compact?: boolean;
  /** 외부에서 예약 클릭을 처리할 때 (패널 모드). 지정하면 내부 모달 대신 이 콜백 호출 */
  onReservationSelect?: (r: Reservation) => void;
}

export default function WeeklyReservationCalendar({ reservations, onChange, compact = false, onReservationSelect }: Props) {
  const today = getToday();
  const [baseDate, setBaseDate] = useState(today);
  const [filter, setFilter] = useState<CalendarFilter>(defaultFilter);
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Reservation | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Reservation | null>(null);
  const [prefillDate, setPrefillDate] = useState('');
  const [prefillTime, setPrefillTime] = useState('');

  const weekDays = useMemo(() => { const all = getWeekDays(baseDate); return compact ? all.slice(0, 5) : all; }, [baseDate, compact]);
  const filtered = useMemo(() => reservations.filter((r) => {
    if (filter.instructor !== '전체' && r.instructor !== filter.instructor) return false;
    if (filter.room !== '전체' && r.room !== filter.room) return false;
    if (filter.program !== '전체' && r.program !== filter.program) return false;
    if (filter.status !== '전체' && r.status !== filter.status) return false;
    return true;
  }), [reservations, filter]);

  const timeSlots = compact ? TIME_SLOTS.slice(0, 8) : TIME_SLOTS;
  const hasFilter = Object.values(filter).some((v) => v !== '전체');
  const activeCount = Object.values(filter).filter((v) => v !== '전체').length;
  const { mmdd: startLabel } = formatDayLabel(weekDays[0]);
  const { mmdd: endLabel }   = formatDayLabel(weekDays[weekDays.length - 1]);

  function handleCellClick(date: string, time: string) { setPrefillDate(date); setPrefillTime(time); setEditTarget(null); setFormOpen(true); }
  function handleEdit(r: Reservation) { setDetailTarget(null); setEditTarget(r); setFormOpen(true); }

  /** 예약 카드 클릭: 외부 패널 모드가 있으면 그쪽으로, 없으면 내부 모달 */
  function handleReservationClick(r: Reservation) {
    if (onReservationSelect) {
      onReservationSelect(r);
    } else {
      setDetailTarget(r);
    }
  }
  function handleSave(r: Reservation) {
    if (!onChange) return;
    if (editTarget) onChange(reservations.map((x) => (x.id === r.id ? r : x)));
    else onChange([...reservations, r]);
    setFormOpen(false); setEditTarget(null); setPrefillDate(''); setPrefillTime('');
  }

  const chipCls = (active: boolean) => `px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-[#2F80A7] text-white' : 'bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#2F80A7] hover:text-[#2F80A7]'}`;

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#EAF4FA] rounded-lg flex items-center justify-center">
            <CalendarDays size={14} className="text-[#2F80A7]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1F2937] text-sm">{compact ? '주간 예약 미리보기' : '주간 예약'}</h3>
            <p className="text-xs text-[#9CA3AF]">{startLabel} – {endLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setBaseDate(today)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#374151] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors">오늘</button>
          <div className="flex items-center bg-[#F3F4F6] rounded-lg overflow-hidden">
            <button onClick={() => setBaseDate(moveWeek(baseDate, -1))} className="p-1.5 hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"><ChevronLeft size={15} /></button>
            <div className="w-px h-4 bg-[#E5E7EB]" />
            <button onClick={() => setBaseDate(moveWeek(baseDate, 1))} className="p-1.5 hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"><ChevronRight size={15} /></button>
          </div>
          <button onClick={() => setFilterOpen(!filterOpen)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${hasFilter ? 'bg-[#2F80A7] text-white' : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'}`}>
            <SlidersHorizontal size={12} />
            필터{hasFilter && <span className="bg-white text-[#2F80A7] rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* 필터 패널 */}
      {filterOpen && (
        <div className="border-b border-[#E5E7EB] bg-[#F4F6F8] px-5 py-3 space-y-2">
          {[{ label: '강사', items: instructors, key: 'instructor' as const }, { label: '장소', items: rooms, key: 'room' as const }, { label: '상태', items: statuses, key: 'status' as const }, { label: '프로그램', items: programs, key: 'program' as const }]
            .map(({ label, items, key }) => (
            <div key={key} className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#9CA3AF] font-medium w-14 shrink-0">{label}</span>
              {items.map((v) => (<button key={v} onClick={() => setFilter({ ...filter, [key]: v })} className={chipCls(filter[key] === v)}>{v}</button>))}
              {filter[key] !== '전체' && <button onClick={() => setFilter({ ...filter, [key]: '전체' })} className="text-[#9CA3AF] hover:text-[#6B7280]"><X size={12} /></button>}
            </div>
          ))}
        </div>
      )}

      {/* 그리드 */}
      <div className="overflow-x-auto bg-[#F4F6F8]">
        <div style={{ minWidth: compact ? 640 : 800 }}>
          {/* 날짜 헤더 */}
          <div className="grid bg-white border-b border-[#E5E7EB]" style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
            <div className="px-2 py-2.5 border-r border-[#E5E7EB]" />
            {weekDays.map((d) => {
              const { mmdd, dow } = formatDayLabel(d);
              const isToday = d === today;
              const dow0 = new Date(d).getDay();
              return (
                <div key={d} className={`px-2 py-2.5 text-center border-l border-[#E5E7EB] ${isToday ? 'bg-[#202B3F]' : 'bg-white'}`}>
                  <p className={`text-xs font-bold ${isToday ? 'text-white' : dow0 === 0 ? 'text-[#E76F51]' : dow0 === 6 ? 'text-[#2F80A7]' : 'text-[#374151]'}`}>{mmdd}</p>
                  <p className={`text-xs mt-0.5 ${isToday ? 'text-[#8BC6D9]' : dow0 === 0 ? 'text-[#E76F51]/60' : dow0 === 6 ? 'text-[#2F80A7]/60' : 'text-[#9CA3AF]'}`}>{dow}</p>
                  {isToday && <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#4BA3C7] mx-auto" />}
                </div>
              );
            })}
          </div>

          {/* 시간 슬롯 */}
          {timeSlots.map((time, rowIdx) => (
            <div key={time} className={`grid border-b border-[#E5E7EB] last:border-0 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`} style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
              <div className="flex items-start justify-end pr-3 pt-2.5 border-r border-[#E5E7EB]">
                <span className="text-xs text-[#9CA3AF] font-medium">{time}</span>
              </div>
              {weekDays.map((date) => {
                const items = getReservationsByDateTime(filtered, date, time);
                const isToday = date === today;
                return (
                  <div key={date} onClick={() => items.length === 0 && handleCellClick(date, time)}
                    className={`border-l border-[#E5E7EB] p-1.5 min-h-[66px] transition-colors ${isToday ? 'bg-[#EAF4FA]/30' : ''} ${items.length === 0 ? 'cursor-pointer group hover:bg-[#EAF4FA]/50' : 'cursor-default'}`}>
                    {items.length === 0 ? (
                      <div className="w-full h-full min-h-[52px] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-[#2F80A7] font-medium">+ 예약</span>
                      </div>
                    ) : items.map((r) => (<ReservationCell key={r.id} reservation={r} onClick={handleReservationClick} compact={compact} />))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-[#F4F6F8] border-t border-[#E5E7EB]">
        {[['예약완료','#2F80A7'],['수업완료','#7AC29A'],['변경요청','#E9C46A'],['노쇼','#E76F51'],['취소','#9CA3AF']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-[#6B7280]">{label}</span>
          </div>
        ))}
      </div>

      {detailTarget && <ReservationDetailModal reservation={detailTarget} onClose={() => setDetailTarget(null)} onEdit={handleEdit} />}
      {formOpen && (
        <ReservationForm
          reservation={editTarget ?? (prefillDate ? { id: `r${Date.now()}`, date: prefillDate, time: prefillTime, customerId: '', customerName: '', customerPhone: '', program: '패시브스트레칭', instructor: '김보형', room: '1번룸', status: '예약완료', paymentStatus: '미결제', memo: '', cancelReason: '', createdAt: today } as Reservation : null)}
          existingReservations={reservations}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditTarget(null); setPrefillDate(''); setPrefillTime(''); }}
        />
      )}
    </div>
  );
}

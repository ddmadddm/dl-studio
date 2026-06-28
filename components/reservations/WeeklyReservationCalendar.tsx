'use client';

import { useState, useMemo } from 'react';
import { Reservation, ReservationStatus, InstructorType, RoomType, ProgramType } from '@/types/reservation';
import { getWeekDays, moveWeek, formatDayLabel, getToday, getUnslottedReservations, TIME_SLOTS } from '@/utils/date';
import { SLOT_PX, getReservationTiming, getReservationBlockHeight, timeToMinutes } from '@/utils/time';
import ReservationCell from './ReservationCell';
import ReservationDetailModal from './ReservationDetailModal';
import ReservationForm from './ReservationForm';
import { ChevronLeft, ChevronRight, CalendarDays, SlidersHorizontal, X, AlertTriangle } from 'lucide-react';

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

  // 30분 단위 슬롯. 미리보기(compact)는 09:00~16:30 구간만 노출
  const timeSlots = compact ? TIME_SLOTS.slice(0, 16) : TIME_SLOTS;
  // 30분 단위에 맞지 않는("시간 형식 확인 필요") 이번 주 예약
  const unslotted = useMemo(() => getUnslottedReservations(filtered, weekDays), [filtered, weekDays]);

  // 슬롯 → 행 인덱스
  const slotIndex = useMemo(() => {
    const m = new Map<string, number>();
    timeSlots.forEach((t, i) => m.set(t, i));
    return m;
  }, [timeSlots]);

  // 요일별 예약 블록 배치 (시간 길이 → 높이, 겹치면 가로 레인 분할)
  const dayLayouts = useMemo(() => {
    const out: Record<string, { blocks: { r: Reservation; top: number; height: number; lane: number }[]; laneCount: number }> = {};
    for (const date of weekDays) {
      const items = filtered
        .filter((r) => r.date === date)
        .map((r) => {
          const t = getReservationTiming(r);
          return { r, start: t.start, duration: t.duration, startMin: timeToMinutes(t.start), endMin: timeToMinutes(t.end) };
        })
        .filter((it) => slotIndex.has(it.start)) // 시작이 보이는 슬롯에 있는 예약만 (나머지는 배너 처리)
        .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

      const laneEnd: number[] = []; // 레인별 마지막 종료 분
      const blocks = items.map((it) => {
        let lane = laneEnd.findIndex((e) => e <= it.startMin); // 겹치지 않는 첫 레인 재사용
        if (lane === -1) { lane = laneEnd.length; laneEnd.push(it.endMin); }
        else laneEnd[lane] = it.endMin;
        return { r: it.r, top: slotIndex.get(it.start)! * SLOT_PX, height: getReservationBlockHeight(it.duration), lane };
      });
      out[date] = { blocks, laneCount: Math.max(1, laneEnd.length) };
    }
    return out;
  }, [filtered, weekDays, slotIndex]);

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

      {/* 시간 형식 확인 필요 (30분 단위 슬롯에 맞지 않는 예약) */}
      {unslotted.length > 0 && (
        <div className="border-b border-[#E5E7EB] bg-[#FFF6D8] px-5 py-3">
          <div className="flex items-center gap-1.5 text-[#92600A] text-xs font-semibold mb-2">
            <AlertTriangle size={13} />
            시간 형식 확인 필요 ({unslotted.length})
            <span className="font-normal text-[#A17400]">— 30분 단위(예: 10:00, 10:30)가 아니라 캘린더에 배치할 수 없습니다. 클릭해 시간을 수정하세요.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unslotted.map((r) => {
              const { mmdd } = formatDayLabel(r.date);
              return (
                <button key={r.id} onClick={() => handleReservationClick(r)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E9C46A] text-xs text-[#92600A] hover:bg-[#FFFBEE] transition-colors">
                  <span className="font-semibold">{r.customerName || '이름없음'}</span>
                  <span className="text-[#A17400]">{mmdd}</span>
                  <span className="font-mono bg-[#FFF6D8] px-1 rounded">{r.time || '시간없음'}</span>
                </button>
              );
            })}
          </div>
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

          {/* 본문: 시간축 + 요일 컬럼 (예약은 길이에 맞는 세로 컬러 블록) */}
          <div className="grid" style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
            {/* 시간 라벨 컬럼 */}
            <div className="border-r border-[#E5E7EB] bg-white">
              {timeSlots.map((time) => {
                const isHour = time.endsWith(':00');
                return (
                  <div key={time} className="flex items-start justify-end pr-3 pt-1" style={{ height: SLOT_PX }}>
                    <span className={`text-xs font-medium ${isHour ? 'text-[#6B7280]' : 'text-[#C7CDD4]'}`}>{time}</span>
                  </div>
                );
              })}
            </div>

            {/* 요일별 컬럼 */}
            {weekDays.map((date) => {
              const isToday = date === today;
              const layout = dayLayouts[date];
              const widthPct = 100 / layout.laneCount;
              return (
                <div key={date} className="relative border-l border-[#E5E7EB]" style={{ height: timeSlots.length * SLOT_PX }}>
                  {/* 배경 슬롯 (빈 칸 클릭 → 예약 추가) */}
                  {timeSlots.map((time, i) => (
                    <div key={time} onClick={() => handleCellClick(date, time)}
                      className={`absolute left-0 right-0 border-b border-[#E5E7EB] cursor-pointer group transition-colors hover:bg-[#EAF4FA]/60 ${isToday ? 'bg-[#EAF4FA]/30' : i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                      style={{ top: i * SLOT_PX, height: SLOT_PX }}>
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-[#2F80A7] font-medium opacity-0 group-hover:opacity-100 transition-opacity">+ 예약</span>
                    </div>
                  ))}
                  {/* 예약 블록 */}
                  {layout.blocks.map((b) => (
                    <div key={b.r.id} className="absolute px-0.5"
                      style={{ top: b.top + 1, height: b.height - 2, left: `${b.lane * widthPct}%`, width: `${widthPct}%` }}>
                      <ReservationCell reservation={b.r} onClick={handleReservationClick} compact={compact} fill />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-[#F4F6F8] border-t border-[#E5E7EB]">
        {[['예약완료','#2F80A7'],['수업완료','#7AC29A'],['변경요청','#E9C46A'],['노쇼','#E76F51'],['취소','#9CA3AF'],['필드·처방전','#7C5CFC']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-[#6B7280]">{label}</span>
          </div>
        ))}
      </div>

      {detailTarget && <ReservationDetailModal reservation={detailTarget} onClose={() => setDetailTarget(null)} onEdit={handleEdit} />}
      {formOpen && (
        <ReservationForm
          reservation={editTarget ?? (prefillDate ? { id: `r${Date.now()}`, date: prefillDate, time: prefillTime, startTime: prefillTime, customerId: '', customerName: '', customerPhone: '', program: '패시브스트레칭', instructor: '김보형', room: '1번룸', status: '예약완료', paymentStatus: '미결제', memo: '', cancelReason: '', createdAt: today } as Reservation : null)}
          existingReservations={reservations}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditTarget(null); setPrefillDate(''); setPrefillTime(''); }}
        />
      )}
    </div>
  );
}

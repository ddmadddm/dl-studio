'use client';

import { Reservation } from '@/types/reservation';
import { getReservationColorSet, getReservationTiming } from '@/utils/time';

interface Props {
  reservation: Reservation;
  onClick: (r: Reservation) => void;
  compact?: boolean;
  /** 캘린더 블록 모드: 부모 컨테이너 높이를 가득 채운다 */
  fill?: boolean;
}

export default function ReservationCell({ reservation: r, onClick, compact = false, fill = false }: Props) {
  const c = getReservationColorSet(r);
  const { start, end } = getReservationTiming(r);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(r); }}
      className={`${fill ? 'w-full h-full' : 'w-full mb-1 last:mb-0'} text-left rounded-lg border border-[#E5E7EB] border-l-4 px-2 py-1 overflow-hidden hover:shadow-md hover:border-[#2F80A7]/30 transition-all duration-150 ${c.bg} ${c.border}`}
    >
      {/* 1행: 고객명 + 상태 */}
      <div className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
        <span className={`text-[11px] font-semibold truncate ${c.name}`}>{r.customerName || '이름없음'}</span>
        <span className={`ml-auto shrink-0 text-[9px] font-medium px-1 rounded ${c.chip}`}>{r.status}</span>
      </div>
      {/* 2행: 프로그램 */}
      <p className={`text-[11px] truncate leading-tight ${c.text}`}>{r.program}</p>
      {/* 3행: 시작~종료 */}
      <p className={`text-[10px] truncate leading-tight font-medium ${c.sub}`}>{start}~{end}</p>
      {/* 4행: 담당강사 · 장소 (compact 에서는 생략) */}
      {!compact && <p className={`text-[10px] truncate leading-tight ${c.sub}`}>{r.instructor} · {r.room}</p>}
    </button>
  );
}

'use client';

import { Reservation, ReservationStatus } from '@/types/reservation';

const statusCard: Record<ReservationStatus, { bg: string; border: string; name: string; text: string; sub: string; dot: string }> = {
  예약완료: { bg: 'bg-[#EAF4FA]', border: 'border-l-[#2F80A7]', name: 'text-[#1F2937]', text: 'text-[#2F80A7]', sub: 'text-[#6B7280]', dot: 'bg-[#2F80A7]' },
  수업완료: { bg: 'bg-[#E8F6EF]', border: 'border-l-[#2F8F5B]', name: 'text-[#1F2937]', text: 'text-[#2F8F5B]', sub: 'text-[#6B7280]', dot: 'bg-[#7AC29A]' },
  취소:     { bg: 'bg-[#F3F4F6]', border: 'border-l-[#9CA3AF]', name: 'text-[#9CA3AF]', text: 'text-[#9CA3AF]', sub: 'text-[#D1D5DB]', dot: 'bg-[#9CA3AF]' },
  노쇼:     { bg: 'bg-[#FDECEA]', border: 'border-l-[#E76F51]', name: 'text-[#C24132]', text: 'text-[#E76F51]', sub: 'text-[#F5B8B0]', dot: 'bg-[#E76F51]' },
  변경요청: { bg: 'bg-[#FFF6D8]', border: 'border-l-[#E9C46A]', name: 'text-[#92600A]', text: 'text-[#A17400]', sub: 'text-[#B38600]', dot: 'bg-[#E9C46A]' },
};

interface Props { reservation: Reservation; onClick: (r: Reservation) => void; compact?: boolean }

export default function ReservationCell({ reservation: r, onClick, compact = false }: Props) {
  const s = statusCard[r.status];
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(r); }}
      className={`w-full text-left rounded-lg border-l-4 px-2 py-1.5 mb-1 last:mb-0 border border-[#E5E7EB] hover:shadow-md hover:border-[#2F80A7]/30 transition-all duration-150 ${s.bg} ${s.border}`}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
        <span className={`text-xs font-semibold truncate ${s.name}`}>{r.customerName}</span>
      </div>
      <p className={`text-xs truncate leading-tight ${s.text}`}>{r.program}</p>
      {!compact && <p className={`text-xs truncate leading-tight mt-0.5 ${s.sub}`}>{r.instructor} · {r.room}</p>}
    </button>
  );
}

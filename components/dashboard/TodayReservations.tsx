'use client';

import { Reservation, ReservationStatus } from '@/types/reservation';
import Link from 'next/link';

const statusStyle: Record<ReservationStatus, string> = {
  예약완료: 'bg-[#EAF4FA] text-[#1F6A8C]',
  수업완료: 'bg-[#E8F6EF] text-[#2F8F5B]',
  취소:    'bg-[#F3F4F6] text-[#9CA3AF]',
  노쇼:    'bg-[#FDECEA] text-[#C24132]',
  변경요청: 'bg-[#FFF6D8] text-[#A17400]',
};

const payStyle: Record<string, string> = {
  미결제:  'text-[#C24132]',
  결제완료: 'text-[#9CA3AF]',
  부분결제: 'text-[#A17400]',
};

interface Props {
  reservations: Reservation[];
  onReservationClick?: (r: Reservation) => void;
}

export default function TodayReservations({ reservations, onReservationClick }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const list = reservations.filter((r) => r.date === today).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#1F2937] text-sm">오늘의 예약 리스트</h3>
        <Link href="/reservations" className="text-xs text-[#2F80A7] hover:underline font-medium">전체보기</Link>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-[#9CA3AF] text-center py-8">오늘 예약이 없습니다.</p>
      ) : (
        <>
          <div className="space-y-1.5">
            {list.map((r) => (
              <div
                key={r.id}
                onClick={() => onReservationClick?.(r)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                  ${onReservationClick ? 'cursor-pointer hover:bg-[#EAF4FA]' : ''}
                  ${r.status === '노쇼' ? 'opacity-40' : 'bg-[#F4F6F8]'}`}
              >
                {/* 시간 */}
                <span className="text-sm font-bold text-[#1F2937] w-12 shrink-0">{r.time}</span>
                {/* 상태 컬러 점 */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  r.status === '예약완료' ? 'bg-[#2F80A7]' :
                  r.status === '수업완료' ? 'bg-[#7AC29A]' :
                  r.status === '노쇼'    ? 'bg-[#E76F51]' :
                  r.status === '취소'    ? 'bg-[#9CA3AF]' : 'bg-[#E9C46A]'
                }`} />
                {/* 이름 */}
                <span className="font-semibold text-[#1F2937] text-sm flex-1 truncate">{r.customerName}</span>
                {/* 장소 */}
                <span className="text-xs text-[#6B7280] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded-lg shrink-0">{r.room}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

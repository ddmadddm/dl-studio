import { Reservation } from '@/types/reservation';
import { CalendarCheck, CalendarX, UserX, Calendar } from 'lucide-react';

export default function ReservationSummary({ reservations }: { reservations: Reservation[] }) {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const weekStart = mon.toISOString().split('T')[0];
  const weekEnd   = sun.toISOString().split('T')[0];

  const todayList = reservations.filter((r) => r.date === today);
  const stats = [
    { label: '오늘 예약',    value: todayList.length,                                                    icon: Calendar,      bg: 'bg-[#202B3F]',      text: 'text-white',       sub: 'text-[#8BC6D9]' },
    { label: '수업완료',     value: todayList.filter((r) => r.status === '수업완료').length,              icon: CalendarCheck, bg: 'bg-[#E8F6EF] border border-[#B6DECA]', text: 'text-[#2F8F5B]', sub: 'text-[#2F8F5B]' },
    { label: '오늘 취소',    value: todayList.filter((r) => r.status === '취소').length,                  icon: CalendarX,     bg: 'bg-[#F3F4F6] border border-[#E5E7EB]', text: 'text-[#6B7280]', sub: 'text-[#9CA3AF]' },
    { label: '노쇼',         value: todayList.filter((r) => r.status === '노쇼').length,                  icon: UserX,         bg: 'bg-[#FDECEA] border border-[#F5B8B0]', text: 'text-[#C24132]', sub: 'text-[#C24132]' },
    { label: '이번 주 예약', value: reservations.filter((r) => r.date >= weekStart && r.date <= weekEnd).length, icon: Calendar, bg: 'bg-[#EAF4FA] border border-[#BDD9EA]', text: 'text-[#1F6A8C]', sub: 'text-[#2F80A7]' },
    { label: '미결제 예약',  value: reservations.filter((r) => r.paymentStatus === '미결제' && r.status !== '취소').length, icon: CalendarX, bg: 'bg-[#FFF6D8] border border-[#F0D875]', text: 'text-[#A17400]', sub: 'text-[#A17400]' },
  ];

  const instructorMap: Record<string, number> = {};
  todayList.forEach((r) => { instructorMap[r.instructor] = (instructorMap[r.instructor] ?? 0) + 1; });
  const roomMap: Record<string, number> = {};
  todayList.forEach((r) => { roomMap[r.room] = (roomMap[r.room] ?? 0) + 1; });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, bg, text, sub }) => (
          <div key={label} className={`rounded-xl p-4 ${bg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={12} className={`${text} opacity-70`} />
              <span className={`text-xs ${sub} opacity-80`}>{label}</span>
            </div>
            <p className={`text-2xl font-bold ${text}`}>{value}<span className={`text-sm font-normal ml-0.5 ${sub} opacity-70`}>건</span></p>
          </div>
        ))}
      </div>
      {todayList.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-xs font-semibold text-[#6B7280] mb-3">강사별 오늘 예약</p>
            <div className="space-y-2">
              {Object.entries(instructorMap).map(([name, cnt]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-[#374151]">{name}</span>
                  <span className="text-sm font-bold text-[#2F80A7]">{cnt}건</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-xs font-semibold text-[#6B7280] mb-3">장소별 예약 현황</p>
            <div className="space-y-2">
              {Object.entries(roomMap).map(([room, cnt]) => (
                <div key={room} className="flex items-center justify-between">
                  <span className="text-sm text-[#374151]">{room}</span>
                  <span className="text-sm font-bold text-[#2F80A7]">{cnt}건</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

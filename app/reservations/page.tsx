'use client';

import { useReservation } from '@/context/ReservationContext';
import ReservationTable from '@/components/reservations/ReservationTable';
import WeeklyReservationCalendar from '@/components/reservations/WeeklyReservationCalendar';

export default function ReservationsPage() {
  const { reservations, setReservations } = useReservation();

  return (
    <div className="space-y-6">
      <WeeklyReservationCalendar reservations={reservations} onChange={setReservations} />
      <div>
        <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">예약 목록</h2>
        <ReservationTable reservations={reservations} onChange={setReservations} />
      </div>
    </div>
  );
}

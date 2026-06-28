'use client';

import { useState, useEffect } from 'react';
import { mockReservations } from '@/data/mockReservations';
import { Reservation } from '@/types/reservation';
import ReservationTable from '@/components/reservations/ReservationTable';
import WeeklyReservationCalendar from '@/components/reservations/WeeklyReservationCalendar';

const STORAGE_KEY = 'dl_studio_reservations_v2';

function loadReservations(): Reservation[] {
  if (typeof window === 'undefined') return mockReservations;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockReservations;
    const parsed: Reservation[] = JSON.parse(raw);
    const storedIds = new Set(parsed.map((r) => r.id));
    return [...parsed, ...mockReservations.filter((m) => !storedIds.has(m.id))];
  } catch { return mockReservations; }
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReservations(loadReservations());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations)); } catch {}
    }
  }, [reservations, hydrated]);

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

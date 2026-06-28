'use client';

import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction, ReactNode } from 'react';
import { Reservation } from '@/types/reservation';
import { mockReservations } from '@/data/mockReservations';

// 예약관리 페이지가 쓰던 키를 그대로 사용해 기존 데이터를 보존한다.
const STORAGE_KEY = 'dl_studio_reservations_v2';

/** localStorage에서 불러오기. 없으면 mock 데이터 사용 */
function loadReservations(): Reservation[] {
  if (typeof window === 'undefined') return mockReservations;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockReservations;
    const parsed: Reservation[] = JSON.parse(raw);
    // localStorage에 없는 신규 mock만 병합
    const storedIds = new Set(parsed.map((r) => r.id));
    return [...parsed, ...mockReservations.filter((m) => !storedIds.has(m.id))];
  } catch {
    return mockReservations;
  }
}

function saveReservations(reservations: Reservation[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

interface ReservationContextType {
  reservations: Reservation[];
  activeReservations: Reservation[];
  setReservations: Dispatch<SetStateAction<Reservation[]>>;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [hydrated, setHydrated] = useState(false);

  // 클라이언트에서만 localStorage 로드
  useEffect(() => {
    setReservations(loadReservations());
    setHydrated(true);
  }, []);

  // 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (hydrated) saveReservations(reservations);
  }, [reservations, hydrated]);

  const activeReservations = reservations.filter((r) => r.isActive !== false);

  return (
    <ReservationContext.Provider value={{ reservations, activeReservations, setReservations }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservation must be used inside ReservationProvider');
  return ctx;
}

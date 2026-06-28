'use client';

import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction, ReactNode } from 'react';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { mockReservations } from '@/data/mockReservations';
import { usePass, PassActionResult } from '@/context/PassContext';
import { nowTs } from '@/lib/softDelete';

// 예약관리 페이지가 쓰던 키를 그대로 사용해 기존 데이터를 보존한다.
const STORAGE_KEY = 'dl_studio_reservations_v2';

function loadReservations(): Reservation[] {
  if (typeof window === 'undefined') return mockReservations;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockReservations;
    const parsed: Reservation[] = JSON.parse(raw);
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

export interface ReservationActionResult { ok: boolean; restored?: boolean; message: string }

interface ReservationContextType {
  reservations: Reservation[];
  activeReservations: Reservation[];
  setReservations: Dispatch<SetStateAction<Reservation[]>>;
  /** 신규 예약 추가 */
  addReservation: (r: Reservation) => void;
  /** 예약 수정 저장 — 상태 전환 시 이용권 차감/복구 자동 처리 */
  saveEditedReservation: (next: Reservation) => void;
  /** 수업완료 처리 + 연결 이용권 1회 차감 */
  completeReservation: (id: string) => PassActionResult;
  /** 예약 삭제(비활성화) + 차감되어 있으면 이용권 복구 */
  softDeleteReservation: (id: string, deletedReason: string) => ReservationActionResult;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [hydrated, setHydrated] = useState(false);
  const { deductForReservation, restoreForReservation } = usePass();

  useEffect(() => {
    setReservations(loadReservations());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveReservations(reservations);
  }, [reservations, hydrated]);

  const activeReservations = reservations.filter((r) => r.isActive !== false);

  function patch(id: string, changes: Partial<Reservation>) {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes, updatedAt: nowTs() } : r)));
  }

  function addReservation(r: Reservation) {
    setReservations((prev) => [...prev, { ...r, isActive: r.isActive !== false, updatedAt: nowTs() }]);
  }

  /** 수업완료 + 이용권 차감 (중복 차감 방지) */
  function completeReservation(id: string): PassActionResult {
    const r = reservations.find((x) => x.id === id);
    if (!r) return { ok: false, message: '예약을 찾을 수 없습니다.' };
    if (r.status === '수업완료' && r.passDeducted) return { ok: false, message: '이미 수업완료 처리된 예약입니다.' };

    const changes: Partial<Reservation> = { status: '수업완료' };
    let result: PassActionResult = { ok: true, message: '수업완료 처리되었습니다.' };

    if (r.passId && !r.passDeducted) {
      const res = deductForReservation(r);
      result = res;
      if (res.ok) {
        changes.passDeducted = true;
        changes.passDeductedAt = nowTs();
        changes.passUsageId = res.usageId;
      }
    }
    patch(id, changes);
    return result;
  }

  /** 예약 수정 저장 — 상태 전환에 따라 차감/복구 */
  function saveEditedReservation(next: Reservation) {
    const prev = reservations.find((x) => x.id === next.id);
    if (!prev) { addReservation(next); return; }

    let merged: Reservation = { ...next };

    // 수업완료로 전환 → 차감
    if (prev.status !== '수업완료' && next.status === '수업완료' && next.passId && !prev.passDeducted) {
      const res = deductForReservation(next);
      if (res.ok) {
        merged = { ...merged, passDeducted: true, passDeductedAt: nowTs(), passUsageId: res.usageId };
      }
    }

    // 수업완료 → 다른 상태(수업완료취소) → 복구 (확인 후)
    if (prev.status === '수업완료' && next.status !== '수업완료' && prev.passDeducted) {
      const ok = typeof window === 'undefined'
        ? true
        : window.confirm('수업완료를 취소합니다.\n차감된 이용권 1회를 복구하시겠습니까?');
      if (ok) {
        const rr = restoreForReservation(prev, '수업완료취소');
        if (rr.ok) merged = { ...merged, passDeducted: false, restoreUsageId: rr.usageId };
      }
    }

    setReservations((list) => list.map((x) => (x.id === next.id
      ? { ...merged, updatedAt: nowTs(), prevSnapshot: JSON.stringify(prev) }
      : x)));
  }

  /** 예약 삭제(soft delete) — 차감되어 있으면 이용권 복구 (중복 복구 방지) */
  function softDeleteReservation(id: string, deletedReason: string): ReservationActionResult {
    const r = reservations.find((x) => x.id === id);
    if (!r) return { ok: false, restored: false, message: '예약을 찾을 수 없습니다.' };

    const changes: Partial<Reservation> = {
      isActive: false,
      deletedAt: nowTs(),
      deletedReason: deletedReason || '',
      prevSnapshot: JSON.stringify(r),
    };
    let restored = false;
    let message = '예약이 삭제(비활성화)되었습니다.';

    if (r.passDeducted && !r.restoredPassOnDelete) {
      const rr = restoreForReservation(r, '예약삭제');
      if (rr.ok) {
        restored = true;
        changes.passDeducted = false;
        changes.restoredPassOnDelete = true;
        changes.restoreUsageId = rr.usageId;
        message = rr.message;
      }
    }
    patch(id, changes);
    return { ok: true, restored, message };
  }

  return (
    <ReservationContext.Provider value={{
      reservations, activeReservations, setReservations,
      addReservation, saveEditedReservation, completeReservation, softDeleteReservation,
    }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservation must be used inside ReservationProvider');
  return ctx;
}

export type { ReservationStatus };

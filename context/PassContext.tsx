'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pass, PassUsage, PassStatus, PassUsageReason } from '@/types/pass';
import { Reservation } from '@/types/reservation';
import { mockPasses, mockPassUsages } from '@/data/mockPasses';
import { softUpdate, activeOnly, genId, nowTs, today } from '@/lib/softDelete';
import {
  getActivePassesByCustomer, getUsablePassesByCustomer,
  hasDeductUsage, hasRestoreUsage,
} from '@/utils/passDeduction';

export interface PassActionResult { ok: boolean; message: string; usageId?: string }

const PASS_KEY   = 'dl_studio_passes_v2';
const USAGE_KEY  = 'dl_studio_pass_usages_v2';

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

interface PassContextType {
  passes: Pass[];
  usages: PassUsage[];
  activePasses: Pass[];
  addPass: (p: Pass) => void;
  updatePass: (id: string, changes: Partial<Pass>) => void;
  deactivatePass: (id: string) => void;
  deductPass: (customerId: string, usage: Omit<PassUsage, 'id' | 'createdAt' | 'isActive'>) => { ok: boolean; message: string };
  addCount: (passId: string, count: number) => void;
  getActivePass: (customerId: string) => Pass | null;
  getUsages: (passId: string) => PassUsage[];
  // ── 예약 연동 (누적 추가) ──
  /** 고객의 활성 이용권 전체 */
  getCustomerPasses: (customerId: string) => Pass[];
  /** 고객의 사용 가능한 이용권 (잔여 1회 이상) */
  getUsablePasses: (customerId: string) => Pass[];
  /** 예약에 연결된 이용권 1회 차감 (중복 차감 방지) */
  deductForReservation: (r: Reservation) => PassActionResult;
  /** 예약에 연결된 이용권 1회 복구 (중복 복구 방지) */
  restoreForReservation: (r: Reservation, reason: PassUsageReason) => PassActionResult;
  /** 특정 예약의 사용(차감/복구) 이력 */
  getUsagesByReservation: (reservationId: string) => PassUsage[];
}

const PassContext = createContext<PassContextType | null>(null);

function computeStatus(p: Pass): PassStatus {
  if (p.status === '중지') return '중지';
  if (p.remainCount <= 0) return '사용완료';
  const today = new Date();
  const expiry = new Date(p.expiryDate);
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  if (diff <= 0) return '사용완료';
  if (diff <= 14) return '만료예정';
  return '사용중';
}

export function PassProvider({ children }: { children: ReactNode }) {
  const [passes, setPasses]   = useState<Pass[]>(mockPasses);
  const [usages, setUsages]   = useState<PassUsage[]>(mockPassUsages);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPasses(load(PASS_KEY, mockPasses));
    setUsages(load(USAGE_KEY, mockPassUsages));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) save(PASS_KEY, passes); }, [passes, hydrated]);
  useEffect(() => { if (hydrated) save(USAGE_KEY, usages); }, [usages, hydrated]);

  const activePasses = activeOnly(passes);

  function addPass(p: Pass) {
    setPasses((prev) => [...prev, { ...p, status: computeStatus(p), isActive: true }]);
  }

  function updatePass(id: string, changes: Partial<Pass>) {
    setPasses((prev) => softUpdate(prev, id, changes).map((p) => p.id === id ? { ...p, status: computeStatus(p) } : p));
  }

  function deactivatePass(id: string) {
    setPasses((prev) => prev.map((p) => p.id === id ? { ...p, isActive: false, deletedAt: nowTs(), updatedAt: nowTs() } : p));
  }

  function getActivePass(customerId: string): Pass | null {
    return activePasses
      .filter((p) => p.customerId === customerId && (p.status === '사용중' || p.status === '만료예정') && p.remainCount > 0)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0] ?? null;
  }

  function deductPass(customerId: string, usage: Omit<PassUsage, 'id' | 'createdAt' | 'isActive'>): { ok: boolean; message: string } {
    const pass = getActivePass(customerId);
    if (!pass) return { ok: false, message: '사용 가능한 이용권이 없습니다.' };
    if (pass.remainCount <= 0) return { ok: false, message: '이용권 잔여 횟수가 0입니다.' };
    const newRemain = pass.remainCount - usage.deductCount;
    const newUsed   = pass.usedCount   + usage.deductCount;
    setPasses((prev) => softUpdate(prev, pass.id, {}).map((p) => {
      if (p.id !== pass.id) return p;
      const updated = { ...p, usedCount: newUsed, remainCount: newRemain };
      return { ...updated, status: computeStatus(updated) };
    }));
    setUsages((prev) => [...prev, { ...usage, id: genId('u'), passId: pass.id, createdAt: nowTs(), isActive: true }]);
    return { ok: true, message: `이용권 1회 차감 완료 (잔여 ${newRemain}회)` };
  }

  function addCount(passId: string, count: number) {
    setPasses((prev) => prev.map((p) => {
      if (p.id !== passId) return p;
      const updated = { ...p, totalCount: p.totalCount + count, remainCount: p.remainCount + count, updatedAt: nowTs() };
      return { ...updated, status: computeStatus(updated) };
    }));
  }

  function getUsages(passId: string): PassUsage[] {
    return usages.filter((u) => u.passId === passId && u.isActive).sort((a, b) => (b.createdAt || b.usedDate).localeCompare(a.createdAt || a.usedDate));
  }

  // ── 예약 연동 ──
  function getCustomerPasses(customerId: string): Pass[] {
    return getActivePassesByCustomer(passes, customerId);
  }
  function getUsablePasses(customerId: string): Pass[] {
    return getUsablePassesByCustomer(passes, customerId);
  }
  function getUsagesByReservation(reservationId: string): PassUsage[] {
    return usages
      .filter((u) => u.reservationId === reservationId && u.isActive)
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  }

  /** 예약에 연결된 이용권 1회 차감 — 중복 차감 방지 */
  function deductForReservation(r: Reservation): PassActionResult {
    if (!r.passId) return { ok: false, message: '연결된 이용권이 없습니다.' };
    const pass = passes.find((p) => p.id === r.passId);
    if (!pass) return { ok: false, message: '연결된 이용권을 찾을 수 없습니다.' };
    if (hasDeductUsage(usages, r.id)) return { ok: false, message: '이미 차감된 예약입니다.' };
    if (pass.remainCount <= 0) return { ok: false, message: '이용권 잔여 횟수가 0입니다.' };
    const usageId = genId('u');
    setPasses((prev) => prev.map((p) => {
      if (p.id !== pass.id) return p;
      const updated = { ...p, usedCount: p.usedCount + 1, remainCount: p.remainCount - 1, updatedAt: nowTs() };
      return { ...updated, status: computeStatus(updated) };
    }));
    setUsages((prev) => [...prev, {
      id: usageId, passId: pass.id, customerId: r.customerId, customerName: r.customerName,
      usedDate: r.date || today(), program: r.program, instructor: r.instructor, reservationId: r.id,
      deductCount: 1, memo: '수업완료 차감', createdAt: nowTs(), isActive: true,
      actionType: '차감', reason: '수업완료',
    }]);
    return { ok: true, usageId, message: `이용권 1회 차감 (잔여 ${pass.remainCount - 1}회)` };
  }

  /** 예약에 연결된 이용권 1회 복구 — 중복 복구 방지 */
  function restoreForReservation(r: Reservation, reason: PassUsageReason): PassActionResult {
    if (!r.passId) return { ok: false, message: '연결된 이용권이 없습니다.' };
    const pass = passes.find((p) => p.id === r.passId);
    if (!pass) return { ok: false, message: '연결된 이용권을 찾을 수 없습니다.' };
    if (hasRestoreUsage(usages, r.id)) return { ok: false, message: '이미 복구되어 중복 복구를 방지했습니다.' };
    const usageId = genId('u');
    setPasses((prev) => prev.map((p) => {
      if (p.id !== pass.id) return p;
      const updated = { ...p, usedCount: Math.max(0, p.usedCount - 1), remainCount: p.remainCount + 1, updatedAt: nowTs() };
      return { ...updated, status: computeStatus(updated) };
    }));
    setUsages((prev) => [...prev, {
      id: usageId, passId: pass.id, customerId: r.customerId, customerName: r.customerName,
      usedDate: today(), program: r.program, instructor: r.instructor, reservationId: r.id,
      deductCount: 1, createdAt: nowTs(), isActive: true, actionType: '복구', reason,
      memo: reason === '예약삭제' ? '예약 삭제로 인한 이용권 자동 복구' : '수업완료 취소로 인한 이용권 복구',
    }]);
    return { ok: true, usageId, message: `이용권 1회 복구 (잔여 ${pass.remainCount + 1}회)` };
  }

  return (
    <PassContext.Provider value={{ passes, usages, activePasses, addPass, updatePass, deactivatePass, deductPass, addCount, getActivePass, getUsages, getCustomerPasses, getUsablePasses, deductForReservation, restoreForReservation, getUsagesByReservation }}>
      {children}
    </PassContext.Provider>
  );
}

export function usePass() {
  const ctx = useContext(PassContext);
  if (!ctx) throw new Error('usePass must be used inside PassProvider');
  return ctx;
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pass, PassUsage, PassStatus } from '@/types/pass';
import { mockPasses, mockPassUsages } from '@/data/mockPasses';
import { softUpdate, activeOnly, genId, nowTs } from '@/lib/softDelete';

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
    return usages.filter((u) => u.passId === passId && u.isActive).sort((a, b) => b.usedDate.localeCompare(a.usedDate));
  }

  return (
    <PassContext.Provider value={{ passes, usages, activePasses, addPass, updatePass, deactivatePass, deductPass, addCount, getActivePass, getUsages }}>
      {children}
    </PassContext.Provider>
  );
}

export function usePass() {
  const ctx = useContext(PassContext);
  if (!ctx) throw new Error('usePass must be used inside PassProvider');
  return ctx;
}

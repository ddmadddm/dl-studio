'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Prescription } from '@/types/prescription';
import { mockPrescriptions } from '@/data/mockPrescriptions';
import { softUpdate, activeOnly, genId, nowTs, today } from '@/lib/softDelete';
import { analyzePrescription } from '@/utils/prescriptionAnalysis';

const STORAGE_KEY = 'dl_studio_prescriptions_v2';

/** localStorage 우선 + 신규 mock만 병합 (누적 보존) */
function loadPrescriptions(): Prescription[] {
  if (typeof window === 'undefined') return mockPrescriptions;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockPrescriptions;
    const parsed: Prescription[] = JSON.parse(raw);
    const storedIds = new Set(parsed.map((p) => p.id));
    const newMocks = mockPrescriptions.filter((m) => !storedIds.has(m.id));
    return [...parsed, ...newMocks];
  } catch {
    return mockPrescriptions;
  }
}

function savePrescriptions(list: Prescription[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { console.warn('처방 저장 실패:', e); }
}

interface PrescriptionContextType {
  prescriptions: Prescription[];
  activePrescriptions: Prescription[];
  addPrescription: (p: Prescription) => void;
  updatePrescription: (id: string, changes: Partial<Prescription>) => void;
  deactivatePrescription: (id: string) => void;
  /** mock AI 분석 실행 → 점수·피드백 채우고 상태 갱신 */
  runAnalysis: (id: string) => void;
  getCustomerPrescriptions: (customerId: string, customerName?: string) => Prescription[];
}

const PrescriptionContext = createContext<PrescriptionContextType | null>(null);

export function PrescriptionProvider({ children }: { children: ReactNode }) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrescriptions(loadPrescriptions());
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) savePrescriptions(prescriptions); }, [prescriptions, hydrated]);

  const activePrescriptions = activeOnly(prescriptions);

  function addPrescription(p: Prescription) {
    setPrescriptions((prev) => [
      ...prev,
      {
        ...p,
        id: p.id || genId('rx'),
        isSOS: p.prescriptionType === '필드SOS',
        isActive: true,
        createdAt: p.createdAt || today(),
        updatedAt: nowTs(),
      },
    ]);
  }

  function updatePrescription(id: string, changes: Partial<Prescription>) {
    setPrescriptions((prev) =>
      softUpdate(prev, id, {
        ...changes,
        // 유형 변경 시 SOS 플래그 동기화
        ...(changes.prescriptionType ? { isSOS: changes.prescriptionType === '필드SOS' } : {}),
      })
    );
  }

  function deactivatePrescription(id: string) {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isActive: false, deletedAt: nowTs(), updatedAt: nowTs(), prevSnapshot: JSON.stringify(p) }
          : p
      )
    );
  }

  function runAnalysis(id: string) {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const result = analyzePrescription(p);
        return {
          ...p,
          ...result,
          // 분석 완료 후, 코치 피드백이 아직 없으면 '코치확인대기', 있으면 유지
          status: p.coachComment ? p.status : '코치확인대기',
          updatedAt: nowTs(),
          prevSnapshot: JSON.stringify(p),
        };
      })
    );
  }

  /** 고객별 처방 (customerId 우선, 없으면 이름) — 날짜 내림차순, 활성만 */
  function getCustomerPrescriptions(customerId: string, customerName?: string): Prescription[] {
    return activePrescriptions
      .filter((p) => (p.customerId && p.customerId === customerId) || (!!customerName && p.customerName === customerName))
      .sort((a, b) => b.prescriptionDate.localeCompare(a.prescriptionDate));
  }

  return (
    <PrescriptionContext.Provider value={{
      prescriptions, activePrescriptions,
      addPrescription, updatePrescription, deactivatePrescription, runAnalysis, getCustomerPrescriptions,
    }}>
      {children}
    </PrescriptionContext.Provider>
  );
}

export function usePrescription() {
  const ctx = useContext(PrescriptionContext);
  if (!ctx) throw new Error('usePrescription must be used inside PrescriptionProvider');
  return ctx;
}

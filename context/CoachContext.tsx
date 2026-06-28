'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Coach } from '@/types/coach';
import { mockCoaches } from '@/data/mockCoaches';
import { softUpdate, genId, nowTs } from '@/lib/softDelete';

const STORAGE_KEY = 'dl_studio_coaches';

function load(fallback: Coach[]): Coach[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: Coach[] = JSON.parse(raw);
    const storedIds = new Set(parsed.map((c) => c.id));
    return [...parsed, ...fallback.filter((m) => !storedIds.has(m.id))];
  } catch { return fallback; }
}

interface CoachContextType {
  coaches: Coach[];
  activeCoaches: Coach[];
  addCoach: (c: Coach) => void;
  updateCoach: (id: string, changes: Partial<Coach>) => void;
  deactivateCoach: (id: string) => void;
}

const CoachContext = createContext<CoachContextType | null>(null);

export function CoachProvider({ children }: { children: ReactNode }) {
  const [coaches, setCoaches] = useState<Coach[]>(mockCoaches);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setCoaches(load(mockCoaches)); setHydrated(true); }, []);
  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(coaches)); } catch {}
    }
  }, [coaches, hydrated]);

  const activeCoaches = coaches.filter((c) => c.isActive && c.status === '활동중');

  function addCoach(c: Coach) {
    setCoaches((prev) => [...prev, { ...c, id: c.id || genId('coach'), isActive: true, createdAt: nowTs(), updatedAt: nowTs() }]);
  }
  function updateCoach(id: string, changes: Partial<Coach>) {
    setCoaches((prev) => softUpdate(prev, id, changes));
  }
  function deactivateCoach(id: string) {
    setCoaches((prev) => prev.map((c) => c.id === id ? { ...c, isActive: false, deletedAt: nowTs(), updatedAt: nowTs(), prevSnapshot: JSON.stringify(c) } : c));
  }

  return (
    <CoachContext.Provider value={{ coaches, activeCoaches, addCoach, updateCoach, deactivateCoach }}>
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  const ctx = useContext(CoachContext);
  if (!ctx) throw new Error('useCoach must be used inside CoachProvider');
  return ctx;
}

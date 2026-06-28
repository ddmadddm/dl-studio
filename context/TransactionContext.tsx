'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction } from '@/types/transaction';
import { mockTransactions } from '@/data/mockTransactions';
import { softUpdate, activeOnly, nowTs } from '@/lib/softDelete';

const STORAGE_KEY = 'dl_studio_transactions_v2';

/** localStorage 우선 + 신규 mock만 병합 (누적 보존) */
function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return mockTransactions;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockTransactions;
    const parsed: Transaction[] = JSON.parse(raw);
    const storedIds = new Set(parsed.map((t) => t.id));
    return [...parsed, ...mockTransactions.filter((m) => !storedIds.has(m.id))];
  } catch { return mockTransactions; }
}

function saveTransactions(transactions: Transaction[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); } catch (e) { console.warn('입출금 저장 실패:', e); }
}

interface TransactionContextType {
  transactions: Transaction[];
  activeTransactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;
  /** 전체 Transaction(id 포함)을 누적 추가 */
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, changes: Partial<Transaction>) => void;
  deactivateTransaction: (id: string) => void;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactionsState] = useState<Transaction[]>(mockTransactions);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTransactionsState(loadTransactions());
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) saveTransactions(transactions); }, [transactions, hydrated]);

  const activeTransactions = activeOnly(transactions);

  function addTransaction(t: Transaction) {
    setTransactionsState((prev) => [...prev, { ...t, isActive: true }]);
  }

  function updateTransaction(id: string, changes: Partial<Transaction>) {
    setTransactionsState((prev) => softUpdate(prev, id, changes));
  }

  function deactivateTransaction(id: string) {
    setTransactionsState((prev) =>
      prev.map((t) => t.id === id ? { ...t, isActive: false, deletedAt: nowTs(), updatedAt: nowTs() } : t)
    );
  }

  return (
    <TransactionContext.Provider value={{ transactions, activeTransactions, setTransactions: setTransactionsState, addTransaction, updateTransaction, deactivateTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransaction must be used inside TransactionProvider');
  return ctx;
}

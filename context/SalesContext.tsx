'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sale, SaleType, SalePaymentStatus } from '@/types/sale';
import { Transaction, TransactionCategory } from '@/types/transaction';
import { Pass, PassPaymentStatus } from '@/types/pass';
import { mockSales } from '@/data/mockSales';
import { useTransaction } from '@/context/TransactionContext';
import { usePass } from '@/context/PassContext';
import { useCustomer } from '@/context/CustomerContext';
import { activeOnly, genId, nowTs, today } from '@/lib/softDelete';

/** 매출유형 → 입출금 항목(카테고리) 매핑 */
const categoryMap: Record<SaleType, TransactionCategory> = {
  체험비: '체험비',
  이용권: '수업료',
  VIP프로그램: 'VIP프로그램',
  패시브스트레칭: '수업료',
  바디메커니즘: '수업료',
  AI영상분석: '수업료',
  기타: '기타',
};

/** 입금 자동등록 대상: 실제 수금이 발생한 '결제완료' 매출만 */
function isPaid(s: Sale): boolean {
  return s.paymentStatus === '결제완료';
}

/** 이용권 자동 생성 대상: 매출유형이 '이용권'이고 환불이 아닌 매출 */
function isPassSale(s: Sale): boolean {
  return s.saleType === '이용권' && s.paymentStatus !== '환불';
}

/** 매출명에서 "N회" 패턴으로 총 횟수 추정 */
function parseCount(title: string): number {
  const m = title.match(/(\d+)\s*회/);
  return m ? Number(m[1]) : 1;
}

/** 날짜 문자열에 개월 수 더하기 */
function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

/** 매출 결제상태 → 이용권 결제상태 매핑 */
function mapPassPayStatus(s: SalePaymentStatus): PassPaymentStatus {
  if (s === '결제완료') return '결제완료';
  if (s === '부분결제') return '부분결제';
  return '미결제'; // 미수금 등
}

/** 매출 → 이용권 객체 생성 (status는 addPass에서 재계산됨) */
function buildPassFromSale(s: Sale, customerPhone: string): Pass {
  const total = s.passTotalCount && s.passTotalCount > 0 ? s.passTotalCount : parseCount(s.saleTitle);
  const months = s.passValidMonths && s.passValidMonths > 0 ? s.passValidMonths : 3;
  return {
    id: genId('p'),
    customerId: s.customerId,
    customerName: s.customerName,
    customerPhone,
    passName: s.saleTitle,
    totalCount: total,
    usedCount: 0,
    remainCount: total,
    purchaseDate: s.saleDate,
    expiryDate: addMonths(s.saleDate, months),
    paymentAmount: s.amount,
    paymentStatus: mapPassPayStatus(s.paymentStatus),
    status: '사용중',
    memo: `매출 자동생성 · ${s.saleTitle}`,
    createdAt: today(),
    updatedAt: nowTs(),
    isActive: true,
  };
}

/** 매출 → 입금 거래 객체 생성 */
function buildIncomeTransaction(s: Sale): Transaction {
  return {
    id: genId('t'),
    date: s.saleDate,
    type: '입금',
    category: categoryMap[s.saleType] ?? '기타',
    counterpart: s.customerName,
    amount: s.amount,
    method: s.paymentMethod,
    hasReceipt: false,
    hasTaxInvoice: s.invoiceStatus === '발행완료',
    memo: `매출 자동등록 · ${s.saleTitle}`,
    isActive: true,
    createdAt: today(),
    updatedAt: nowTs(),
  };
}

const STORAGE_KEY = 'dl_studio_sales_v2';

/** localStorage에서 불러오되, 누적 보존: 저장본 우선 + 신규 mock만 병합 */
function loadSales(): Sale[] {
  if (typeof window === 'undefined') return mockSales;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockSales;
    const parsed: Sale[] = JSON.parse(raw);
    const storedIds = new Set(parsed.map((s) => s.id));
    const newMocks = mockSales.filter((m) => !storedIds.has(m.id));
    return [...parsed, ...newMocks];
  } catch {
    return mockSales;
  }
}

function saveSales(sales: Sale[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sales)); } catch (e) { console.warn('매출 저장 실패:', e); }
}

interface SalesContextType {
  sales: Sale[];
  activeSales: Sale[];
  addSale: (s: Sale) => void;
  updateSale: (id: string, changes: Partial<Sale>) => void;
  deactivateSale: (id: string) => void;
  getCustomerSales: (customerId: string, customerName?: string) => Sale[];
  // ── 수동 연결 (자동 동기화 없이 참조만 변경) ──
  linkSaleTransaction: (saleId: string, transactionId: string) => void;
  unlinkSaleTransaction: (saleId: string) => void;
  createIncomeForSale: (saleId: string) => void;
  linkSalePass: (saleId: string, passId: string) => void;
  unlinkSalePass: (saleId: string) => void;
  createPassForSale: (saleId: string) => void;
}

const SalesContext = createContext<SalesContextType | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [hydrated, setHydrated] = useState(false);
  const { addTransaction, updateTransaction, deactivateTransaction } = useTransaction();
  const { addPass, updatePass, deactivatePass } = usePass();
  const { customers } = useCustomer();

  const phoneOf = (customerId: string) => customers.find((c) => c.id === customerId)?.phone ?? '';

  useEffect(() => {
    setSales(loadSales());
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) saveSales(sales); }, [sales, hydrated]);

  const activeSales = activeOnly(sales);

  /** 매출 등록 — 결제완료면 입금 자동 추가, 이용권 매출이면 이용권 자동 생성 */
  function addSale(s: Sale) {
    const id = s.id || genId('sale');
    let transactionId = s.transactionId;
    let passId = s.passId;

    if (isPaid(s)) {
      const txn = buildIncomeTransaction({ ...s, id });
      addTransaction(txn);
      transactionId = txn.id;
    }
    if (isPassSale(s) && !s.passId) {
      const pass = buildPassFromSale({ ...s, id }, phoneOf(s.customerId));
      addPass(pass);
      passId = pass.id;
    }

    setSales((prev) => [
      ...prev,
      {
        ...s,
        id,
        transactionId,
        passId,
        isActive: true,
        createdAt: s.createdAt || today(),
        updatedAt: nowTs(),
      },
    ]);
  }

  /** 매출 수정 — 결제상태/금액 변경에 맞춰 연결된 입금 거래를 동기화 */
  function updateSale(id: string, changes: Partial<Sale>) {
    const old = sales.find((s) => s.id === id);
    if (!old) return;
    const next: Sale = { ...old, ...changes };
    const nowPaid = isPaid(next);
    let transactionId = old.transactionId;

    if (nowPaid && !old.transactionId) {
      // 미수금/부분결제 → 결제완료: 입금 신규 생성
      const txn = buildIncomeTransaction(next);
      addTransaction(txn);
      transactionId = txn.id;
    } else if (old.transactionId && nowPaid) {
      // 결제완료 유지: 연결된 입금 내용 갱신
      updateTransaction(old.transactionId, {
        date: next.saleDate,
        counterpart: next.customerName,
        amount: next.amount,
        method: next.paymentMethod,
        category: categoryMap[next.saleType] ?? '기타',
        hasTaxInvoice: next.invoiceStatus === '발행완료',
      });
    } else if (old.transactionId && !nowPaid) {
      // 결제완료 → 미수금/환불 등: 연결된 입금 비활성화
      deactivateTransaction(old.transactionId);
      transactionId = undefined;
    }

    // ── 이용권 동기화 ──
    const nowPass = isPassSale(next);
    let passId = old.passId;
    if (nowPass && !old.passId) {
      // 이용권 매출로 전환: 이용권 신규 생성
      const pass = buildPassFromSale(next, phoneOf(next.customerId));
      addPass(pass);
      passId = pass.id;
    } else if (old.passId && nowPass) {
      // 이용권 유지: 결제/금액/이름 등 갱신 (사용횟수는 보존)
      updatePass(old.passId, {
        passName: next.saleTitle,
        paymentAmount: next.amount,
        paymentStatus: mapPassPayStatus(next.paymentStatus),
        purchaseDate: next.saleDate,
      });
    } else if (old.passId && !nowPass) {
      // 이용권 매출 해제(환불/유형변경): 연결된 이용권 비활성화
      deactivatePass(old.passId);
      passId = undefined;
    }

    setSales((prev) =>
      prev.map((s) =>
        s.id === id ? { ...next, transactionId, passId, updatedAt: nowTs(), prevSnapshot: JSON.stringify(old) } : s
      )
    );
  }

  /** 매출 비활성화 — 연결된 입금 거래·이용권도 함께 비활성화 */
  function deactivateSale(id: string) {
    const old = sales.find((s) => s.id === id);
    if (old?.transactionId) deactivateTransaction(old.transactionId);
    if (old?.passId) deactivatePass(old.passId);
    setSales((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, isActive: false, deletedAt: nowTs(), updatedAt: nowTs(), prevSnapshot: JSON.stringify(s) }
          : s
      )
    );
  }

  /** 고객별 매출 (customerId 우선, 없으면 이름으로 매칭) — 활성만 */
  function getCustomerSales(customerId: string, customerName?: string): Sale[] {
    return activeSales
      .filter((s) => (s.customerId && s.customerId === customerId) || (!!customerName && s.customerName === customerName))
      .sort((a, b) => b.saleDate.localeCompare(a.saleDate));
  }

  /** 매출의 특정 필드만 갱신 (자동 동기화 없이 참조만 변경) */
  function patchSale(saleId: string, patch: Partial<Sale>) {
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? { ...s, ...patch, updatedAt: nowTs(), prevSnapshot: JSON.stringify(s) }
          : s
      )
    );
  }

  // ── 입금 수동 연결 ──
  function linkSaleTransaction(saleId: string, transactionId: string) {
    patchSale(saleId, { transactionId });
  }
  function unlinkSaleTransaction(saleId: string) {
    patchSale(saleId, { transactionId: undefined });
  }
  /** 새 입금 거래를 생성해 매출에 연결 */
  function createIncomeForSale(saleId: string) {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    const txn = buildIncomeTransaction(sale);
    addTransaction(txn);
    patchSale(saleId, { transactionId: txn.id });
  }

  // ── 이용권 수동 연결 ──
  function linkSalePass(saleId: string, passId: string) {
    patchSale(saleId, { passId });
  }
  function unlinkSalePass(saleId: string) {
    patchSale(saleId, { passId: undefined });
  }
  /** 새 이용권을 생성해 매출에 연결 */
  function createPassForSale(saleId: string) {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;
    const pass = buildPassFromSale(sale, phoneOf(sale.customerId));
    addPass(pass);
    patchSale(saleId, { passId: pass.id });
  }

  return (
    <SalesContext.Provider value={{
      sales, activeSales, addSale, updateSale, deactivateSale, getCustomerSales,
      linkSaleTransaction, unlinkSaleTransaction, createIncomeForSale,
      linkSalePass, unlinkSalePass, createPassForSale,
    }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used inside SalesProvider');
  return ctx;
}

/** 매출 합계 계산 유틸 (환불 제외가 매출 인식 기준) */
export function sumRevenue(sales: Sale[]): number {
  return sales.filter((s) => s.paymentStatus !== '환불').reduce((acc, s) => acc + s.amount, 0);
}
export function sumOutstanding(sales: Sale[]): number {
  return sales.filter((s) => s.paymentStatus === '미수금').reduce((acc, s) => acc + s.amount, 0);
}

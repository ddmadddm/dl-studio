export type TransactionType = '입금' | '출금';
export type TransactionCategory =
  | '수업료' | '체험비' | 'VIP프로그램'
  | '광고비' | '임대료' | '인건비' | '장비비' | '소모품' | '기타';
export type PaymentMethod = '카드' | '현금' | '계좌이체' | '간편결제';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  counterpart: string;
  amount: number;
  method: PaymentMethod;
  hasReceipt: boolean;
  hasTaxInvoice: boolean;
  memo: string;
  // ── 누적 관리 필드 ──
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  prevSnapshot?: string;
}

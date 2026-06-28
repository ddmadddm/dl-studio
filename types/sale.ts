/**
 * DL STUDIO 매출 데이터 타입
 * - 누적 추가 방식: 삭제 없이 isActive: false 처리
 * - 수정 시 updatedAt + prevSnapshot 기록
 * - 고객/이용권/입출금 연동을 위한 ID 필드 구조화 (자동 생성은 아직 없음)
 */

export type SaleType =
  | '체험비'
  | '이용권'
  | 'VIP프로그램'
  | '패시브스트레칭'
  | '바디메커니즘'
  | 'AI영상분석'
  | '기타';

export type SalePaymentMethod = '카드' | '현금' | '계좌이체' | '간편결제';

export type SalePaymentStatus = '결제완료' | '미수금' | '부분결제' | '환불';

export type InvoiceStatus = '미발행' | '발행완료' | '해당없음';

export const SALE_TYPES: SaleType[] = [
  '체험비', '이용권', 'VIP프로그램', '패시브스트레칭', '바디메커니즘', 'AI영상분석', '기타',
];
export const SALE_PAYMENT_METHODS: SalePaymentMethod[] = ['카드', '현금', '계좌이체', '간편결제'];
export const SALE_PAYMENT_STATUSES: SalePaymentStatus[] = ['결제완료', '미수금', '부분결제', '환불'];
export const INVOICE_STATUSES: InvoiceStatus[] = ['미발행', '발행완료', '해당없음'];

export interface Sale {
  id: string;
  saleDate: string;            // 'YYYY-MM-DD' — 날짜미정이면 등록 시점 기준 임시값
  customerId: string;          // 고객관리 DB 연결 (mockCustomers.id)
  customerName: string;        // 고객 선택 시 자동 저장
  saleTitle: string;           // 매출명 (예: "패시브스트레칭 10회권")
  saleType: SaleType;
  programName: string;         // 프로그램명
  amount: number;
  paymentMethod: SalePaymentMethod;
  paymentStatus: SalePaymentStatus;
  invoiceStatus: InvoiceStatus;
  memo: string;
  isDateUnknown: boolean;      // 매출일 미정 여부

  // ── 연동용 구조화 필드 ──
  passId?: string;             // 이용권관리 연결 (이용권 구매 매출 → 자동 생성)
  transactionId?: string;      // 입출금관리 입금 거래 연결

  // ── 이용권 자동 생성용 입력값 (saleType === '이용권'일 때 사용) ──
  passTotalCount?: number;     // 이용권 총 횟수
  passValidMonths?: number;    // 유효기간(개월)

  // ── 누적 관리 필드 ──
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  prevSnapshot?: string;
}

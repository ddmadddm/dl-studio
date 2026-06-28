export type PassStatus = '사용중' | '만료예정' | '사용완료' | '중지';
export type PassPaymentStatus = '결제완료' | '미결제' | '부분결제';

export interface Pass {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  passName: string;
  totalCount: number;
  usedCount: number;
  remainCount: number;
  purchaseDate: string;
  expiryDate: string;
  paymentAmount: number;
  paymentStatus: PassPaymentStatus;
  status: PassStatus;
  memo: string;
  createdAt: string;
  updatedAt: string;
  // ── 누적 관리 필드 ──
  isActive: boolean;
  deletedAt?: string;
  prevSnapshot?: string;
}

/** 이용권 사용 이력 동작 유형 */
export type PassUsageAction = '차감' | '복구';
/** 이용권 차감/복구 사유 */
export type PassUsageReason = '수업완료' | '예약삭제' | '수업완료취소' | '관리자수정';

export interface PassUsage {
  id: string;
  passId: string;
  customerId: string;
  customerName: string;
  usedDate: string;
  program: string;
  instructor: string;
  reservationId: string;
  deductCount: number;
  memo: string;
  createdAt: string;
  isActive: boolean;
  // ── 차감/복구 구분 (누적 추가) ──
  /** 차감 | 복구 (없으면 legacy='차감'으로 간주) */
  actionType?: PassUsageAction;
  /** 차감/복구 사유 */
  reason?: PassUsageReason;
}

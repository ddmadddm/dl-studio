import { Pass, PassUsage } from '@/types/pass';

/** 이용권 표시 상태 */
export type PassUsableStatus = '사용가능' | '잔여없음' | '만료' | '중지' | '비활성';

/** 만료일이 지났는지 */
export function isPassExpired(pass: Pass): boolean {
  if (!pass.expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(pass.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry.getTime() < today.getTime();
}

/** 잔여 횟수 (저장값 우선, 없으면 총-사용으로 계산) */
export function calculateRemainingCount(pass: Pass): number {
  if (typeof pass.remainCount === 'number') return pass.remainCount;
  return Math.max(0, (pass.totalCount ?? 0) - (pass.usedCount ?? 0));
}

/** 이용권 사용 가능 상태 판정 */
export function getPassStatus(pass: Pass): PassUsableStatus {
  if (pass.isActive === false) return '비활성';
  if (pass.status === '중지') return '중지';
  if (isPassExpired(pass)) return '만료';
  if (calculateRemainingCount(pass) <= 0) return '잔여없음';
  return '사용가능';
}

/** 고객의 활성 이용권 전체 (isActive) — 만료일 임박 순 */
export function getActivePassesByCustomer(passes: Pass[], customerId: string): Pass[] {
  return passes
    .filter((p) => p.isActive !== false && p.customerId === customerId)
    .sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''));
}

/** 고객의 "사용 가능한" 이용권 (잔여 1회 이상, 만료/중지 아님) */
export function getUsablePassesByCustomer(passes: Pass[], customerId: string): Pass[] {
  return getActivePassesByCustomer(passes, customerId).filter(
    (p) => getPassStatus(p) === '사용가능'
  );
}

/** 특정 예약에 대한 복구 이력이 이미 존재하는지 (중복 복구 방지) */
export function hasRestoreUsage(usages: PassUsage[], reservationId: string): boolean {
  return usages.some(
    (u) => u.isActive && u.reservationId === reservationId && u.actionType === '복구'
  );
}

/** 특정 예약에 대한 차감 이력이 이미 존재하는지 (중복 차감 방지) */
export function hasDeductUsage(usages: PassUsage[], reservationId: string): boolean {
  return usages.some(
    (u) => u.isActive && u.reservationId === reservationId && u.actionType === '차감'
  );
}

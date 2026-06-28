export type ProgramType =
  | '패시브스트레칭' | '바디메커니즘' | 'AI영상분석'
  | '싱글프로젝트' | 'VIP코칭' | '통증개선' | '비거리향상';

export type InstructorType = '김보형' | '마틴프로' | '기타강사';
export type RoomType = '1번룸' | '2번룸' | '골프존' | '상담룸' | '외부필드' | '기타';
export type ReservationStatus = '예약완료' | '수업완료' | '취소' | '노쇼' | '변경요청';
export type ReservationPaymentStatus = '미결제' | '결제완료' | '부분결제';

export interface Reservation {
  id: string;
  date: string;
  /** @deprecated startTime 으로 대체. 기존 데이터 호환을 위해 유지 (fallback: startTime ?? time) */
  time: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  program: ProgramType;
  instructor: InstructorType;
  room: RoomType;
  status: ReservationStatus;
  paymentStatus: ReservationPaymentStatus;
  memo: string;
  cancelReason: string;
  createdAt: string;
  // ── 예약 시간 계산 필드 (누적 추가) ──
  /** 시작 시간 'HH:MM' (30분 단위) */
  startTime?: string;
  /** 종료 시간 'HH:MM' (시작+레슨시간 자동 계산, 또는 수동) */
  endTime?: string;
  /** 레슨 시간(분) — 50 | 60 | 90 | 120 | 직접입력 */
  durationMinutes?: number;
  /** 종료 시간을 사용자가 직접 수정했는지 */
  isEndTimeManual?: boolean;
  /** 중복(시간 겹침) 경고를 무시하고 강제 저장했는지 */
  overlapApproved?: boolean;
  // ── 누적 관리 필드 ──
  isActive: boolean;
  updatedAt: string;
  deletedAt?: string;
  prevSnapshot?: string;
}

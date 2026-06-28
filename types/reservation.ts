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
  // ── 누적 관리 필드 ──
  isActive: boolean;
  updatedAt: string;
  deletedAt?: string;
  prevSnapshot?: string;
}

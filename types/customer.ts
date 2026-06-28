export type CustomerGrade = '신규' | '체험' | '일반' | 'VIP' | '휴면';
export type CustomerSource = '인스타' | '블로그' | 'BNI' | '지인소개' | '카카오채널' | '유튜브' | '기타';
export type ServiceType = '패시브스트레칭' | '바디메커니즘' | 'AI영상분석' | '싱글프로젝트' | 'VIP코칭' | '통증개선' | '비거리향상';
export type ConcernType = '비거리' | '슬라이스' | '회전제한' | '허리통증' | '어깨통증' | '골반불균형' | '체력저하';
export type PaymentStatus = '미결제' | '결제완료' | '부분결제';

export type Gender = '남성' | '여성' | '미입력';

export const GLOVE_SIZES = ['18호', '19호', '20호', '21호', '22호', '23호', '24호', '기타'] as const;
export type GloveSize = typeof GLOVE_SIZES[number];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  gender?: Gender;
  grade: CustomerGrade;
  source: CustomerSource;
  services: ServiceType[];
  concerns: ConcernType[];
  firstVisit: string;
  lastVisit: string;
  paymentStatus: PaymentStatus;
  totalPayment: number;
  // ── 기존 코치 텍스트 (하위호환 보존) ──
  coach: string;
  // ── 코치 DB 연결 (신규 필드) ──
  coachId?: string;
  coachName?: string;
  // ── 골프 신체 정보 (신규 필드) ──
  handicap?: string;    // 텍스트 허용: "18", "보기플레이어", "초보" 등
  footSize?: string;    // 숫자: "250" 등
  gloveSize?: GloveSize | string;
  memo: string;
  // ── 누적 관리 필드 ──
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  prevSnapshot?: string;
}

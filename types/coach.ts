export type CoachStatus = '활동중' | '휴면' | '퇴사';

export interface Coach {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: string;   // 전문 분야
  memo: string;
  status: CoachStatus;
  // 누적 관리 필드
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  prevSnapshot?: string;
}

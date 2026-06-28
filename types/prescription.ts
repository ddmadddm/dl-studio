/**
 * 마틴골프처방전 데이터 타입
 * - 누적 추가 방식: 삭제 없이 isActive: false 처리
 * - 수정 시 updatedAt + prevSnapshot 기록
 * - 실제 AI 분석은 미구현 — mock 분석 결과 저장 구조. 추후 AI 연동 대비 필드 구조화.
 */

export type PrescriptionType = '일반분석' | '필드SOS' | '레슨후분석' | '전후비교';
export type UploadType = '영상' | '사진' | '영상+사진';
export type SwingView = '정면' | '측면' | '후면' | '필드영상' | '기타';
export type CurrentProblem =
  | '드라이버안맞음' | '아이언뒤땅' | '탑볼' | '슬라이스' | '훅'
  | '비거리감소' | '퍼팅불안' | '체력저하' | '기타';
export type Condition = '좋음' | '보통' | '피곤' | '통증있음';
export type PainArea = '없음' | '목' | '어깨' | '허리' | '골반' | '무릎' | '발목' | '기타';
export type PrescriptionStatus = '분석대기' | 'AI분석완료' | '코치확인대기' | '코치피드백완료';

export const PRESCRIPTION_TYPES: PrescriptionType[] = ['일반분석', '필드SOS', '레슨후분석', '전후비교'];
export const UPLOAD_TYPES: UploadType[] = ['영상', '사진', '영상+사진'];
export const SWING_VIEWS: SwingView[] = ['정면', '측면', '후면', '필드영상', '기타'];
export const CURRENT_PROBLEMS: CurrentProblem[] = ['드라이버안맞음', '아이언뒤땅', '탑볼', '슬라이스', '훅', '비거리감소', '퍼팅불안', '체력저하', '기타'];
export const CONDITIONS: Condition[] = ['좋음', '보통', '피곤', '통증있음'];
export const PAIN_AREAS: PainArea[] = ['없음', '목', '어깨', '허리', '골반', '무릎', '발목', '기타'];
export const PRESCRIPTION_STATUSES: PrescriptionStatus[] = ['분석대기', 'AI분석완료', '코치확인대기', '코치피드백완료'];

export interface Prescription {
  id: string;
  // ── 고객 연결 (고객관리 DB) ──
  customerId: string;
  customerName: string;
  customerPhone: string;

  prescriptionDate: string;          // 'YYYY-MM-DD'
  prescriptionType: PrescriptionType;
  uploadType: UploadType;
  swingView: SwingView;
  currentProblem: CurrentProblem;
  condition: Condition;
  painArea: PainArea;

  // ── 업로드 미디어 (현재 mock, 추후 Supabase Storage / S3) ──
  mediaUrls: string[];

  // ── 분석 점수 (0 = 미분석) ──
  overallScore: number;
  headStabilityScore: number;
  shoulderRotationScore: number;
  thoracicRotationScore: number;
  hipRotationScore: number;
  weightShiftScore: number;
  balanceScore: number;
  finishScore: number;

  // ── AI 분석 결과 (mock) ──
  aiSummary: string;
  aiCause: string;
  fieldQuickFix: string;             // 오늘 필드에서 바로 할 교정 포인트
  doNotToday: string;                // 오늘 하지 말아야 할 동작
  recommendedExercise: string;
  recommendedProgram: string;

  // ── 코치 피드백 ──
  coachComment: string;

  status: PrescriptionStatus;
  isSOS: boolean;                    // 필드 SOS 여부 (prescriptionType === '필드SOS')

  // ── 누적 관리 필드 ──
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  prevSnapshot?: string;
}

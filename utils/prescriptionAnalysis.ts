/**
 * 마틴골프처방전 분석 유틸
 * - 현재는 mock 분석 결과를 생성한다. (실제 AI 미연동)
 * - 추후 OpenAI Vision / MediaPipe / MoveNet 연동 시 analyzePrescription() 내부만 교체하면 된다.
 */

import {
  Prescription, PrescriptionStatus, PrescriptionType, CurrentProblem, Condition,
} from '@/types/prescription';

/** 분석으로 채워지는 필드들 */
export type PrescriptionAnalysis = Pick<
  Prescription,
  | 'overallScore' | 'headStabilityScore' | 'shoulderRotationScore' | 'thoracicRotationScore'
  | 'hipRotationScore' | 'weightShiftScore' | 'balanceScore' | 'finishScore'
  | 'aiSummary' | 'aiCause' | 'fieldQuickFix' | 'doNotToday' | 'recommendedExercise' | 'recommendedProgram'
>;

const SCORE_KEYS: (keyof PrescriptionAnalysis)[] = [
  'headStabilityScore', 'shoulderRotationScore', 'thoracicRotationScore',
  'hipRotationScore', 'weightShiftScore', 'balanceScore', 'finishScore',
];

/** 문제별 의심 원인 / 교정 포인트 템플릿 */
const PROBLEM_TEMPLATES: Record<CurrentProblem, { cause: string; quickFix: string; doNot: string; exercise: string; program: string }> = {
  드라이버안맞음: { cause: '백스윙 시 흉추 회전 부족으로 팔로만 스윙하는 패턴이 의심됩니다.', quickFix: '어드레스에서 상체를 5도 더 세우고 백스윙을 천천히 시작하세요.', doNot: '강하게 휘두르려는 풀스윙은 오늘 자제하세요.', exercise: '흉추 회전 스트레칭 3세트', program: '바디메커니즘 8회 프로그램' },
  아이언뒤땅: { cause: '체중 이동이 늦어 임팩트 시 무게중심이 뒤에 남아 있습니다.', quickFix: '왼발에 체중을 60% 두고 어드레스하세요.', doNot: '손목으로 퍼올리는 스쿱 동작을 피하세요.', exercise: '체중 이동 스텝 드릴 10회', program: '싱글프로젝트 12회 프로그램' },
  탑볼: { cause: '임팩트 직전 상체가 들리며(early extension) 머리가 위로 뜨는 경향이 있습니다.', quickFix: '엉덩이를 의자에 걸친 느낌으로 자세를 유지하세요.', doNot: '머리를 들어 공의 행방을 빨리 보지 마세요.', exercise: '월 슬라이드 자세 유지 5회', program: '바디메커니즘 8회 프로그램' },
  슬라이스: { cause: '다운스윙에서 클럽이 아웃-인 궤도로 들어오며 페이스가 열립니다.', quickFix: '백스윙을 인사이드로 빼고 그립을 약간 스트롱으로 잡으세요.', doNot: '팔로 끌어내리는 캐스팅 동작을 피하세요.', exercise: '인사이드 궤도 타월 드릴 10회', program: 'AI영상분석 4회 프로그램' },
  훅: { cause: '손목 릴리즈가 과도하게 빨라 페이스가 닫힌 채 임팩트됩니다.', quickFix: '그립을 약간 위크로 잡고 피니시까지 가슴을 회전하세요.', doNot: '손목을 의도적으로 굴리지 마세요.', exercise: '릴리즈 타이밍 드릴 10회', program: 'AI영상분석 4회 프로그램' },
  비거리감소: { cause: '하체 회전과 체중 이동 부족으로 파워 손실이 발생합니다.', quickFix: '백스윙 톱에서 잠깐 멈춘 뒤 하체부터 전환하세요.', doNot: '상체로만 빠르게 치려 하지 마세요.', exercise: '점프 스쿼트 12회 x 3세트', program: '비거리향상 6회 프로그램' },
  퍼팅불안: { cause: '셋업 정렬과 어깨 라인이 일관되지 않습니다.', quickFix: '눈을 공 바로 위에 두고 어깨로만 진자 스트로크 하세요.', doNot: '손목을 사용한 퍼팅을 피하세요.', exercise: '거울 보고 어깨 진자 스트로크 5분', program: '통증개선 6회 프로그램' },
  체력저하: { cause: '라운드 후반 코어 지구력 저하로 스윙 일관성이 떨어집니다.', quickFix: '샷 사이 호흡을 길게 가져가고 리듬을 일정하게 유지하세요.', doNot: '무리한 풀스윙 반복을 피하세요.', exercise: '플랭크 40초 x 3세트', program: '패시브스트레칭 8회 프로그램' },
  기타: { cause: '전반적인 스윙 시퀀스의 일관성 개선이 필요합니다.', quickFix: '템포를 일정하게(3:1) 유지하며 스윙하세요.', doNot: '한 번에 여러 가지를 고치려 하지 마세요.', exercise: '템포 메트로놈 드릴 10회', program: '바디메커니즘 8회 프로그램' },
};

/** 0~100 사이 점수 생성 (기준값 ± 변동) */
function scoreAround(base: number): number {
  const v = Math.round(base + (Math.random() * 16 - 8));
  return Math.max(40, Math.min(99, v));
}

/** 컨디션에 따른 점수 보정 */
function conditionBase(condition: Condition): number {
  switch (condition) {
    case '좋음': return 80;
    case '보통': return 72;
    case '피곤': return 64;
    case '통증있음': return 58;
    default: return 70;
  }
}

/**
 * mock 분석 결과 생성 — "AI 분석 결과 생성" 버튼이 호출한다.
 * 입력(현재 문제/컨디션)에 따라 그럴듯한 점수·피드백을 만든다.
 */
export function generateMockPrescriptionAnalysis(input?: Partial<Prescription>): PrescriptionAnalysis {
  const problem = (input?.currentProblem ?? '기타') as CurrentProblem;
  const condition = (input?.condition ?? '보통') as Condition;
  const base = conditionBase(condition);
  const tpl = PROBLEM_TEMPLATES[problem] ?? PROBLEM_TEMPLATES['기타'];

  const scores = {
    headStabilityScore: scoreAround(base),
    shoulderRotationScore: scoreAround(base),
    thoracicRotationScore: scoreAround(base),
    hipRotationScore: scoreAround(base),
    weightShiftScore: scoreAround(base),
    balanceScore: scoreAround(base),
    finishScore: scoreAround(base),
  };
  const overallScore = Math.round(
    SCORE_KEYS.reduce((sum, k) => sum + (scores as Record<string, number>)[k], 0) / SCORE_KEYS.length
  );

  return {
    ...scores,
    overallScore,
    aiSummary: `종합 점수 ${overallScore}점. '${problem}' 패턴이 관찰되며 컨디션은 '${condition}' 상태입니다. 핵심 회전·체중 이동 시퀀스를 우선 점검하세요.`,
    aiCause: tpl.cause,
    fieldQuickFix: tpl.quickFix,
    doNotToday: tpl.doNot,
    recommendedExercise: tpl.exercise,
    recommendedProgram: tpl.program,
  };
}

/**
 * 분석 진입점 — 추후 실제 AI(OpenAI Vision/MediaPipe/MoveNet) 연동 시 이 함수만 교체.
 * 지금은 mock 결과를 반환한다.
 */
export function analyzePrescription(input?: Partial<Prescription>): PrescriptionAnalysis {
  return generateMockPrescriptionAnalysis(input);
}

/** 점수 평균 계산 (세부 7개 항목 평균) */
export function calculateAverageScore(p: Partial<Prescription>): number {
  const vals = SCORE_KEYS.map((k) => Number((p as Record<string, number>)[k] ?? 0)).filter((v) => v > 0);
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/** 상태 뱃지 스타일 */
export function getPrescriptionStatusBadge(status: PrescriptionStatus): { label: string; className: string } {
  const map: Record<PrescriptionStatus, string> = {
    분석대기:     'bg-[#FFF6D8] text-[#A17400]',           // 옐로우
    AI분석완료:   'bg-[#EAF4FA] text-[#1F6A8C]',           // 블루
    코치확인대기: 'bg-[#FDECEA] text-[#C24132]',           // 레드(주의)
    코치피드백완료: 'bg-[#E8F6EF] text-[#2F8F5B]',         // 그린(완료)
  };
  return { label: status, className: map[status] };
}

/** 처방 유형 뱃지 스타일 */
export function getPrescriptionTypeBadge(type: PrescriptionType): { label: string; className: string } {
  const map: Record<PrescriptionType, string> = {
    일반분석:   'bg-[#EAF4FA] text-[#1F6A8C]',
    필드SOS:    'bg-[#FDECEA] text-[#C24132]',             // 레드 계열
    레슨후분석: 'bg-[#E0F4F8] text-[#2F80A7]',
    전후비교:   'bg-[#F3E8FF] text-[#7C3AED]',
  };
  return { label: type, className: map[type] };
}

/** 점수 → 색상 (시각화용) */
export function scoreColor(score: number): string {
  if (score >= 80) return '#2F8F5B';   // 그린
  if (score >= 65) return '#2F80A7';   // 블루그린
  if (score >= 50) return '#A17400';   // 옐로우
  return '#C24132';                    // 레드
}

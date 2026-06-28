import { SettingOption, SettingCategory } from '@/types/setting';

const today = '2026-06-03';

function makeOptions(category: SettingCategory, labels: string[]): SettingOption[] {
  return labels.map((label, i) => ({
    id: `${category}-${i + 1}`,
    category,
    label,
    value: label,
    isActive: true,
    sortOrder: i + 1,
    createdAt: today,
    updatedAt: today,
  }));
}

export const mockSettings: SettingOption[] = [
  ...makeOptions('customerGrade',   ['신규', '체험', '일반', 'VIP', '휴면']),
  ...makeOptions('inflowPath',      ['인스타', '블로그', 'BNI', '지인소개', '카카오채널', '유튜브', '기타']),
  ...makeOptions('interestService', ['패시브스트레칭', '바디메커니즘', 'AI영상분석', '싱글프로젝트', 'VIP코칭', '통증개선', '비거리향상']),
  ...makeOptions('painPoint',       ['비거리', '슬라이스', '회전제한', '허리통증', '어깨통증', '골반불균형', '체력저하']),
  ...makeOptions('program',         ['패시브스트레칭', '바디메커니즘', 'AI영상분석', '싱글프로젝트', 'VIP코칭', '통증개선', '비거리향상']),
  ...makeOptions('instructor',      ['김보형', '마틴프로', '기타강사']),
  ...makeOptions('location',        ['1번룸', '2번룸', '골프존', '상담룸', '외부필드', '기타']),
];

/** 카테고리별 기본값 (복원용) */
export const DEFAULT_SETTINGS = mockSettings.map((s) => ({ ...s }));

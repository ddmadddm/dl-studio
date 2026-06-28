export type SettingCategory =
  | 'customerGrade'
  | 'inflowPath'
  | 'interestService'
  | 'painPoint'
  | 'program'
  | 'instructor'
  | 'location';

export const SETTING_CATEGORY_LABELS: Record<SettingCategory, string> = {
  customerGrade:   '고객 등급',
  inflowPath:      '유입 경로',
  interestService: '관심 서비스',
  painPoint:       '주요 고민',
  program:         '프로그램',
  instructor:      '담당 강사',
  location:        '장소',
};

export const SETTING_CATEGORY_DESC: Record<SettingCategory, string> = {
  customerGrade:   '고객관리에서 등급 분류에 사용됩니다',
  inflowPath:      '고객이 어떤 경로로 유입되었는지 분류합니다',
  interestService: '고객이 관심 갖는 서비스 항목입니다',
  painPoint:       '고객의 주요 고민 항목입니다',
  program:         '예약관리에서 프로그램 선택에 사용됩니다',
  instructor:      '예약관리에서 담당 강사 선택에 사용됩니다',
  location:        '예약관리에서 장소 선택에 사용됩니다',
};

export interface SettingOption {
  id: string;
  category: SettingCategory;
  label: string;
  value: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

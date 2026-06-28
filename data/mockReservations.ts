import { Reservation } from '@/types/reservation';

/**
 * 예약 시드 데이터 — 리셋됨 (빈 상태에서 직접 입력)
 * 필요 시 예약관리 화면의 "예약 추가"로 등록한다.
 *
 * 시간 필드 구조 (누적):
 *  - startTime: 시작 시간 'HH:MM' (30분 단위)
 *  - durationMinutes: 레슨 시간(분) — 50 | 60 | 90 | 120 | 직접입력
 *  - endTime: 종료 시간 (시작+레슨시간 자동 계산, 또는 수동)
 *  - isEndTimeManual: 종료 시간 직접 수정 여부
 *  - overlapApproved: 중복 경고 무시하고 강제 저장 여부
 *
 * 기존 데이터 호환: startTime 이 없으면 legacy `time` 필드를 사용한다.
 * (utils/time.ts 의 getReservationStart / getReservationTiming 가 fallback 처리)
 */
export const mockReservations: Reservation[] = [];

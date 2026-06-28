import { Reservation } from '@/types/reservation';
import { TIME_SLOTS, normalizeTime, isValidTimeSlot, getReservationStart } from '@/utils/time';

// 시간 슬롯/검증 유틸은 utils/time.ts 로 이전 — 기존 import 경로 호환을 위해 재노출
export { TIME_SLOTS, normalizeTime, isValidTimeSlot };

export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** YYYY-MM-DD → Date */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Date → YYYY-MM-DD */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 오늘 날짜 YYYY-MM-DD */
export function getToday(): string {
  return formatDate(new Date());
}

/** 해당 주의 월~일 7일 배열 */
export function getWeekDays(baseDate: string): string[] {
  const base = parseDate(baseDate);
  const dow = base.getDay(); // 0=일
  const mon = new Date(base);
  mon.setDate(base.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return formatDate(d);
  });
}

/** 주 이동 */
export function moveWeek(baseDate: string, direction: 1 | -1): string {
  const d = parseDate(baseDate);
  d.setDate(d.getDate() + direction * 7);
  return formatDate(d);
}

/** MM/DD (요일) */
export function formatDayLabel(dateStr: string): { mmdd: string; dow: string } {
  const d = parseDate(dateStr);
  const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  const dow = DAY_LABELS[d.getDay()];
  return { mmdd, dow };
}

/**
 * 특정 날짜·시간 슬롯의 예약 목록.
 * 시간을 30분 단위로 정확히 매칭한다(반올림하지 않음).
 * - 10:30 예약 → 10:30 슬롯에만 표시
 * - 10:00 예약 → 10:00 슬롯에만 표시
 * 30분 단위가 아니거나 범위 밖인 시간은 어떤 슬롯에도 매칭되지 않으며,
 * getUnslottedReservations 로 따로 "시간 형식 확인 필요" 처리한다.
 */
export function getReservationsByDateTime(
  reservations: Reservation[],
  date: string,
  time: string
): Reservation[] {
  const slot = normalizeTime(time);
  return reservations.filter(
    (r) => r.date === date && getReservationStart(r) === slot
  );
}

/** 주어진 날짜들 중 시작 시간이 30분 단위 슬롯에 들어맞지 않는("시간 형식 확인 필요") 예약 */
export function getUnslottedReservations(
  reservations: Reservation[],
  dates: string[]
): Reservation[] {
  const dateSet = new Set(dates);
  return reservations.filter(
    (r) => dateSet.has(r.date) && !isValidTimeSlot(getReservationStart(r))
  );
}

/** 주간 예약 수 */
export function getWeeklyCount(reservations: Reservation[], weekDays: string[]): number {
  const set = new Set(weekDays);
  return reservations.filter((r) => set.has(r.date)).length;
}

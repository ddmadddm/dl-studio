import { Reservation } from '@/types/reservation';

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

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

/** 특정 날짜·시간의 예약 목록 */
export function getReservationsByDateTime(
  reservations: Reservation[],
  date: string,
  time: string
): Reservation[] {
  return reservations.filter((r) => r.date === date && r.time === time);
}

/** 주간 예약 수 */
export function getWeeklyCount(reservations: Reservation[], weekDays: string[]): number {
  const set = new Set(weekDays);
  return reservations.filter((r) => set.has(r.date)).length;
}

import { Reservation, ReservationStatus } from '@/types/reservation';

/* ────────────────────────────────────────────────────────────
 * 예약 시간 설정 (추후 설정관리에서 덮어쓸 수 있도록 구조화)
 * SettingsContext 연동 시 이 기본값을 대체하면 된다.
 * ──────────────────────────────────────────────────────────── */
export interface ReservationTimeConfig {
  businessStartTime: string;   // 운영 시작 'HH:MM'
  businessEndTime: string;     // 운영 종료 'HH:MM'
  timeSlotInterval: number;    // 슬롯 간격(분)
  defaultLessonDurations: number[]; // 기본 레슨 시간(분)
}

export const RESERVATION_TIME_CONFIG: ReservationTimeConfig = {
  businessStartTime: '09:00',
  businessEndTime: '21:00',
  timeSlotInterval: 30,
  defaultLessonDurations: [50, 60, 90, 120],
};

/** 캘린더 한 슬롯(=timeSlotInterval 분)의 높이(px) */
export const SLOT_PX = 40;
const BLOCK_GAP = 2;

/* ── 기본 시간 문자열 유틸 ── */

/** "HH:MM[:SS]" → 앞 5글자로 정규화 */
export function normalizeTime(time: string): string {
  return (time ?? '').slice(0, 5);
}

/** "HH:MM" → 자정 기준 분 */
export function timeToMinutes(time: string): number {
  const [h, m] = normalizeTime(time).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** 분 → "HH:MM" */
export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 시작/종료 시각 기준 30분 단위 슬롯 목록 생성 (종료 시각 포함) */
export function generateTimeSlots(startHour: number, endHour: number, intervalMinutes: number): string[] {
  const slots: string[] = [];
  for (let m = startHour * 60; m <= endHour * 60; m += intervalMinutes) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

/** time 에 minutes 를 더한 "HH:MM" */
export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

/** 시작 시간 + 레슨 시간(분) → 종료 시간 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  return addMinutesToTime(startTime, durationMinutes);
}

/** 시작~종료 시간의 길이(분). 음수면 0 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  return Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
}

/** 두 시간 구간이 겹치는지 (경계 접촉은 겹침 아님: 10~11 vs 11~12 = false) */
export function isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  const aS = timeToMinutes(startA), aE = timeToMinutes(endA);
  const bS = timeToMinutes(startB), bE = timeToMinutes(endB);
  return aS < bE && bS < aE;
}

/* ── 캘린더 슬롯 ── */

export const TIME_SLOTS = generateTimeSlots(
  Math.floor(timeToMinutes(RESERVATION_TIME_CONFIG.businessStartTime) / 60),
  Math.floor(timeToMinutes(RESERVATION_TIME_CONFIG.businessEndTime) / 60),
  RESERVATION_TIME_CONFIG.timeSlotInterval,
);

/** 유효한 슬롯(운영시간 내 30분 단위)인지 */
export function isValidTimeSlot(time: string): boolean {
  return TIME_SLOTS.includes(normalizeTime(time));
}

/** 예약 길이(분) → 블록 높이(px). 50분은 60분보다 약간 짧게, 최소 1칸 이상 */
export function getReservationBlockHeight(durationMinutes: number): number {
  const slots = durationMinutes / RESERVATION_TIME_CONFIG.timeSlotInterval;
  return Math.max(SLOT_PX, Math.round(slots * SLOT_PX) - BLOCK_GAP);
}

/* ── 예약 시간 필드 접근 (legacy time 필드 fallback 포함) ── */

/** 기존 데이터 호환: startTime ?? time */
export function getReservationStart(r: Reservation): string {
  return normalizeTime(r.startTime ?? r.time ?? '');
}

/** 예약의 {시작, 종료, 길이(분)} — 누락 필드는 안전하게 계산 */
export function getReservationTiming(r: Reservation): { start: string; end: string; duration: number } {
  const start = getReservationStart(r);
  let duration: number;
  if (typeof r.durationMinutes === 'number' && r.durationMinutes > 0) {
    duration = r.durationMinutes;
  } else if (r.endTime) {
    duration = getDurationMinutes(start, normalizeTime(r.endTime));
  } else {
    duration = 60; // legacy fallback
  }
  const end = r.endTime ? normalizeTime(r.endTime) : calculateEndTime(start, duration);
  return { start, end, duration };
}

/* ── 색상 ── */

export interface ColorSet {
  bg: string; border: string; name: string; text: string; sub: string; dot: string; chip: string;
}

const STATUS_COLORS: Record<ReservationStatus, ColorSet> = {
  예약완료: { bg: 'bg-[#EAF4FA]', border: 'border-l-[#2F80A7]', name: 'text-[#1F2937]', text: 'text-[#2F80A7]', sub: 'text-[#6B7280]', dot: 'bg-[#2F80A7]', chip: 'bg-[#2F80A7] text-white' },
  수업완료: { bg: 'bg-[#E8F6EF]', border: 'border-l-[#2F8F5B]', name: 'text-[#1F2937]', text: 'text-[#2F8F5B]', sub: 'text-[#6B7280]', dot: 'bg-[#7AC29A]', chip: 'bg-[#2F8F5B] text-white' },
  취소:     { bg: 'bg-[#F3F4F6]', border: 'border-l-[#9CA3AF]', name: 'text-[#9CA3AF]', text: 'text-[#9CA3AF]', sub: 'text-[#D1D5DB]', dot: 'bg-[#9CA3AF]', chip: 'bg-[#9CA3AF] text-white' },
  노쇼:     { bg: 'bg-[#FDECEA]', border: 'border-l-[#E76F51]', name: 'text-[#C24132]', text: 'text-[#E76F51]', sub: 'text-[#F5B8B0]', dot: 'bg-[#E76F51]', chip: 'bg-[#E76F51] text-white' },
  변경요청: { bg: 'bg-[#FFF6D8]', border: 'border-l-[#E9C46A]', name: 'text-[#92600A]', text: 'text-[#A17400]', sub: 'text-[#B38600]', dot: 'bg-[#E9C46A]', chip: 'bg-[#E9C46A] text-[#5C4300]' },
};

/** 필드SOS / 마틴골프처방전 관련 예약 (퍼플 계열) */
const GOLF_RX_COLORS: ColorSet = {
  bg: 'bg-[#F3EEFF]', border: 'border-l-[#7C5CFC]', name: 'text-[#4C2FA8]', text: 'text-[#6D45E0]', sub: 'text-[#8B7BC0]', dot: 'bg-[#A78BFA]', chip: 'bg-[#7C5CFC] text-white',
};

/** 예약 상태별 색상 세트 */
export function getReservationStatusColor(status: ReservationStatus): ColorSet {
  return STATUS_COLORS[status] ?? STATUS_COLORS.예약완료;
}

/** 골프 필드/처방전 관련 예약 여부 */
export function isGolfRxRelated(r: Reservation): boolean {
  return (
    r.room === '외부필드' ||
    r.room === '골프존' ||
    r.program === 'AI영상분석' ||
    r.program === '비거리향상' ||
    /sos/i.test(r.memo ?? '')
  );
}

/** 예약 카드에 적용할 색상 세트 (골프/처방전 관련이면 퍼플 우선, 취소·노쇼 제외) */
export function getReservationColorSet(r: Reservation): ColorSet {
  if (isGolfRxRelated(r) && r.status !== '취소' && r.status !== '노쇼') {
    return GOLF_RX_COLORS;
  }
  return getReservationStatusColor(r.status);
}

/* ── 중복 예약 검사 ── */

export interface OverlapResult {
  instructorConflict?: Reservation;
  roomConflict?: Reservation;
}

/**
 * 같은 날짜에 시간이 겹치는 같은 강사 / 같은 장소 예약을 찾는다.
 * (취소·노쇼·본인 제외)
 */
export function findOverlaps(target: Reservation, existing: Reservation[]): OverlapResult {
  const t = getReservationTiming(target);
  const result: OverlapResult = {};
  for (const r of existing) {
    if (r.id === target.id) continue;
    if (r.isActive === false) continue;
    if (r.status === '취소' || r.status === '노쇼') continue;
    if (r.date !== target.date) continue;
    const o = getReservationTiming(r);
    if (!isTimeOverlapping(t.start, t.end, o.start, o.end)) continue;
    if (!result.instructorConflict && r.instructor === target.instructor) result.instructorConflict = r;
    if (!result.roomConflict && r.room === target.room) result.roomConflict = r;
  }
  return result;
}

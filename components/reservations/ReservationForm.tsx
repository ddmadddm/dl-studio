'use client';

import { Reservation, ReservationStatus, ReservationPaymentStatus } from '@/types/reservation';
import { Customer } from '@/types/customer';
import { useState } from 'react';
import { X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CustomerSearchSelect from '@/components/customers/CustomerSearchSelect';
import CustomerForm from '@/components/customers/CustomerForm';
import CustomerPassSelector from './CustomerPassSelector';
import { useSettings } from '@/context/SettingsContext';
import {
  TIME_SLOTS, isValidTimeSlot, normalizeTime, generateTimeSlots,
  calculateEndTime, getDurationMinutes, findOverlaps,
  RESERVATION_TIME_CONFIG,
} from '@/utils/time';

interface Props {
  reservation: Reservation | null;
  onSave: (r: Reservation) => void;
  onClose: () => void;
  /** 중복 예약(시간 충돌) 검사를 위한 기존 예약 목록 */
  existingReservations?: Reservation[];
}

const statuses: ReservationStatus[]        = ['예약완료', '수업완료', '취소', '노쇼', '변경요청'];
const payStatuses: ReservationPaymentStatus[] = ['미결제', '결제완료', '부분결제'];
const DURATIONS = RESERVATION_TIME_CONFIG.defaultLessonDurations; // [50, 60, 90, 120]

export default function ReservationForm({ reservation, onSave, onClose, existingReservations = [] }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const { getLabels } = useSettings();

  // 설정에서 동적으로 불러오기
  const programLabels    = getLabels('program');
  const instructorLabels = getLabels('instructor');
  const locationLabels   = getLabels('location');

  // 기존 데이터 호환: startTime ?? time
  const initStart    = normalizeTime(reservation?.startTime ?? reservation?.time ?? '10:00');
  const initDuration = reservation?.durationMinutes ?? 60;
  const initManual   = reservation?.isEndTimeManual ?? false;
  const initEnd      = normalizeTime(reservation?.endTime ?? calculateEndTime(initStart, initDuration));

  const [form, setForm] = useState<Reservation>(
    reservation ?? {
      id: `r${Date.now()}`,
      date: today,
      time: initStart,
      startTime: initStart,
      endTime: initEnd,
      durationMinutes: initDuration,
      isEndTimeManual: initManual,
      overlapApproved: false,
      customerId: '',
      customerName: '',
      customerPhone: '',
      program: (programLabels[0] ?? '패시브스트레칭') as Reservation['program'],
      instructor: (instructorLabels[0] ?? '김보형') as Reservation['instructor'],
      room: (locationLabels[0] ?? '1번룸') as Reservation['room'],
      status: '예약완료',
      paymentStatus: '미결제',
      memo: '',
      cancelReason: '',
      createdAt: today,
      isActive: true,
      updatedAt: new Date().toISOString(),
    }
  );

  // 레슨시간 직접입력 모드 여부
  const [isCustomDuration, setIsCustomDuration] = useState(!DURATIONS.includes(initDuration));

  // 빈 칸 클릭으로 들어온 prefill 예약은 customerId 가 없으므로 "신규"로 본다
  const isNew = !reservation?.customerId;

  const startTime = form.startTime ?? form.time;
  const duration  = form.durationMinutes ?? 60;
  const endTime   = form.endTime ?? calculateEndTime(startTime, duration);
  const isManual  = form.isEndTimeManual ?? false;

  /** 시작 시간 변경 — 수동 모드가 아니면 종료 시간 재계산 */
  function handleStartChange(t: string) {
    setForm((f) => ({
      ...f, startTime: t, time: t,
      endTime: (f.isEndTimeManual ? f.endTime : calculateEndTime(t, f.durationMinutes ?? 60)),
    }));
  }

  /** 레슨 시간 변경 — 수동 모드가 아니면 종료 시간 재계산 */
  function handleDurationChange(d: number) {
    if (!d || d <= 0) return;
    setForm((f) => ({
      ...f, durationMinutes: d,
      endTime: (f.isEndTimeManual ? f.endTime : calculateEndTime(f.startTime ?? f.time, d)),
    }));
  }

  /** "종료 시간 직접 수정" 토글 */
  function handleManualToggle(checked: boolean) {
    setForm((f) => {
      const s = f.startTime ?? f.time;
      if (checked) return { ...f, isEndTimeManual: true };
      // 해제 → 시작+레슨시간 기준 자동 재계산
      const auto = calculateEndTime(s, f.durationMinutes ?? 60);
      return { ...f, isEndTimeManual: false, endTime: auto };
    });
  }

  /** 종료 시간 수동 선택 — durationMinutes 도 함께 갱신해 블록 높이를 일치시킴 */
  function handleEndChange(t: string) {
    setForm((f) => {
      const s = f.startTime ?? f.time;
      return { ...f, endTime: t, isEndTimeManual: true, durationMinutes: getDurationMinutes(s, t) };
    });
  }

  const selectedCustomer =
    form.customerId && form.customerName
      ? { id: form.customerId, name: form.customerName, phone: form.customerPhone }
      : null;

  const [showNewCustomer, setShowNewCustomer] = useState(false);

  function handleCustomerSelect(c: { id: string; name: string; phone: string } | null) {
    // 고객이 바뀌면 이용권 선택 초기화
    setForm({ ...form, customerId: c?.id ?? '', customerName: c?.name ?? '', customerPhone: c?.phone ?? '', passId: undefined, passName: undefined });
  }

  function handlePassSelect(passId: string | null, passName: string | null) {
    setForm((f) => ({ ...f, passId: passId ?? undefined, passName: passName ?? undefined }));
  }

  function handleNewCustomerSave(c: Customer) {
    handleCustomerSelect({ id: c.id, name: c.name, phone: c.phone });
    setShowNewCustomer(false);
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
      active ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
    }`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId || !form.customerName) return alert('고객을 선택해주세요.');
    if (!form.date) return alert('예약일을 선택해주세요.');
    if (!startTime) return alert('시작 시간을 선택해주세요.');
    if (!endTime || getDurationMinutes(startTime, endTime) <= 0) return alert('종료 시간이 시작 시간보다 늦어야 합니다.');

    // 저장 직전 시간 필드 정규화 (time 은 legacy 호환용으로 startTime 과 동기화)
    let next: Reservation = {
      ...form,
      startTime,
      endTime,
      time: startTime,
      durationMinutes: duration,
      isEndTimeManual: isManual,
      overlapApproved: form.overlapApproved ?? false,
    };

    // 중복 예약(시간 겹침) 검사 — 같은 날짜에 시간이 겹치는 같은 강사/같은 장소
    const { instructorConflict, roomConflict } = findOverlaps(next, existingReservations);
    if (instructorConflict || roomConflict) {
      const lines: string[] = [];
      if (instructorConflict) {
        const o = instructorConflict;
        lines.push(`• 해당 시간에 같은 강사(${next.instructor}) 예약이 있습니다. (${o.customerName} · ${normalizeTime(o.startTime ?? o.time)}~${normalizeTime(o.endTime ?? '')})`);
      }
      if (roomConflict) {
        const o = roomConflict;
        lines.push(`• 해당 시간에 같은 장소(${next.room}) 예약이 있습니다. (${o.customerName} · ${normalizeTime(o.startTime ?? o.time)}~${normalizeTime(o.endTime ?? '')})`);
      }
      const ok = confirm(`${lines.join('\n')}\n\n그래도 저장할까요?`);
      if (!ok) return;
      next = { ...next, overlapApproved: true };
    }

    onSave(next);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-lg font-bold text-gray-900">{isNew ? '예약 추가' : '예약 수정'}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 고객 선택 */}
            <div className="space-y-1.5">
              <Label>
                고객 선택 *
                <span className="text-xs text-gray-400 font-normal ml-2">고객관리에 등록된 고객만 예약 가능합니다</span>
              </Label>
              <CustomerSearchSelect
                selected={selectedCustomer}
                onSelect={handleCustomerSelect}
                onAddNew={() => setShowNewCustomer(true)}
              />
              {form.customerPhone && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 pl-1">
                  <Phone size={11} />
                  <span>{form.customerPhone}</span>
                </div>
              )}
            </div>

            {/* 고객 이용권 현황 + 사용할 이용권 선택 */}
            {form.customerId && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                <CustomerPassSelector
                  customerId={form.customerId}
                  selectedPassId={form.passId}
                  onSelect={handlePassSelect}
                />
              </div>
            )}

            {/* 날짜·시작시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>예약일 *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label>시작 시간 *</Label>
                <select
                  value={startTime}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                  {/* 기존 데이터가 30분 단위가 아니면 값 보존을 위해 임시 옵션 노출 */}
                  {startTime && !isValidTimeSlot(startTime) && (
                    <option value={startTime}>{startTime} (확인 필요)</option>
                  )}
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 레슨 시간 */}
            <div className="space-y-1.5">
              <Label>레슨 시간</Label>
              <div className="flex flex-wrap items-center gap-2">
                {DURATIONS.map((d) => (
                  <button key={d} type="button"
                    onClick={() => { setIsCustomDuration(false); handleDurationChange(d); }}
                    className={chip(!isCustomDuration && duration === d)}>
                    {d}분
                  </button>
                ))}
                <button type="button"
                  onClick={() => setIsCustomDuration(true)}
                  className={chip(isCustomDuration)}>
                  직접입력
                </button>
                {isCustomDuration && (
                  <div className="flex items-center gap-1.5">
                    <Input type="number" min={10} step={5} value={duration}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="w-24 border-gray-200" />
                    <span className="text-xs text-gray-500">분</span>
                  </div>
                )}
              </div>
            </div>

            {/* 종료 시간 (자동 계산 + 수동 수정) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>종료 시간</Label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" checked={isManual} onChange={(e) => handleManualToggle(e.target.checked)} className="accent-gray-900" />
                  종료 시간 직접 수정
                </label>
              </div>
              {isManual ? (
                <select
                  value={endTime}
                  onChange={(e) => handleEndChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                  {Array.from(new Set([endTime, ...generateTimeSlots(9, 23, RESERVATION_TIME_CONFIG.timeSlotInterval)]))
                    .sort()
                    .map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              ) : (
                <div className="flex h-9 w-full items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
                  {startTime} ~ <span className="font-semibold mx-1">{endTime}</span>
                  <span className="text-xs text-gray-400">(시작 +{duration}분 · 자동)</span>
                </div>
              )}
            </div>

            {/* 프로그램 (설정에서 로드) */}
            <div className="space-y-1.5">
              <Label>프로그램</Label>
              <div className="flex flex-wrap gap-2">
                {programLabels.map((p) => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, program: p as Reservation['program'] })} className={chip(form.program === p)}>{p}</button>
                ))}
              </div>
            </div>

            {/* 강사·장소 (설정에서 로드) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>담당강사</Label>
                <div className="flex flex-wrap gap-2">
                  {instructorLabels.map((i) => (
                    <button key={i} type="button" onClick={() => setForm({ ...form, instructor: i as Reservation['instructor'] })} className={chip(form.instructor === i)}>{i}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>장소</Label>
                <div className="flex flex-wrap gap-2">
                  {locationLabels.map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, room: r as Reservation['room'] })} className={chip(form.room === r)}>{r}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* 예약상태·결제상태 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>예약상태</Label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={chip(form.status === s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>결제상태</Label>
                <div className="flex flex-wrap gap-2">
                  {payStatuses.map((s) => (
                    <button key={s} type="button" onClick={() => setForm({ ...form, paymentStatus: s })} className={chip(form.paymentStatus === s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {(form.status === '취소' || form.status === '노쇼') && (
              <div className="space-y-1.5">
                <Label>취소사유</Label>
                <Input value={form.cancelReason} onChange={(e) => setForm({ ...form, cancelReason: e.target.value })} className="border-gray-200" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>예약메모</Label>
              <Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} rows={2} className="border-gray-200" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-200">취소</Button>
              <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-700 text-white">
                {isNew ? '예약 추가' : '수정 완료'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {showNewCustomer && (
        <div className="relative z-[60]">
          <CustomerForm
            customer={null}
            onSave={handleNewCustomerSave}
            onClose={() => setShowNewCustomer(false)}
          />
        </div>
      )}
    </>
  );
}

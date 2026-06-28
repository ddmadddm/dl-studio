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
import { useSettings } from '@/context/SettingsContext';

interface Props {
  reservation: Reservation | null;
  onSave: (r: Reservation) => void;
  onClose: () => void;
  /** 중복 예약(시간 충돌) 검사를 위한 기존 예약 목록 */
  existingReservations?: Reservation[];
}

const statuses: ReservationStatus[]        = ['예약완료', '수업완료', '취소', '노쇼', '변경요청'];
const payStatuses: ReservationPaymentStatus[] = ['미결제', '결제완료', '부분결제'];

export default function ReservationForm({ reservation, onSave, onClose, existingReservations = [] }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const { getLabels } = useSettings();

  // 설정에서 동적으로 불러오기
  const programLabels    = getLabels('program');
  const instructorLabels = getLabels('instructor');
  const locationLabels   = getLabels('location');

  const [form, setForm] = useState<Reservation>(
    reservation ?? {
      id: `r${Date.now()}`,
      date: today,
      time: '10:00',
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

  const selectedCustomer =
    form.customerId && form.customerName
      ? { id: form.customerId, name: form.customerName, phone: form.customerPhone }
      : null;

  const [showNewCustomer, setShowNewCustomer] = useState(false);

  function handleCustomerSelect(c: { id: string; name: string; phone: string } | null) {
    setForm({ ...form, customerId: c?.id ?? '', customerName: c?.name ?? '', customerPhone: c?.phone ?? '' });
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
    if (!form.time) return alert('예약시간을 선택해주세요.');

    // 중복 예약(시간 충돌) 검사 — 같은 날짜+시간에 동일 강사 또는 동일 장소
    // (취소/노쇼 예약과 본인은 제외)
    const conflict = existingReservations.find(
      (r) =>
        r.isActive &&
        r.id !== form.id &&
        r.status !== '취소' &&
        r.status !== '노쇼' &&
        r.date === form.date &&
        r.time === form.time &&
        (r.instructor === form.instructor || r.room === form.room)
    );
    if (conflict) {
      const reasons: string[] = [];
      if (conflict.instructor === form.instructor) reasons.push(`강사(${form.instructor})`);
      if (conflict.room === form.room) reasons.push(`장소(${form.room})`);
      const ok = confirm(
        `${form.date} ${form.time}에 ${reasons.join(', ')} 중복 예약이 있습니다.\n` +
        `(${conflict.customerName} · ${conflict.program})\n\n그래도 저장할까요?`
      );
      if (!ok) return;
    }

    onSave(form);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-lg font-bold text-gray-900">{reservation ? '예약 수정' : '예약 추가'}</h2>
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

            {/* 날짜·시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>예약일 *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <Label>예약시간 *</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="border-gray-200" />
              </div>
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
                {reservation ? '수정 완료' : '예약 추가'}
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

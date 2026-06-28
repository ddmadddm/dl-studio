'use client';

import { Pass, PassPaymentStatus, PassStatus } from '@/types/pass';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CustomerSearchSelect from '@/components/customers/CustomerSearchSelect';

const PASS_NAMES = ['VIP코칭 10회권', 'VIP코칭 5회권', '패시브스트레칭 8회권', '패시브스트레칭 4회권', '싱글프로젝트 12회권', '바디메커니즘 5회권', 'AI영상분석 4회권', '비거리향상 6회권', '통증개선 6회권', '자유이용권'];
const PAY_STATUSES: PassPaymentStatus[] = ['결제완료', '미결제', '부분결제'];
const PASS_STATUSES: PassStatus[] = ['사용중', '만료예정', '사용완료', '중지'];

/** 날짜 문자열에 개월 수 더하기 */
function addMonthsStr(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

interface Props {
  pass: Pass | null;
  onSave: (p: Pass) => void;
  onClose: () => void;
}

export default function PassForm({ pass, onSave, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<Pass>(pass ?? {
    id: `p${Date.now()}`,
    customerId: '', customerName: '', customerPhone: '',
    passName: 'VIP코칭 10회권',
    totalCount: 10, usedCount: 0, remainCount: 10,
    purchaseDate: today,
    expiryDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split('T')[0]; })(),
    paymentAmount: 0, paymentStatus: '미결제', status: '사용중',
    memo: '', createdAt: today, updatedAt: today,
    isActive: true,
  });

  // 만료일을 사용자가 직접 수정했는지 추적 (수정 전까지 구매일 기준 자동 계산)
  const [expiryTouched, setExpiryTouched] = useState(false);

  const selectedCustomer = form.customerId
    ? { id: form.customerId, name: form.customerName, phone: form.customerPhone }
    : null;

  function handleCustomerSelect(c: { id: string; name: string; phone: string } | null) {
    setForm({ ...form, customerId: c?.id ?? '', customerName: c?.name ?? '', customerPhone: c?.phone ?? '' });
  }

  function handleTotalChange(total: number) {
    const remain = Math.max(0, total - form.usedCount);
    setForm({ ...form, totalCount: total, remainCount: remain });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId) return alert('고객을 선택해주세요.');
    if (!form.passName.trim()) return alert('이용권명을 입력해주세요.');
    if (form.totalCount <= 0) return alert('총 횟수를 입력해주세요.');
    onSave({ ...form, updatedAt: today });
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${active ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">{pass ? '이용권 수정' : '이용권 추가'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 고객 선택 */}
          <div className="space-y-1.5">
            <Label>고객 선택 *</Label>
            <CustomerSearchSelect selected={selectedCustomer} onSelect={handleCustomerSelect} onAddNew={() => {}} />
          </div>

          {/* 이용권명 */}
          <div className="space-y-1.5">
            <Label>이용권명 *</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PASS_NAMES.map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, passName: n })} className={chip(form.passName === n)}>{n}</button>
              ))}
            </div>
            <Input value={form.passName} onChange={(e) => setForm({ ...form, passName: e.target.value })} placeholder="직접 입력 가능" className="border-gray-200" />
          </div>

          {/* 횟수 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>총 횟수 *</Label>
              <Input type="number" min={1} value={form.totalCount} onChange={(e) => handleTotalChange(Number(e.target.value))} className="border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label>사용 횟수</Label>
              <Input type="number" min={0} max={form.totalCount} value={form.usedCount}
                onChange={(e) => {
                  const used = Number(e.target.value);
                  setForm({ ...form, usedCount: used, remainCount: Math.max(0, form.totalCount - used) });
                }} className="border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label>잔여 횟수</Label>
              <Input type="number" value={form.remainCount} readOnly className="border-gray-200 bg-gray-50 text-gray-500" />
            </div>
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>구매일</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => {
                  const purchaseDate = e.target.value;
                  setForm((f) => ({
                    ...f,
                    purchaseDate,
                    // 사용자가 만료일을 직접 수정하지 않았다면 구매일+3개월로 자동 갱신
                    expiryDate: expiryTouched || !purchaseDate ? f.expiryDate : addMonthsStr(purchaseDate, 3),
                  }));
                }}
                className="border-gray-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label>만료일</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => { setExpiryTouched(true); setForm({ ...form, expiryDate: e.target.value }); }}
                className="border-gray-200"
              />
              <p className="text-xs text-gray-400">구매일 기준 3개월 자동 설정 (직접 수정 가능)</p>
            </div>
          </div>

          {/* 결제 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>결제금액</Label>
              <Input type="number" value={form.paymentAmount} onChange={(e) => setForm({ ...form, paymentAmount: Number(e.target.value) })} className="border-gray-200" />
              <p className="text-xs text-gray-400">매출 추적이 필요하면 매출관리에서 '이용권' 유형으로 등록하세요.</p>
            </div>
            <div className="space-y-1.5">
              <Label>결제상태</Label>
              <div className="flex gap-2 flex-wrap">
                {PAY_STATUSES.map((s) => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, paymentStatus: s })} className={chip(form.paymentStatus === s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 이용권상태 */}
          <div className="space-y-1.5">
            <Label>이용권 상태</Label>
            <div className="flex gap-2 flex-wrap">
              {PASS_STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={chip(form.status === s)}>{s}</button>
              ))}
            </div>
            <p className="text-xs text-gray-400">상태는 잔여 횟수·만료일에 따라 자동 계산됩니다. ('중지'만 수동 적용)</p>
          </div>

          {/* 메모 */}
          <div className="space-y-1.5">
            <Label>메모</Label>
            <Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} rows={2} className="border-gray-200" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-200">취소</Button>
            <Button type="submit" className="flex-1 bg-[#1F5C4D] hover:bg-[#2F6F5F] text-white">
              {pass ? '수정 완료' : '이용권 추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Sale, SaleType, SalePaymentMethod, SalePaymentStatus, InvoiceStatus,
  SALE_TYPES, SALE_PAYMENT_METHODS, SALE_PAYMENT_STATUSES, INVOICE_STATUSES,
} from '@/types/sale';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomer } from '@/context/CustomerContext';
import CustomerSearchSelect from '@/components/customers/CustomerSearchSelect';
import CustomerForm from '@/components/customers/CustomerForm';
import { genId, nowTs } from '@/lib/softDelete';

interface Props {
  sale: Sale | null;
  onSave: (s: Sale) => void;
  onClose: () => void;
}

/** 매출명에서 "N회" 패턴으로 총 횟수 추정 (예: "패시브스트레칭 10회권" → 10) */
function parseCount(title: string): number {
  const m = title.match(/(\d+)\s*회/);
  return m ? Number(m[1]) : 1;
}

export default function SaleForm({ sale, onSave, onClose }: Props) {
  const { activeCustomers } = useCustomer();
  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<Sale>(
    sale ?? {
      id: genId('sale'),
      saleDate: todayStr,
      customerId: '', customerName: '',
      saleTitle: '',
      saleType: '이용권',
      programName: '',
      amount: 0,
      paymentMethod: '카드',
      paymentStatus: '결제완료',
      invoiceStatus: '미발행',
      memo: '',
      isDateUnknown: false,
      isActive: true,
      createdAt: todayStr, updatedAt: nowTs(),
    }
  );

  // 고객 검색 (공용 컴포넌트)
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const phoneOf = (id: string) => activeCustomers.find((c) => c.id === id)?.phone ?? '';
  const selectedCustomer = form.customerId
    ? { id: form.customerId, name: form.customerName, phone: phoneOf(form.customerId) }
    : null;

  function handleNewCustomerSave(c: Customer) {
    setForm({ ...form, customerId: c.id, customerName: c.name });
    setShowNewCustomer(false);
  }

  const selectCls =
    'w-full h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2F80A7]/30 appearance-none';

  const sectionTitle = (title: string) => (
    <div className="flex items-center gap-2 pt-2">
      <div className="w-1 h-4 bg-[#2F80A7] rounded-full" />
      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{title}</p>
    </div>
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName.trim()) return alert('고객을 검색하여 선택해주세요.');
    if (!form.saleTitle.trim()) return alert('매출명을 입력해주세요.');
    if (!form.amount || form.amount <= 0) return alert('금액을 입력해주세요.');
    if (!form.isDateUnknown && !form.saleDate) return alert('매출일을 선택하거나 날짜미정을 체크해주세요.');
    onSave({
      ...form,
      updatedAt: nowTs(),
      prevSnapshot: sale ? JSON.stringify(sale) : undefined,
    });
  }

  return (
    <>
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-[#1F2937]">{sale ? '매출 수정' : '매출 등록'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F3F4F6]"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* ── 고객 선택 (고객관리 DB 연동) ── */}
          {sectionTitle('고객 선택')}
          <div className="space-y-1.5">
            <Label>고객 *<span className="text-xs text-[#9CA3AF] font-normal ml-2">고객관리에서 검색하여 선택</span></Label>
            <CustomerSearchSelect
              selected={selectedCustomer}
              onSelect={(c) => setForm({ ...form, customerId: c?.id ?? '', customerName: c?.name ?? '' })}
              onAddNew={() => setShowNewCustomer(true)}
            />
          </div>

          {/* ── 매출 정보 ── */}
          {sectionTitle('매출 정보')}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>매출명 *</Label>
              <Input value={form.saleTitle} onChange={(e) => setForm({ ...form, saleTitle: e.target.value })} placeholder="예: 패시브스트레칭 10회권" className="border-[#E5E7EB]" />
            </div>
            <div className="space-y-1.5">
              <Label>매출유형</Label>
              <select value={form.saleType} onChange={(e) => setForm({ ...form, saleType: e.target.value as SaleType })} className={selectCls}>
                {SALE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>프로그램명</Label>
              <Input value={form.programName} onChange={(e) => setForm({ ...form, programName: e.target.value })} placeholder="예: 패시브스트레칭" className="border-[#E5E7EB]" />
            </div>
            <div className="space-y-1.5">
              <Label>금액 (원) *</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="border-[#E5E7EB]" />
            </div>
          </div>

          {/* ── 이용권 자동 생성 (매출유형이 이용권일 때) ── */}
          {form.saleType === '이용권' && (
            <div className="bg-[#E0F4F8] border border-[#B0DEEA] rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[#1F6A8C]">
                이용권 자동 생성 · 등록 시 이용권관리에 이용권이 함께 추가됩니다
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>총 횟수</Label>
                  <Input
                    type="number" min={1}
                    value={form.passTotalCount ?? parseCount(form.saleTitle)}
                    onChange={(e) => setForm({ ...form, passTotalCount: Number(e.target.value) })}
                    className="border-[#B0DEEA] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>유효기간 (개월)</Label>
                  <Input
                    type="number" min={1}
                    value={form.passValidMonths ?? 3}
                    onChange={(e) => setForm({ ...form, passValidMonths: Number(e.target.value) })}
                    className="border-[#B0DEEA] bg-white"
                  />
                </div>
              </div>
              {form.passId && (
                <p className="text-xs text-[#2F80A7]">연결된 이용권: {form.passId}</p>
              )}
            </div>
          )}

          {/* ── 매출일 ── */}
          {sectionTitle('매출일')}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <Label>매출일</Label>
              <Input
                type="date"
                value={form.saleDate}
                disabled={form.isDateUnknown}
                onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
                className="border-[#E5E7EB] disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer select-none h-9">
              <input
                type="checkbox"
                checked={form.isDateUnknown}
                onChange={(e) => setForm({ ...form, isDateUnknown: e.target.checked })}
                className="w-4 h-4 rounded border-[#E5E7EB] accent-[#2F80A7]"
              />
              날짜미정 (월별 차트 집계 제외)
            </label>
          </div>

          {/* ── 결제 정보 ── */}
          {sectionTitle('결제 정보')}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>결제수단</Label>
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as SalePaymentMethod })} className={selectCls}>
                {SALE_PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>결제상태</Label>
              <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as SalePaymentStatus })} className={selectCls}>
                {SALE_PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>계산서 발행</Label>
              <select value={form.invoiceStatus} onChange={(e) => setForm({ ...form, invoiceStatus: e.target.value as InvoiceStatus })} className={selectCls}>
                {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {form.paymentStatus === '결제완료' && (
            <p className="text-xs text-[#2F8F5B] bg-[#E8F6EF] rounded-lg px-3 py-2">
              결제완료로 등록하면 입출금관리에 입금이 자동 추가됩니다.
            </p>
          )}

          {/* ── 메모 ── */}
          {sectionTitle('메모')}
          <Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} rows={3} className="border-[#E5E7EB]" placeholder="특이사항, 할인 내역 등" />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-[#E5E7EB]">취소</Button>
            <Button type="submit" className="flex-1 bg-[#2F80A7] hover:bg-[#256B8D] text-white">
              {sale ? '수정 완료' : '매출 등록'}
            </Button>
          </div>
        </form>
      </div>
    </div>

    {showNewCustomer && (
      <div className="relative z-[60]">
        <CustomerForm customer={null} onSave={handleNewCustomerSave} onClose={() => setShowNewCustomer(false)} />
      </div>
    )}
    </>
  );
}

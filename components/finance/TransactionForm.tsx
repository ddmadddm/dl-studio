'use client';

import { Transaction, TransactionType, TransactionCategory, PaymentMethod } from '@/types/transaction';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomer } from '@/context/CustomerContext';

interface Props {
  transaction: Transaction | null;
  onSave: (t: Transaction) => void;
  onClose: () => void;
}

// 구분별 항목 분리 (입금=수입 / 출금=지출)
const INCOME_CATEGORIES: TransactionCategory[] = ['수업료', '체험비', 'VIP프로그램', '기타'];
const EXPENSE_CATEGORIES: TransactionCategory[] = ['광고비', '임대료', '인건비', '장비비', '소모품', '기타'];
const methods: PaymentMethod[] = ['카드', '현금', '계좌이체', '간편결제'];

export default function TransactionForm({ transaction, onSave, onClose }: Props) {
  const { activeCustomers } = useCustomer();
  const [form, setForm] = useState<Transaction>(
    transaction ?? {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      date: new Date().toISOString().split('T')[0],
      type: '입금',
      category: '수업료',
      counterpart: '',
      amount: 0,
      method: '카드',
      hasReceipt: false,
      hasTaxInvoice: false,
      memo: '',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    }
  );

  const visibleCategories = form.type === '입금' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date) return alert('거래일을 입력해주세요.');
    if (!form.counterpart.trim()) return alert('거래처명을 입력해주세요.');
    if (form.amount <= 0) return alert('금액을 입력해주세요.');
    onSave(form);
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
      active ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
    }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">{transaction ? '내역 수정' : '입출금 추가'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>거래일 *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label>구분</Label>
              <div className="flex gap-2">
                {(['입금', '출금'] as TransactionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const valid = t === '입금' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                      setForm({ ...form, type: t, category: valid.includes(form.category) ? form.category : valid[0] });
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.type === t ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>항목 <span className="text-xs text-gray-400 font-normal ml-1">{form.type === '입금' ? '(수입 항목)' : '(지출 항목)'}</span></Label>
            <div className="flex flex-wrap gap-2">
              {visibleCategories.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, category: c })} className={chip(form.category === c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>고객명 / 거래처명 *{form.type === '입금' && <span className="text-xs text-gray-400 font-normal ml-2">고객명 자동완성</span>}</Label>
              <Input
                value={form.counterpart}
                onChange={(e) => setForm({ ...form, counterpart: e.target.value })}
                list={form.type === '입금' ? 'tx-customer-list' : undefined}
                placeholder={form.type === '입금' ? '고객명 또는 입금처' : '거래처명'}
                className="border-gray-200"
              />
              {form.type === '입금' && (
                <datalist id="tx-customer-list">
                  {activeCustomers.map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>금액 *</Label>
              <Input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="0"
                className="border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>결제수단</Label>
            <div className="flex gap-2">
              {methods.map((m) => (
                <button key={m} type="button" onClick={() => setForm({ ...form, method: m })} className={chip(form.method === m)}>{m}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasReceipt}
                onChange={(e) => setForm({ ...form, hasReceipt: e.target.checked })}
                className="w-4 h-4 accent-gray-700"
              />
              <span className="text-sm text-gray-700">증빙 있음</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasTaxInvoice}
                onChange={(e) => setForm({ ...form, hasTaxInvoice: e.target.checked })}
                className="w-4 h-4 accent-gray-700"
              />
              <span className="text-sm text-gray-700">계산서 발행</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <Label>메모</Label>
            <Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} rows={2} className="border-gray-200" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-200">취소</Button>
            <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-700 text-white">
              {transaction ? '수정 완료' : '추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

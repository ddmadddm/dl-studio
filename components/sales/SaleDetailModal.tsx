'use client';

import { useState } from 'react';
import { Sale, SalePaymentStatus } from '@/types/sale';
import { X, Pencil, Banknote, Ticket, Plus, Unlink } from 'lucide-react';
import { useSales } from '@/context/SalesContext';
import { useTransaction } from '@/context/TransactionContext';
import { usePass } from '@/context/PassContext';

interface Props {
  sale: Sale;
  onClose: () => void;
  onEdit: (s: Sale) => void;
}

export const payBadge: Record<SalePaymentStatus, string> = {
  결제완료: 'bg-[#E8F6EF] text-[#2F8F5B]',
  미수금:  'bg-[#FDECEA] text-[#C24132]',
  부분결제: 'bg-[#FFF6D8] text-[#A17400]',
  환불:    'bg-[#F3F4F6] text-[#9CA3AF]',
};

export default function SaleDetailModal({ sale, onClose, onEdit }: Props) {
  const {
    activeSales,
    linkSaleTransaction, unlinkSaleTransaction, createIncomeForSale,
    linkSalePass, unlinkSalePass, createPassForSale,
  } = useSales();
  const { activeTransactions } = useTransaction();
  const { activePasses } = usePass();

  // 연결 변경 후 즉시 반영되도록 컨텍스트의 최신 매출을 사용
  const s = activeSales.find((x) => x.id === sale.id) ?? sale;

  const [txnSel, setTxnSel] = useState('');
  const [passSel, setPassSel] = useState('');

  const linkedTxn  = s.transactionId ? activeTransactions.find((t) => t.id === s.transactionId) : null;
  const linkedPass = s.passId ? activePasses.find((p) => p.id === s.passId) : null;

  // 다른 매출에 이미 연결된 항목은 후보에서 제외
  const usedTxnIds  = new Set(activeSales.filter((x) => x.id !== s.id && x.transactionId).map((x) => x.transactionId));
  const usedPassIds = new Set(activeSales.filter((x) => x.id !== s.id && x.passId).map((x) => x.passId));

  const txnCandidates = activeTransactions.filter(
    (t) => t.type === '입금' && t.counterpart === s.customerName && !usedTxnIds.has(t.id)
  );
  const passCandidates = activePasses.filter(
    (p) => s.customerId && p.customerId === s.customerId && !usedPassIds.has(p.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-[#1F2937]">{s.saleTitle}</h2>
            <p className="text-sm text-[#9CA3AF]">{s.customerName} · {s.isDateUnknown ? '날짜미정' : s.saleDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${payBadge[s.paymentStatus]}`}>{s.paymentStatus}</span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F3F4F6]"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* 금액 강조 */}
          <div className="bg-[#202B3F] rounded-xl p-5 text-center">
            <p className="text-xs text-[#8BC6D9] mb-1">매출 금액</p>
            <p className="text-3xl font-bold text-white">{s.amount.toLocaleString()}원</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Info label="매출유형" value={s.saleType} />
            <Info label="프로그램명" value={s.programName || '—'} />
            <Info label="결제수단" value={s.paymentMethod} />
            <Info label="계산서 발행" value={s.invoiceStatus} />
            <Info label="매출일" value={s.isDateUnknown ? '날짜미정' : s.saleDate} />
            <Info label="고객 연결" value={s.customerId ? `연결됨 (${s.customerId})` : '미연결'} />
          </div>

          {/* ── 연동 관리 ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">연동 관리</p>

            {/* 입금 연결 */}
            <div className="bg-[#F4F6F8] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Banknote size={15} className="text-[#2F8F5B]" />
                <span className="text-sm font-semibold text-[#1F2937]">입금 연결</span>
                {linkedTxn && <span className="text-xs text-[#2F8F5B] bg-[#E8F6EF] px-2 py-0.5 rounded-full">연결됨</span>}
              </div>

              {linkedTxn ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#374151]">
                    {linkedTxn.date} · {linkedTxn.category} · <span className="font-semibold">{linkedTxn.amount.toLocaleString()}원</span>
                  </p>
                  <button onClick={() => unlinkSaleTransaction(s.id)} className="flex items-center gap-1 text-xs text-[#C24132] hover:underline">
                    <Unlink size={12} /> 연결 해제
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={txnSel}
                    onChange={(e) => setTxnSel(e.target.value)}
                    className="flex-1 min-w-40 h-8 px-2 rounded-lg border border-[#E5E7EB] text-sm bg-white"
                  >
                    <option value="">기존 입금 선택 ({txnCandidates.length}건)</option>
                    {txnCandidates.map((t) => (
                      <option key={t.id} value={t.id}>{t.date} · {t.amount.toLocaleString()}원 · {t.category}</option>
                    ))}
                  </select>
                  <button
                    disabled={!txnSel}
                    onClick={() => { linkSaleTransaction(s.id, txnSel); setTxnSel(''); }}
                    className="px-3 h-8 rounded-lg bg-[#2F80A7] text-white text-xs font-medium disabled:opacity-40 hover:bg-[#256B8D]"
                  >연결</button>
                  <button
                    onClick={() => createIncomeForSale(s.id)}
                    className="flex items-center gap-1 px-3 h-8 rounded-lg border border-[#B6DECA] text-[#2F8F5B] text-xs font-medium hover:bg-[#E8F6EF]"
                  ><Plus size={12} /> 새 입금 생성</button>
                </div>
              )}
            </div>

            {/* 이용권 연결 */}
            <div className="bg-[#F4F6F8] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Ticket size={15} className="text-[#2F80A7]" />
                <span className="text-sm font-semibold text-[#1F2937]">이용권 연결</span>
                {linkedPass && <span className="text-xs text-[#1F6A8C] bg-[#EAF4FA] px-2 py-0.5 rounded-full">연결됨</span>}
              </div>

              {linkedPass ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#374151]">
                    {linkedPass.passName} · <span className="font-semibold">잔여 {linkedPass.remainCount}/{linkedPass.totalCount}회</span>
                  </p>
                  <button onClick={() => unlinkSalePass(s.id)} className="flex items-center gap-1 text-xs text-[#C24132] hover:underline">
                    <Unlink size={12} /> 연결 해제
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={passSel}
                    onChange={(e) => setPassSel(e.target.value)}
                    className="flex-1 min-w-40 h-8 px-2 rounded-lg border border-[#E5E7EB] text-sm bg-white"
                  >
                    <option value="">기존 이용권 선택 ({passCandidates.length}건)</option>
                    {passCandidates.map((p) => (
                      <option key={p.id} value={p.id}>{p.passName} · 잔여 {p.remainCount}회</option>
                    ))}
                  </select>
                  <button
                    disabled={!passSel}
                    onClick={() => { linkSalePass(s.id, passSel); setPassSel(''); }}
                    className="px-3 h-8 rounded-lg bg-[#2F80A7] text-white text-xs font-medium disabled:opacity-40 hover:bg-[#256B8D]"
                  >연결</button>
                  <button
                    onClick={() => createPassForSale(s.id)}
                    className="flex items-center gap-1 px-3 h-8 rounded-lg border border-[#BDD9EA] text-[#2F80A7] text-xs font-medium hover:bg-[#EAF4FA]"
                  ><Plus size={12} /> 새 이용권 생성</button>
                </div>
              )}
            </div>
          </div>

          {s.memo && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">메모</p>
              <p className="text-sm text-[#374151] bg-[#F4F6F8] rounded-xl px-4 py-3">{s.memo}</p>
            </div>
          )}

          <button
            onClick={() => onEdit(s)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2F80A7] hover:bg-[#256B8D] text-white text-sm font-medium transition-colors"
          >
            <Pencil size={15} /> 매출 수정
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#9CA3AF] mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#1F2937]">{value}</p>
    </div>
  );
}

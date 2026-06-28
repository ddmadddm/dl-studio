'use client';

import { useState } from 'react';
import { Customer } from '@/types/customer';
import { X, Siren } from 'lucide-react';
import CustomerPassCard from './CustomerPassCard';
import { useSales, sumRevenue, sumOutstanding } from '@/context/SalesContext';
import { payBadge as salePayBadge } from '@/components/sales/SaleDetailModal';
import { usePrescription } from '@/context/PrescriptionContext';
import { getPrescriptionStatusBadge, getPrescriptionTypeBadge, scoreColor } from '@/utils/prescriptionAnalysis';
import PrescriptionDetailModal from '@/components/prescriptions/PrescriptionDetailModal';
import { Prescription } from '@/types/prescription';

interface Props { customer: Customer; onClose: () => void }

const gradeBadge: Record<string, string> = {
  신규: 'bg-gray-100 text-gray-600', 체험: 'bg-gray-100 text-gray-600',
  일반: 'bg-gray-100 text-gray-700', VIP: 'bg-gray-900 text-white', 휴면: 'bg-gray-50 text-gray-400',
};

export default function CustomerDetail({ customer: c, onClose }: Props) {
  const [tab, setTab] = useState<'info' | 'sales' | 'prescription'>('info');
  const { getCustomerSales } = useSales();
  const { getCustomerPrescriptions } = usePrescription();
  const customerSales = getCustomerSales(c.id, c.name);
  const salesTotal = sumRevenue(customerSales);
  const salesOutstanding = sumOutstanding(customerSales);
  const customerRx = getCustomerPrescriptions(c.id, c.name);
  const [rxDetail, setRxDetail] = useState<Prescription | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold">{c.name[0]}</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{c.name}</h2>
                {c.gender && c.gender !== '미입력' && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.gender === '남성' ? 'bg-[#EAF4FA] text-[#1F6A8C]' : 'bg-[#FCE8F0] text-[#9B3066]'}`}>
                    {c.gender === '남성' ? '♂ 남성' : '♀ 여성'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{c.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${gradeBadge[c.grade] ?? 'bg-gray-100 text-gray-600'}`}>{c.grade}</span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-100">
          {([['info', '기본 정보'], ['sales', `매출 이력${customerSales.length ? ` (${customerSales.length})` : ''}`], ['prescription', `마틴처방전${customerRx.length ? ` (${customerRx.length})` : ''}`]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key ? 'border-[#2F80A7] text-[#2F80A7]' : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'prescription' ? (
          <div className="p-6 space-y-3">
            {customerRx.length === 0 ? (
              <div className="text-center py-10 text-sm text-[#9CA3AF]">등록된 처방 내역이 없습니다.</div>
            ) : (
              customerRx.map((p) => {
                const sb = getPrescriptionStatusBadge(p.status);
                const tb = getPrescriptionTypeBadge(p.prescriptionType);
                return (
                  <button
                    key={p.id}
                    onClick={() => setRxDetail(p)}
                    className="w-full text-left bg-[#F4F6F8] hover:bg-[#EAF4FA] rounded-xl px-4 py-3 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-[#1F2937]">{p.prescriptionDate}</span>
                        {p.isSOS && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDECEA] text-[#C24132]"><Siren size={9} /> SOS</span>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sb.className}`}>{sb.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#6B7280]">
                        <span className={`px-1.5 py-0.5 rounded-full font-medium ${tb.className}`}>{tb.label}</span>
                        <span className="ml-2">{p.currentProblem}</span>
                      </p>
                      {p.overallScore > 0 && <span className="text-sm font-bold" style={{ color: scoreColor(p.overallScore) }}>{p.overallScore}점</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : tab === 'sales' ? (
          <div className="p-6 space-y-4">
            {/* 고객별 누적 매출 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#EAF4FA] border border-[#BDD9EA] rounded-xl p-4">
                <p className="text-xs text-[#2F80A7] mb-1">누적 매출</p>
                <p className="text-xl font-bold text-[#1F6A8C]">{salesTotal.toLocaleString()}원</p>
              </div>
              <div className="bg-[#FDECEA] border border-[#F5B8B0] rounded-xl p-4">
                <p className="text-xs text-[#C24132] mb-1">미수금</p>
                <p className="text-xl font-bold text-[#C24132]">{salesOutstanding.toLocaleString()}원</p>
              </div>
            </div>

            {/* 매출 내역 리스트 */}
            {customerSales.length === 0 ? (
              <div className="text-center py-10 text-sm text-[#9CA3AF]">등록된 매출 내역이 없습니다.</div>
            ) : (
              <div className="space-y-2">
                {customerSales.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-[#F4F6F8] rounded-xl px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1F2937] truncate">{s.saleTitle}</p>
                      <p className="text-xs text-[#9CA3AF]">{s.isDateUnknown ? '날짜미정' : s.saleDate} · {s.saleType}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${salePayBadge[s.paymentStatus]}`}>{s.paymentStatus}</span>
                      <span className="text-sm font-semibold text-[#1F2937]">{s.amount.toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
        <div className="p-6 space-y-5">
          {/* 이용권 카드 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">이용권</p>
            <CustomerPassCard customerId={c.id} customerName={c.name} />
          </div>

          {/* 기본 정보 */}
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">기본 정보</p>
            <div className="grid grid-cols-2 gap-4">
              <Info label="유입경로" value={c.source} />
              <Info label="담당코치" value={c.coachName || c.coach || '—'} />
              <Info label="첫 방문일" value={c.firstVisit} />
              <Info label="최근 방문일" value={c.lastVisit} />
              <Info label="결제 상태" value={c.paymentStatus} />
              <Info label="누적 결제금액" value={`${c.totalPayment.toLocaleString()}원`} />
            </div>
          </div>

          {/* 골프 정보 */}
          {(c.handicap || c.footSize || c.gloveSize) && (
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">골프 정보</p>
              <div className="grid grid-cols-3 gap-3">
                {c.handicap && (
                  <div className="bg-[#F4F6F8] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#9CA3AF] mb-1">핸디캡</p>
                    <p className="text-sm font-bold text-[#1F2937]">{c.handicap}</p>
                  </div>
                )}
                {c.footSize && (
                  <div className="bg-[#F4F6F8] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#9CA3AF] mb-1">발 사이즈</p>
                    <p className="text-sm font-bold text-[#1F2937]">{c.footSize}mm</p>
                  </div>
                )}
                {c.gloveSize && (
                  <div className="bg-[#F4F6F8] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#9CA3AF] mb-1">장갑 사이즈</p>
                    <p className="text-sm font-bold text-[#1F2937]">{c.gloveSize}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 관심 서비스 */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">관심 서비스</p>
            <div className="flex flex-wrap gap-1.5">
              {c.services.length > 0
                ? c.services.map((s) => <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{s}</span>)
                : <span className="text-xs text-gray-400">없음</span>}
            </div>
          </div>

          {/* 주요 고민 */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">주요 고민</p>
            <div className="flex flex-wrap gap-1.5">
              {c.concerns.length > 0
                ? c.concerns.map((con) => <span key={con} className="px-2.5 py-1 bg-gray-900 text-white rounded-full text-xs font-medium">{con}</span>)
                : <span className="text-xs text-gray-400">없음</span>}
            </div>
          </div>

          {/* 메모 */}
          {c.memo && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">메모</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">{c.memo}</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* 처방 상세 모달 (중첩) */}
      {rxDetail && (
        <PrescriptionDetailModal
          prescription={rxDetail}
          onClose={() => setRxDetail(null)}
          onEdit={() => setRxDetail(null)}
        />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

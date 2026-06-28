'use client';

import { usePass } from '@/context/PassContext';
import { useSales } from '@/context/SalesContext';
import { PassStatus } from '@/types/pass';
import { Ticket, PlusCircle, History, AlertCircle, Receipt } from 'lucide-react';
import { useState } from 'react';
import PassUsageHistory from '@/components/passes/PassUsageHistory';

const statusStyle: Record<PassStatus, string> = {
  사용중:   'bg-[#EBF5F0] text-[#1F5C4D] border-[#C8E6DA]',
  만료예정: 'bg-amber-50 text-amber-700 border-amber-200',
  사용완료: 'bg-gray-100 text-gray-500 border-gray-200',
  중지:     'bg-red-50 text-red-600 border-red-200',
};

interface Props { customerId: string; customerName: string }

export default function CustomerPassCard({ customerId, customerName }: Props) {
  const { passes, getActivePass, addCount, getUsages } = usePass();
  const { activeSales } = useSales();
  const activePass = getActivePass(customerId);
  const [showHistory, setShowHistory] = useState(false);
  const [showAll, setShowAll] = useState(false);

  /** 이용권에 연결된 매출 찾기 (Sale.passId === pass.id) */
  const linkedSale = (passId: string) => activeSales.find((s) => s.passId === passId);

  const allPasses = passes.filter((p) => p.customerId === customerId);
  const usages = activePass ? getUsages(activePass.id) : [];

  function handleAddCount() {
    if (!activePass) return;
    const input = prompt(`추가할 횟수를 입력하세요.`);
    const count = parseInt(input ?? '0', 10);
    if (count > 0) addCount(activePass.id, count);
  }

  if (!activePass && allPasses.length === 0) {
    return (
      <div className="bg-[#F7F8F5] rounded-2xl border border-dashed border-gray-200 p-5 flex items-center gap-3">
        <AlertCircle size={18} className="text-gray-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-600">보유 이용권 없음</p>
          <p className="text-xs text-gray-400">이용권관리에서 등록해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 현재 활성 이용권 카드 */}
      {activePass ? (
        <div className="bg-gradient-to-br from-[#EBF5F0] to-[#F0F9F4] rounded-2xl border border-[#C8E6DA] p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2F6F5F]/10 rounded-lg flex items-center justify-center">
                <Ticket size={16} className="text-[#2F6F5F]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{activePass.passName}</p>
                <p className="text-xs text-gray-500">만료: {activePass.expiryDate}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[activePass.status]}`}>
              {activePass.status}
            </span>
          </div>

          {/* 잔여 횟수 크게 표시 */}
          <div className="flex items-end gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">잔여</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-black ${activePass.remainCount <= 3 ? 'text-orange-500' : 'text-[#1F5C4D]'}`}>
                  {activePass.remainCount}
                </span>
                <span className="text-lg text-gray-500 font-medium">회</span>
              </div>
            </div>
            <div className="text-right flex-1">
              <p className="text-xs text-gray-400">{activePass.usedCount}회 사용 / 총 {activePass.totalCount}회</p>
              {/* 진행 바 */}
              <div className="mt-1.5 bg-white/60 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#2F6F5F] rounded-full transition-all duration-300"
                  style={{ width: `${(activePass.usedCount / activePass.totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={handleAddCount}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2F6F5F] hover:bg-[#1F5C4D] text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <PlusCircle size={14} /> 횟수 추가
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/80 hover:bg-white border border-[#C8E6DA] text-[#2F6F5F] rounded-xl text-xs font-medium transition-colors"
            >
              <History size={14} /> 사용 내역
            </button>
          </div>

          {/* 매출 연결 표시 */}
          {(() => {
            const sale = linkedSale(activePass.id);
            return sale ? (
              <div className="mt-3 flex items-center gap-2 bg-white/70 border border-[#C8E6DA] rounded-xl px-3 py-2">
                <Receipt size={13} className="text-[#2F6F5F] shrink-0" />
                <span className="text-xs text-gray-600 flex-1 truncate">매출 연결 · {sale.saleTitle}</span>
                <span className="text-xs font-semibold text-[#1F5C4D]">{sale.amount.toLocaleString()}원</span>
                <span className="text-[10px] text-gray-400">{sale.paymentStatus}</span>
              </div>
            ) : null;
          })()}

          {/* 최근 사용 내역 2건 */}
          {usages.slice(0, 2).length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#C8E6DA]/50">
              <p className="text-xs text-gray-500 mb-1.5 font-medium">최근 사용</p>
              {usages.slice(0, 2).map((u) => (
                <div key={u.id} className="flex items-center justify-between text-xs py-1">
                  <span className="text-gray-600">{u.program} · {u.instructor}</span>
                  <span className="text-gray-400">{u.usedDate} <span className="text-[#2F6F5F] font-semibold">-{u.deductCount}회</span></span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-orange-400 shrink-0" />
          <p className="text-sm text-gray-600">현재 사용 가능한 이용권이 없습니다.</p>
        </div>
      )}

      {/* 이전 이용권 접기/펼치기 */}
      {allPasses.filter((p) => p.id !== activePass?.id).length > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
        >
          {showAll ? '접기' : `이전 이용권 ${allPasses.filter((p) => p.id !== activePass?.id).length}건 보기`}
        </button>
      )}
      {showAll && allPasses.filter((p) => p.id !== activePass?.id).map((p) => {
        const sale = linkedSale(p.id);
        return (
          <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-600">{p.passName}</p>
              <p className="text-xs text-gray-400">{p.purchaseDate} ~ {p.expiryDate}</p>
              {sale && (
                <p className="text-xs text-[#2F6F5F] mt-0.5 flex items-center gap-1 truncate">
                  <Receipt size={11} className="shrink-0" /> 매출 연결 · {sale.amount.toLocaleString()}원
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[p.status]}`}>{p.status}</span>
              <p className="text-xs text-gray-400 mt-0.5">{p.usedCount}/{p.totalCount}회</p>
            </div>
          </div>
        );
      })}

      {showHistory && activePass && (
        <PassUsageHistory passName={activePass.passName} usages={usages} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

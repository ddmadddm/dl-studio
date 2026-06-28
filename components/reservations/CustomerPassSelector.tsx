'use client';

import { usePass } from '@/context/PassContext';
import { getPassStatus } from '@/utils/passDeduction';
import ReservationPassInfo from './ReservationPassInfo';
import { Ticket, AlertCircle, Check } from 'lucide-react';

interface Props {
  customerId: string;
  selectedPassId?: string;
  onSelect: (passId: string | null, passName: string | null) => void;
}

/** 고객 이용권 현황 + 사용할 이용권 선택 */
export default function CustomerPassSelector({ customerId, selectedPassId, onSelect }: Props) {
  const { getCustomerPasses } = usePass();
  const passes = customerId ? getCustomerPasses(customerId) : [];

  const usable = passes.filter((p) => getPassStatus(p) === '사용가능');
  const others = passes.filter((p) => getPassStatus(p) !== '사용가능');

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Ticket size={14} className="text-[#2F80A7]" />
        <span className="text-sm font-semibold text-gray-800">고객 이용권 현황</span>
      </div>

      {passes.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#F5B8B0] bg-[#FDECEA] px-4 py-3 text-xs text-[#C24132]">
          <AlertCircle size={14} className="shrink-0" />
          사용 가능한 이용권이 없습니다. 이용권 추가가 필요합니다.
        </div>
      ) : (
        <div className="space-y-2">
          {/* 미연결(이용권 없이 예약) 옵션 */}
          <button
            type="button"
            onClick={() => onSelect(null, null)}
            className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
              !selectedPassId ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${!selectedPassId ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
              {!selectedPassId && <Check size={11} className="text-white" />}
            </span>
            <span className="text-gray-600">이용권 없이 예약 (미연결)</span>
          </button>

          {/* 사용 가능 이용권 */}
          {usable.map((p) => {
            const active = selectedPassId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id, p.passName)}
                className={`w-full flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  active ? 'border-[#2F80A7] bg-[#EAF4FA]/50 ring-1 ring-[#2F80A7]/30' : 'border-gray-200 hover:border-[#2F80A7]/50'
                }`}
              >
                <span className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${active ? 'border-[#2F80A7] bg-[#2F80A7]' : 'border-gray-300'}`}>
                  {active && <Check size={11} className="text-white" />}
                </span>
                <div className="flex-1 min-w-0">
                  <ReservationPassInfo pass={p} />
                </div>
              </button>
            );
          })}

          {/* 사용 불가 이용권 (잔여없음/만료/중지) */}
          {others.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 opacity-70">
              <ReservationPassInfo pass={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

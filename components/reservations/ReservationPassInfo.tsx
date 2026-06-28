'use client';

import { Pass } from '@/types/pass';
import { getPassStatus, calculateRemainingCount, PassUsableStatus } from '@/utils/passDeduction';
import { Ticket, AlertTriangle } from 'lucide-react';

const statusBadge: Record<PassUsableStatus, string> = {
  사용가능: 'bg-[#E8F6EF] text-[#2F8F5B] border-[#B6DECA]',
  잔여없음: 'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]',
  만료:    'bg-[#FDECEA] text-[#C24132] border-[#F5B8B0]',
  중지:    'bg-[#FDECEA] text-[#C24132] border-[#F5B8B0]',
  비활성:  'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]',
};

interface Props {
  pass: Pass;
  /** 컴팩트 모드: 한 줄 요약 */
  compact?: boolean;
}

/** 이용권 1건의 현황 표시 (보유 이용권명/총·사용·잔여/만료일/결제상태/이용권상태) */
export default function ReservationPassInfo({ pass, compact = false }: Props) {
  const status = getPassStatus(pass);
  const remain = calculateRemainingCount(pass);
  const unpaid = pass.paymentStatus !== '결제완료';

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Ticket size={12} className="text-[#2F80A7] shrink-0" />
        <span className="font-medium text-gray-800">{pass.passName}</span>
        <span className={`font-bold ${remain <= 0 ? 'text-[#C24132]' : 'text-[#2F80A7]'}`}>잔여 {remain}회</span>
        <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${statusBadge[status]}`}>{status}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Ticket size={13} className="text-[#2F80A7] shrink-0" />
          <span className="text-sm font-semibold text-gray-900 truncate">{pass.passName}</span>
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-full border text-xs font-medium ${statusBadge[status]}`}>{status}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div><span className="text-gray-400">총</span> <span className="font-medium text-gray-700">{pass.totalCount}회</span></div>
        <div><span className="text-gray-400">사용</span> <span className="font-medium text-gray-700">{pass.usedCount}회</span></div>
        <div><span className="text-gray-400">잔여</span> <span className={`font-bold ${remain <= 0 ? 'text-[#C24132]' : 'text-[#2F80A7]'}`}>{remain}회</span></div>
        <div className="col-span-2"><span className="text-gray-400">만료일</span> <span className="font-medium text-gray-700">{pass.expiryDate}</span></div>
        <div><span className="text-gray-400">결제</span> <span className={`font-medium ${unpaid ? 'text-[#C24132]' : 'text-gray-700'}`}>{pass.paymentStatus}</span></div>
      </div>
      {unpaid && (
        <div className="flex items-center gap-1 text-[11px] text-[#C24132]">
          <AlertTriangle size={11} /> 미결제 이용권입니다. 결제 확인이 필요합니다.
        </div>
      )}
    </div>
  );
}

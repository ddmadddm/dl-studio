'use client';

import { useState } from 'react';
import { Reservation } from '@/types/reservation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Ticket, Trash2 } from 'lucide-react';

interface Props {
  reservation: Reservation;
  onConfirm: (deletedReason: string) => void;
  onClose: () => void;
}

/** 예약 삭제 확인 모달 — soft delete 안내 + 이용권 복구 안내 */
export default function DeleteReservationConfirmModal({ reservation: r, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('');
  const willRestore = !!r.passDeducted && !r.restoredPassOnDelete;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 size={17} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">예약 삭제</h2>
          </div>

          <p className="text-sm text-gray-700">
            <span className="font-semibold">{r.customerName || '이 고객'}</span> 님의 {r.date} {r.startTime ?? r.time} 예약을 삭제하시겠습니까?
          </p>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs text-gray-600">
            <AlertTriangle size={14} className="text-gray-400 shrink-0 mt-0.5" />
            이 예약은 실제 삭제되지 않고 <span className="font-semibold">비활성화 처리</span>됩니다. (데이터는 보존)
          </div>

          {willRestore && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-[#EAF4FA] border border-[#BDD9EA] px-3 py-2.5 text-xs text-[#1F6A8C]">
              <Ticket size={14} className="shrink-0 mt-0.5" />
              <span>이미 이용권이 차감된 예약입니다. <span className="font-semibold">삭제 시 이용권 1회가 자동 복구</span>됩니다.
                {r.passName && <span className="text-[#2F80A7]"> ({r.passName})</span>}
              </span>
            </div>
          )}

          <div className="mt-3 space-y-1.5">
            <label className="text-xs text-gray-500">삭제 사유 (선택)</label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 고객 취소 요청" className="border-gray-200" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 border-gray-200">취소</Button>
          <Button onClick={() => onConfirm(reason)} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            <Trash2 size={14} className="mr-1.5" /> 삭제
          </Button>
        </div>
      </div>
    </div>
  );
}

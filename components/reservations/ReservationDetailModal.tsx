'use client';

import { Reservation, ReservationStatus } from '@/types/reservation';
import { X, Phone, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusStyle: Record<ReservationStatus, string> = {
  예약완료: 'bg-gray-100 text-gray-700 border-gray-200',
  수업완료: 'bg-gray-900 text-white border-gray-900',
  취소:    'bg-gray-100 text-gray-400 border-gray-200',
  노쇼:    'bg-red-100 text-red-600 border-red-200',
  변경요청: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const payStyle: Record<string, string> = {
  미결제:  'text-red-500',
  결제완료: 'text-gray-500',
  부분결제: 'text-yellow-600',
};

interface Props {
  reservation: Reservation;
  onClose: () => void;
  onEdit: (r: Reservation) => void;
}

export default function ReservationDetailModal({ reservation: r, onClose, onEdit }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
              {r.customerName[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{r.customerName}</h2>
              {r.customerPhone && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Phone size={11} />
                  <span>{r.customerPhone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle[r.status]}`}>
              {r.status}
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['예약일', r.date],
              ['예약시간', r.time],
              ['프로그램', r.program],
              ['담당강사', r.instructor],
              ['장소', r.room],
              ['결제상태', r.paymentStatus],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className={`text-sm font-medium ${label === '결제상태' ? payStyle[value] : 'text-gray-800'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {r.memo && (
            <div>
              <p className="text-xs text-gray-400 mb-1">메모</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">{r.memo}</p>
            </div>
          )}
          {r.cancelReason && (
            <div>
              <p className="text-xs text-gray-400 mb-1">취소사유</p>
              <p className="text-sm text-gray-700 bg-red-50 rounded-xl px-4 py-3">{r.cancelReason}</p>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="px-6 pb-6 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 border-gray-200">닫기</Button>
          <Button
            onClick={() => onEdit(r)}
            className="flex-1 bg-gray-900 hover:bg-gray-700 text-white"
          >
            <Pencil size={14} className="mr-1.5" />
            수정하기
          </Button>
        </div>
      </div>
    </div>
  );
}

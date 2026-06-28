'use client';

import { Reservation, ReservationStatus } from '@/types/reservation';
import { X, Phone, Pencil, Trash2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getReservationTiming } from '@/utils/time';
import { usePass } from '@/context/PassContext';

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
  /** 삭제(비활성화) 핸들러. 지정 시 삭제 버튼 노출 */
  onDelete?: (r: Reservation) => void;
}

export default function ReservationDetailModal({ reservation: r, onClose, onEdit, onDelete }: Props) {
  const { start, end, duration } = getReservationTiming(r);
  const { passes } = usePass();
  const linkedPass = r.passId ? passes.find((p) => p.id === r.passId) : null;
  const deleted = r.isActive === false;
  const fmtDate = (s?: string) => (s ? s.slice(0, 10) : '');
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
              ['예약시간', `${start} ~ ${end}`],
              ['레슨시간', `${duration}분`],
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

          {/* 이용권 연동 정보 */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Ticket size={13} className="text-[#2F80A7]" />
              <span className="text-xs font-semibold text-gray-700">이용권 연동</span>
            </div>
            {r.passId ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div><span className="text-gray-400">연결 이용권</span><p className="font-medium text-gray-800 mt-0.5 truncate">{r.passName || linkedPass?.passName || '—'}</p></div>
                <div><span className="text-gray-400">이용권 잔여</span><p className="font-medium text-gray-800 mt-0.5">{linkedPass ? `${linkedPass.remainCount}회` : '—'}</p></div>
                <div>
                  <span className="text-gray-400">차감 여부</span>
                  <p className={`font-medium mt-0.5 ${r.passDeducted ? 'text-[#2F8F5B]' : 'text-gray-500'}`}>
                    {r.passDeducted ? `차감됨${r.passDeductedAt ? ` (${fmtDate(r.passDeductedAt)})` : ''}` : '미차감'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">복구 여부</span>
                  <p className={`font-medium mt-0.5 ${r.restoreUsageId ? 'text-[#2F80A7]' : 'text-gray-500'}`}>
                    {r.restoredPassOnDelete ? '삭제로 복구됨' : r.restoreUsageId ? '복구됨' : '복구 없음'}
                  </p>
                </div>
              </div>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFF6D8] text-[#A17400] border border-[#F0D875]">이용권 미연결 예약</span>
            )}
          </div>

          {/* 삭제 정보 */}
          {deleted && (
            <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-3 text-xs space-y-1">
              <p className="font-semibold text-gray-600">삭제(비활성화)된 예약</p>
              <p className="text-gray-500">삭제일: <span className="text-gray-700">{fmtDate(r.deletedAt)}</span></p>
              {r.deletedReason && <p className="text-gray-500">삭제사유: <span className="text-gray-700">{r.deletedReason}</span></p>}
              <p className="text-gray-500">이용권 복구: <span className="text-gray-700">{r.restoredPassOnDelete ? '복구됨' : '해당 없음'}</span></p>
            </div>
          )}

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
        <div className="px-6 pb-6 flex items-center gap-2">
          {onDelete && (
            <Button
              variant="outline"
              onClick={() => onDelete(r)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 size={14} className="mr-1.5" />
              삭제
            </Button>
          )}
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

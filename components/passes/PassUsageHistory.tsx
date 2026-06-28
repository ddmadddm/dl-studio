'use client';

import { PassUsage } from '@/types/pass';
import { X, History } from 'lucide-react';

interface Props {
  passName: string;
  usages: PassUsage[];
  onClose: () => void;
}

export default function PassUsageHistory({ passName, usages, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#2F6F5F]" />
            <div>
              <h2 className="text-base font-bold text-gray-900">사용 내역</h2>
              <p className="text-xs text-gray-400">{passName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1">
          {usages.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <History size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">사용 내역이 없습니다.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {usages.map((u) => {
                const isRestore = u.actionType === '복구';
                return (
                  <li key={u.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50">
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${isRestore ? 'bg-[#EAF4FA] text-[#2F80A7] border-[#BDD9EA]' : 'bg-[#FDECEA] text-[#C24132] border-[#F5B8B0]'}`}>
                      {isRestore ? '복구' : '차감'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{u.program || '—'}</span>
                        <span className="text-xs text-gray-400">{u.instructor}</span>
                        {u.reason && <span className="text-xs text-gray-400">· {u.reason}</span>}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">예약 {u.reservationId || '—'}{u.memo ? ` · ${u.memo}` : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">{u.usedDate}</p>
                      <p className={`text-xs font-semibold ${isRestore ? 'text-[#2F80A7]' : 'text-[#C24132]'}`}>{isRestore ? '+' : '-'}{u.deductCount}회</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">
            차감 {usages.filter((u) => u.actionType !== '복구').reduce((s, u) => s + u.deductCount, 0)}회 ·
            복구 {usages.filter((u) => u.actionType === '복구').reduce((s, u) => s + u.deductCount, 0)}회
          </p>
        </div>
      </div>
    </div>
  );
}

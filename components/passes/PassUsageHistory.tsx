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
              {usages.map((u, i) => (
                <li key={u.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 font-medium shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{u.program}</span>
                      <span className="text-xs text-gray-400">{u.instructor}</span>
                    </div>
                    {u.memo && <p className="text-xs text-gray-400 mt-0.5 truncate">{u.memo}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">{u.usedDate}</p>
                    <p className="text-xs font-semibold text-[#2F6F5F]">-{u.deductCount}회</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">총 {usages.length}회 사용 · 차감 합계 {usages.reduce((s, u) => s + u.deductCount, 0)}회</p>
        </div>
      </div>
    </div>
  );
}

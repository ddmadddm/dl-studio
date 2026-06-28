'use client';

import { useCoach } from '@/context/CoachContext';
import { ChevronDown, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Props {
  /** 선택된 coachId */
  value: string;
  /** { id, name } 형태로 반환 */
  onChange: (id: string, name: string) => void;
  /** 기존 텍스트 코치명 (마이그레이션 표시용) */
  legacyName?: string;
}

export default function CoachSelect({ value, onChange, legacyName }: Props) {
  const { activeCoaches } = useCoach();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selected = activeCoaches.find((c) => c.id === value);
  const displayName = selected?.name ?? legacyName ?? '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
          open ? 'border-[#2F80A7] ring-2 ring-[#2F80A7]/20' : 'border-[#E5E7EB] hover:border-[#BDD9EA]'
        } bg-white`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#EAF4FA] rounded-full flex items-center justify-center">
            <User size={12} className="text-[#2F80A7]" />
          </div>
          {displayName ? (
            <span className="text-[#1F2937] font-medium">{displayName}</span>
          ) : (
            <span className="text-[#9CA3AF]">담당 코치 선택...</span>
          )}
        </div>
        <ChevronDown size={15} className={`text-[#9CA3AF] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl border border-[#E5E7EB] shadow-xl overflow-hidden">
          {/* 미선택 옵션 */}
          <button
            type="button"
            onClick={() => { onChange('', ''); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4F6F8] text-left border-b border-[#F3F4F6] transition-colors"
          >
            <span className="text-sm text-[#9CA3AF]">선택 안 함</span>
          </button>

          {activeCoaches.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[#9CA3AF]">
              활동중인 코치가 없습니다.
            </div>
          ) : (
            activeCoaches.map((coach) => (
              <button
                key={coach.id}
                type="button"
                onClick={() => { onChange(coach.id, coach.name); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F4F6F8] text-left transition-colors ${value === coach.id ? 'bg-[#EAF4FA]' : ''}`}
              >
                <div className="w-8 h-8 bg-[#EAF4FA] rounded-full flex items-center justify-center text-[#2F80A7] font-bold text-sm shrink-0">
                  {coach.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${value === coach.id ? 'text-[#2F80A7]' : 'text-[#1F2937]'}`}>{coach.name}</p>
                  {coach.specialty && <p className="text-xs text-[#9CA3AF] truncate">{coach.specialty}</p>}
                </div>
                {value === coach.id && (
                  <span className="text-xs text-[#2F80A7] font-semibold shrink-0">선택됨</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

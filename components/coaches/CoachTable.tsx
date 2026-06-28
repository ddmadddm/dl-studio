'use client';

import { useState } from 'react';
import { Coach, CoachStatus } from '@/types/coach';
import { useCoach } from '@/context/CoachContext';
import { Plus, Pencil, EyeOff, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CoachForm from './CoachForm';

const statusStyle: Record<CoachStatus, string> = {
  활동중: 'bg-[#E8F6EF] text-[#2F8F5B] border-[#B6DECA]',
  휴면:   'bg-[#FFF6D8] text-[#A17400] border-[#F0D875]',
  퇴사:   'bg-[#FDECEA] text-[#C24132] border-[#F5B8B0]',
};

export default function CoachTable() {
  const { coaches, addCoach, updateCoach, deactivateCoach } = useCoach();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coach | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const visible = showInactive ? coaches : coaches.filter((c) => c.isActive);
  const inactiveCount = coaches.filter((c) => !c.isActive).length;

  function handleSave(c: Coach) {
    if (editTarget) updateCoach(c.id, c);
    else addCoach(c);
    setFormOpen(false); setEditTarget(null);
  }

  function handleDeactivate(id: string) {
    if (confirm('이 코치를 비활성화하시겠습니까?\n데이터는 보존됩니다.')) deactivateCoach(id);
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#6B7280]">
            총 <span className="font-semibold text-[#1F2937]">{visible.length}</span>명
            {' '}· 활동중 <span className="font-semibold text-[#2F8F5B]">{coaches.filter((c) => c.isActive && c.status === '활동중').length}</span>명
          </p>
          {inactiveCount > 0 && (
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${showInactive ? 'bg-[#202B3F] text-white border-[#202B3F]' : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'}`}
            >
              비활성 {inactiveCount}명 {showInactive ? '숨기기' : '보기'}
            </button>
          )}
        </div>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-[#2F80A7] hover:bg-[#256B8D] text-white">
          <Plus size={15} className="mr-1" /> 코치 등록
        </Button>
      </div>

      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((c) => (
          <div key={c.id} className={`bg-white rounded-xl border p-5 space-y-3 ${!c.isActive ? 'opacity-50 border-[#E5E7EB]' : 'border-[#E5E7EB] hover:border-[#BDD9EA] transition-colors'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#EAF4FA] rounded-full flex items-center justify-center text-[#2F80A7] font-bold text-lg">
                  {c.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1F2937]">{c.name}</p>
                    {!c.isActive && <span className="text-xs bg-[#F3F4F6] text-[#9CA3AF] px-1.5 py-0.5 rounded">비활성</span>}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{c.specialty || '전문 분야 미입력'}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[c.status]}`}>{c.status}</span>
            </div>

            <div className="space-y-1.5">
              {c.phone && (
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Phone size={12} className="text-[#9CA3AF]" />
                  <span>{c.phone}</span>
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Mail size={12} className="text-[#9CA3AF]" />
                  <span>{c.email}</span>
                </div>
              )}
              {c.memo && (
                <p className="text-xs text-[#9CA3AF] bg-[#F4F6F8] rounded-lg px-3 py-2 leading-relaxed">{c.memo}</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setEditTarget(c); setFormOpen(true); }}
                className="flex-1 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6] flex items-center justify-center gap-1 transition-colors"
              >
                <Pencil size={12} /> 수정
              </button>
              {c.isActive && (
                <button
                  onClick={() => handleDeactivate(c.id)}
                  className="flex-1 py-1.5 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#9CA3AF] hover:bg-[#FFF6D8] hover:text-[#A17400] flex items-center justify-center gap-1 transition-colors"
                >
                  <EyeOff size={12} /> 비활성화
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {formOpen && <CoachForm coach={editTarget} onSave={handleSave} onClose={() => { setFormOpen(false); setEditTarget(null); }} />}
    </div>
  );
}

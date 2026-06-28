'use client';

import { Coach, CoachStatus } from '@/types/coach';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { genId, nowTs } from '@/lib/softDelete';

interface Props {
  coach: Coach | null;
  onSave: (c: Coach) => void;
  onClose: () => void;
}

const STATUSES: CoachStatus[] = ['활동중', '휴면', '퇴사'];

export default function CoachForm({ coach, onSave, onClose }: Props) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<Coach>(
    coach ?? {
      id: genId('coach'),
      name: '', phone: '', email: '',
      specialty: '', memo: '',
      status: '활동중',
      isActive: true,
      createdAt: todayStr,
      updatedAt: nowTs(),
    }
  );

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
      active ? 'bg-[#202B3F] text-white border-[#202B3F]' : 'border-[#E5E7EB] text-[#374151] hover:border-[#2F80A7]'
    }`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert('코치명을 입력해주세요.');
    onSave({ ...form, updatedAt: nowTs(), prevSnapshot: coach ? JSON.stringify(coach) : undefined });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-[#1F2937]">{coach ? '코치 수정' : '코치 등록'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F3F4F6]"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>코치명 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-[#E5E7EB]" />
            </div>
            <div className="space-y-1.5">
              <Label>연락처</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" className="border-[#E5E7EB]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>이메일</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="coach@dlstudio.kr" className="border-[#E5E7EB]" />
          </div>

          <div className="space-y-1.5">
            <Label>전문 분야</Label>
            <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="예: VIP코칭, 바디메커니즘, AI영상분석" className="border-[#E5E7EB]" />
          </div>

          {/* 상태 */}
          <div className="space-y-1.5">
            <Label>상태</Label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={chip(form.status === s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>메모</Label>
            <Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} rows={3} className="border-[#E5E7EB]" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-[#E5E7EB]">취소</Button>
            <Button type="submit" className="flex-1 bg-[#2F80A7] hover:bg-[#256B8D] text-white">
              {coach ? '수정 완료' : '코치 등록'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

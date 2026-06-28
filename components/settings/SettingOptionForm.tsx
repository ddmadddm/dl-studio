'use client';

import { useState } from 'react';
import { SettingOption, SettingCategory } from '@/types/setting';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  category: SettingCategory;
  option: SettingOption | null;     // null = 신규 추가
  nextSortOrder: number;
  onSave: (opt: SettingOption) => void;
  onClose: () => void;
}

export default function SettingOptionForm({ category, option, nextSortOrder, onSave, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [label, setLabel] = useState(option?.label ?? '');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) { setError('항목명을 입력해주세요.'); return; }
    onSave({
      id:         option?.id ?? `${category}-${Date.now()}`,
      category,
      label:      label.trim(),
      value:      label.trim(),
      isActive:   option?.isActive ?? true,
      sortOrder:  option?.sortOrder ?? nextSortOrder,
      createdAt:  option?.createdAt ?? today,
      updatedAt:  today,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{option ? '항목 수정' : '항목 추가'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label>항목명 *</Label>
            <Input
              autoFocus
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError(''); }}
              placeholder="항목명 입력"
              className="border-gray-200"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-200">취소</Button>
            <Button type="submit" className="flex-1 bg-[#1F5C4D] hover:bg-[#2F6F5F] text-white">
              {option ? '수정 완료' : '추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

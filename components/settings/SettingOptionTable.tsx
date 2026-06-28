'use client';

import { useState } from 'react';
import { SettingOption, SettingCategory, SETTING_CATEGORY_LABELS, SETTING_CATEGORY_DESC } from '@/types/setting';
import { useSettings } from '@/context/SettingsContext';
import SettingOptionToggle from './SettingOptionToggle';
import SettingOptionForm from './SettingOptionForm';
import { Plus, Pencil, EyeOff, ChevronUp, ChevronDown, RotateCcw, GripVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { category: SettingCategory }

export default function SettingOptionTable({ category }: Props) {
  const { settings, addOption, updateOption, deactivateOption, toggleActive, reorder, resetCategory } = useSettings();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SettingOption | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const allItems = settings
    .filter((s) => s.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const items = showInactive ? allItems : allItems.filter((s) => s.isActive);
  const activeCount   = allItems.filter((s) => s.isActive).length;
  const inactiveCount = allItems.filter((s) => !s.isActive).length;

  function handleSave(opt: SettingOption) {
    if (editTarget) updateOption(opt.id, opt);
    else addOption(opt);
    setFormOpen(false); setEditTarget(null);
  }

  /** 삭제 없음 — isActive: false 비활성화 */
  function handleDeactivate(id: string) {
    if (confirm('이 항목을 비활성화하시겠습니까?\n데이터는 삭제되지 않고 숨겨집니다.')) {
      deactivateOption(id);
    }
  }

  function handleReset() {
    if (confirm('이 카테고리를 기본값으로 복원하시겠습니까?\n기존 항목은 비활성화되고 기본값이 새로 추가됩니다.')) {
      resetCategory(category);
    }
  }

  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1F2937]">{SETTING_CATEGORY_LABELS[category]}</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{SETTING_CATEGORY_DESC[category]}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            총 {allItems.length}개 · 활성 {activeCount}개 · 비활성 {inactiveCount}개
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {inactiveCount > 0 && (
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${showInactive ? 'bg-[#202B3F] text-white border-[#202B3F]' : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'}`}
            >
              {showInactive ? <Eye size={12} /> : <EyeOff size={12} />}
              비활성 {inactiveCount}개
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] border border-[#E5E7EB] transition-colors"
          >
            <RotateCcw size={12} />
            기본값 복원
          </button>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-[#2F80A7] hover:bg-[#256B8D] text-white text-sm">
            <Plus size={14} className="mr-1" /> 항목 추가
          </Button>
        </div>
      </div>

      {/* 미리보기 */}
      <div className="flex flex-wrap gap-2 p-4 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
        <span className="text-xs text-[#9CA3AF] self-center mr-1">미리보기</span>
        {allItems.filter((s) => s.isActive).map((s) => (
          <span key={s.id} className="px-3 py-1 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#374151] shadow-sm">{s.label}</span>
        ))}
        {activeCount === 0 && <span className="text-xs text-[#9CA3AF]">활성 항목 없음</span>}
      </div>

      {/* 항목 리스트 */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-[32px_1fr_80px_120px_80px] bg-[#F4F6F8] border-b border-[#E5E7EB] px-4 py-2.5">
          <div />
          <p className="text-xs font-semibold text-[#6B7280]">항목명</p>
          <p className="text-xs font-semibold text-[#6B7280] text-center">순서</p>
          <p className="text-xs font-semibold text-[#6B7280] text-center">활성화</p>
          <p className="text-xs font-semibold text-[#6B7280] text-center">관리</p>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-[#9CA3AF]">
            <p className="text-sm">항목이 없습니다.</p>
            <p className="text-xs mt-1">상단 "항목 추가" 버튼을 눌러 추가하세요.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F4F6F8]">
            {items.map((item, idx) => (
              <li
                key={item.id}
                className={`grid grid-cols-[32px_1fr_80px_120px_80px] items-center px-4 py-3 transition-colors ${
                  !item.isActive ? 'opacity-40 bg-[#F4F6F8]/50' : 'hover:bg-[#F4F6F8]/40'
                }`}
              >
                <div className="flex items-center justify-center text-[#D1D5DB]">
                  <GripVertical size={14} />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-sm font-medium ${item.isActive ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}`}>
                    {item.label}
                  </span>
                  {!item.isActive && (
                    <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded">비활성</span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-0.5">
                  <button onClick={() => idx > 0 && reorder(category, idx, idx - 1)} disabled={idx === 0} className="p-1 rounded hover:bg-[#F3F4F6] text-[#9CA3AF] disabled:opacity-20 transition-colors"><ChevronUp size={13} /></button>
                  <button onClick={() => idx < items.length - 1 && reorder(category, idx, idx + 1)} disabled={idx === items.length - 1} className="p-1 rounded hover:bg-[#F3F4F6] text-[#9CA3AF] disabled:opacity-20 transition-colors"><ChevronDown size={13} /></button>
                </div>
                <div className="flex items-center justify-center">
                  <SettingOptionToggle checked={item.isActive} onChange={() => toggleActive(item.id)} />
                </div>
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => { setEditTarget(item); setFormOpen(true); }}
                    className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  {item.isActive && (
                    <button
                      title="비활성화 (삭제 아님)"
                      onClick={() => handleDeactivate(item.id)}
                      className="p-1.5 rounded-lg hover:bg-[#FFF6D8] text-[#9CA3AF] hover:text-[#A17400] transition-colors"
                    >
                      <EyeOff size={13} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 비활성 항목 안내 */}
      {inactiveCount > 0 && !showInactive && (
        <p className="text-xs text-[#9CA3AF] text-center">
          비활성 항목 {inactiveCount}개가 숨겨져 있습니다.
          <button onClick={() => setShowInactive(true)} className="ml-1 text-[#2F80A7] underline">보기</button>
        </p>
      )}

      {formOpen && (
        <SettingOptionForm
          category={category}
          option={editTarget}
          nextSortOrder={allItems.length + 1}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

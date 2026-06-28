'use client';

import { SettingCategory, SETTING_CATEGORY_LABELS } from '@/types/setting';
import { useSettings } from '@/context/SettingsContext';
import { Star, Navigation, Sparkles, Brain, Dumbbell, User, MapPin } from 'lucide-react';

const CATEGORY_ICON: Record<SettingCategory, React.ElementType> = {
  customerGrade: Star, inflowPath: Navigation, interestService: Sparkles,
  painPoint: Brain, program: Dumbbell, instructor: User, location: MapPin,
};
const CATEGORIES: SettingCategory[] = ['customerGrade','inflowPath','interestService','painPoint','program','instructor','location'];

interface Props { selected: SettingCategory; onSelect: (c: SettingCategory) => void }

export default function SettingsCategoryList({ selected, onSelect }: Props) {
  const { settings } = useSettings();
  return (
    <div className="w-56 shrink-0 space-y-0.5">
      <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest px-3 mb-3">설정 항목</p>
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICON[cat];
        const count = settings.filter((s) => s.category === cat && s.isActive).length;
        const total = settings.filter((s) => s.category === cat).length;
        const active = selected === cat;
        return (
          <button key={cat} onClick={() => onSelect(cat)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${active ? 'bg-[#202B3F] text-white shadow-sm' : 'text-[#374151] hover:bg-[#F3F4F6]'}`}>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-white/10' : 'bg-[#EAF4FA]'}`}>
              <Icon size={13} className={active ? 'text-[#4BA3C7]' : 'text-[#2F80A7]'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${active ? 'text-white' : 'text-[#1F2937]'}`}>{SETTING_CATEGORY_LABELS[cat]}</p>
              <p className={`text-xs ${active ? 'text-[#8BC6D9]' : 'text-[#9CA3AF]'}`}>{count}/{total}개 활성</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { SettingCategory } from '@/types/setting';
import SettingsCategoryList from '@/components/settings/SettingsCategoryList';
import SettingOptionTable from '@/components/settings/SettingOptionTable';
import CoachTable from '@/components/coaches/CoachTable';
import { Users } from 'lucide-react';

type Tab = 'settings' | 'coaches';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('settings');
  const [selected, setSelected] = useState<SettingCategory>('customerGrade');

  return (
    <div className="space-y-5">
      {/* 탭 */}
      <div className="flex gap-1 bg-[#F4F6F8] p-1 rounded-xl w-fit border border-[#E5E7EB]">
        <button
          onClick={() => setTab('settings')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'settings' ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
        >
          항목 설정
        </button>
        <button
          onClick={() => setTab('coaches')}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'coaches' ? 'bg-white text-[#1F2937] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
        >
          <Users size={14} />
          코치 관리
        </button>
      </div>

      {/* 항목 설정 */}
      {tab === 'settings' && (
        <div className="flex gap-8 min-h-full">
          <SettingsCategoryList selected={selected} onSelect={setSelected} />
          <SettingOptionTable category={selected} />
        </div>
      )}

      {/* 코치 관리 */}
      {tab === 'coaches' && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#1F2937]">코치 관리</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">
              활동중인 코치만 고객 등록 화면에 표시됩니다. 향후 코치별 매출·예약 통계로 확장 가능합니다.
            </p>
          </div>
          <CoachTable />
        </div>
      )}
    </div>
  );
}

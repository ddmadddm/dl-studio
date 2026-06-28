'use client';

import { ReservationStatus, ReservationPaymentStatus } from '@/types/reservation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/context/SettingsContext';

export interface FilterState {
  date: string;
  customerName: string;
  instructor: string;
  room: string;
  status: ReservationStatus | '전체';
  paymentStatus: ReservationPaymentStatus | '전체';
  program: string;
  noShowOnly: boolean;
  todayOnly: boolean;
  thisWeekOnly: boolean;
}

export const defaultFilters: FilterState = {
  date: '', customerName: '',
  instructor: '전체', room: '전체',
  status: '전체', paymentStatus: '전체', program: '전체',
  noShowOnly: false, todayOnly: false, thisWeekOnly: false,
};

const statuses: (ReservationStatus | '전체')[]        = ['전체', '예약완료', '수업완료', '취소', '노쇼', '변경요청'];
const paymentStatuses: (ReservationPaymentStatus | '전체')[] = ['전체', '미결제', '결제완료', '부분결제'];

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

export default function ReservationFilters({ filters, onChange }: Props) {
  const { getLabels } = useSettings();
  const instructorLabels = ['전체', ...getLabels('instructor')];
  const roomLabels       = ['전체', ...getLabels('location')];
  const programLabels    = ['전체', ...getLabels('program')];

  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    onChange({ ...filters, [key]: val });

  const hasActive =
    filters.date || filters.customerName ||
    filters.instructor !== '전체' || filters.room !== '전체' ||
    filters.status !== '전체' || filters.paymentStatus !== '전체' ||
    filters.program !== '전체' || filters.noShowOnly || filters.todayOnly || filters.thisWeekOnly;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      {/* Row 1 */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="date"
          value={filters.date}
          onChange={(e) => set('date', e.target.value)}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="고객명 검색"
            value={filters.customerName}
            onChange={(e) => set('customerName', e.target.value)}
            className="pl-8 h-9 border-gray-200 text-sm"
          />
        </div>
        <Chip label="오늘"   active={filters.todayOnly}    onClick={() => onChange({ ...filters, todayOnly: !filters.todayOnly, thisWeekOnly: false, date: '' })} />
        <Chip label="이번 주" active={filters.thisWeekOnly} onClick={() => onChange({ ...filters, thisWeekOnly: !filters.thisWeekOnly, todayOnly: false, date: '' })} />
        <Chip label="노쇼만"  active={filters.noShowOnly}   onClick={() => set('noShowOnly', !filters.noShowOnly)} />
        {hasActive && (
          <button onClick={() => onChange(defaultFilters)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X size={13} /> 초기화
          </button>
        )}
      </div>

      {/* Row 2: 강사 (설정에서 로드) */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-400 font-medium w-12">강사</span>
        {instructorLabels.map((v) => (
          <Chip key={v} label={v} active={filters.instructor === v} onClick={() => set('instructor', v)} />
        ))}
      </div>

      {/* Row 3: 장소 (설정에서 로드) */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-400 font-medium w-12">장소</span>
        {roomLabels.map((v) => (
          <Chip key={v} label={v} active={filters.room === v} onClick={() => set('room', v)} />
        ))}
      </div>

      {/* Row 4: 예약상태 */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-400 font-medium w-12">상태</span>
        {statuses.map((v) => (
          <Chip key={v} label={v} active={filters.status === v} onClick={() => set('status', v as FilterState['status'])} />
        ))}
      </div>

      {/* Row 5: 결제상태 */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-400 font-medium w-12">결제</span>
        {paymentStatuses.map((v) => (
          <Chip key={v} label={v} active={filters.paymentStatus === v} onClick={() => set('paymentStatus', v as FilterState['paymentStatus'])} />
        ))}
      </div>

      {/* Row 6: 프로그램 (설정에서 로드) */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-400 font-medium w-12">프로그램</span>
        {programLabels.map((v) => (
          <Chip key={v} label={v} active={filters.program === v} onClick={() => set('program', v)} />
        ))}
      </div>
    </div>
  );
}

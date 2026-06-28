'use client';

import { useState } from 'react';
import { Prescription } from '@/types/prescription';
import { Pencil, EyeOff, Siren, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { getPrescriptionStatusBadge, getPrescriptionTypeBadge, scoreColor } from '@/utils/prescriptionAnalysis';

interface Props {
  prescriptions: Prescription[];          // 이미 필터링된 목록
  onSelect: (p: Prescription) => void;
  onEdit: (p: Prescription) => void;
  onDeactivate: (id: string) => void;
}

type SortKey = 'prescriptionDate' | 'customerName' | 'prescriptionType' | 'currentProblem' | 'overallScore' | 'status';

export default function PrescriptionTable({ prescriptions, onSelect, onEdit, onDeactivate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>('prescriptionDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = sortKey
    ? [...prescriptions].sort((a, b) => {
        const cmp = sortKey === 'overallScore'
          ? a.overallScore - b.overallScore
          : String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), 'ko');
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : prescriptions;

  const headers: { label: string; key?: SortKey }[] = [
    { label: '처방일', key: 'prescriptionDate' },
    { label: '고객명', key: 'customerName' },
    { label: '처방유형', key: 'prescriptionType' },
    { label: '현재 문제', key: 'currentProblem' },
    { label: '종합점수', key: 'overallScore' },
    { label: '상태', key: 'status' },
    { label: '' },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6F8] border-b border-[#E5E7EB]">
            <tr>
              {headers.map((h, i) => (
                <th key={h.label || i} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] whitespace-nowrap">
                  {h.key ? (
                    <button onClick={() => toggleSort(h.key!)} className={`inline-flex items-center gap-1 transition-colors hover:text-[#2F80A7] ${sortKey === h.key ? 'text-[#2F80A7]' : ''}`}>
                      {h.label}
                      {sortKey === h.key
                        ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                        : <ChevronsUpDown size={12} className="text-[#C0C6CF]" />}
                    </button>
                  ) : h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F6F8]">
            {sorted.length === 0 ? (
              <tr><td colSpan={headers.length} className="text-center py-12 text-[#9CA3AF]">처방 내역이 없습니다.</td></tr>
            ) : sorted.map((p) => {
              const statusBadge = getPrescriptionStatusBadge(p.status);
              const typeBadge = getPrescriptionTypeBadge(p.prescriptionType);
              return (
                <tr key={p.id} className={`hover:bg-[#F4F6F8]/60 transition-colors cursor-pointer ${p.isSOS ? 'bg-[#FDECEA]/20' : ''}`} onClick={() => onSelect(p)}>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{p.prescriptionDate}</td>
                  <td className="px-4 py-3 font-medium text-[#1F2937] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {p.customerName}
                      {p.isSOS && <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDECEA] text-[#C24132]"><Siren size={9} /> SOS</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge.className}`}>{typeBadge.label}</span>
                  </td>
                  <td className="px-4 py-3 text-[#374151] whitespace-nowrap">{p.currentProblem}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.overallScore > 0
                      ? <span className="font-bold" style={{ color: scoreColor(p.overallScore) }}>{p.overallScore}점</span>
                      : <span className="text-xs text-[#9CA3AF]">미분석</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>{statusBadge.label}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button title="수정" onClick={() => onEdit(p)} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><Pencil size={15} /></button>
                      <button title="비활성화 (삭제 아님)" onClick={() => onDeactivate(p.id)} className="p-1.5 rounded-lg hover:bg-[#FFF6D8] text-[#9CA3AF] hover:text-[#A17400] transition-colors"><EyeOff size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F4F6F8]/50">
        <p className="text-xs text-[#9CA3AF]">총 {sorted.length}건</p>
      </div>
    </div>
  );
}

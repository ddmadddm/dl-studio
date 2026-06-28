'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Siren } from 'lucide-react';
import { Prescription, PrescriptionType, PrescriptionStatus, PRESCRIPTION_TYPES, PRESCRIPTION_STATUSES } from '@/types/prescription';
import { usePrescription } from '@/context/PrescriptionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PrescriptionSummaryCards from '@/components/prescriptions/PrescriptionSummaryCards';
import PrescriptionTable from '@/components/prescriptions/PrescriptionTable';
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';
import PrescriptionDetailModal from '@/components/prescriptions/PrescriptionDetailModal';

export default function MartinPrescriptionPage() {
  const { activePrescriptions, addPrescription, updatePrescription, deactivatePrescription } = usePrescription();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PrescriptionType | '전체'>('전체');
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | '전체'>('전체');
  const [sosOnly, setSosOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Prescription | null>(null);
  const [detailTarget, setDetailTarget] = useState<Prescription | null>(null);

  const filtered = useMemo(() => {
    return activePrescriptions.filter((p) => {
      if (sosOnly && !p.isSOS) return false;
      if (typeFilter !== '전체' && p.prescriptionType !== typeFilter) return false;
      if (statusFilter !== '전체' && p.status !== statusFilter) return false;
      if (search) {
        const q = search;
        if (!p.customerName.includes(q) && !p.currentProblem.includes(q) && !p.customerPhone.includes(q)) return false;
      }
      return true;
    });
  }, [activePrescriptions, sosOnly, typeFilter, statusFilter, search]);

  function handleSave(p: Prescription) {
    if (editTarget) updatePrescription(p.id, p);
    else addPrescription(p);
    setFormOpen(false);
    setEditTarget(null);
  }

  function handleEdit(p: Prescription) {
    setDetailTarget(null);
    setEditTarget(p);
    setFormOpen(true);
  }

  function handleDeactivate(id: string) {
    if (confirm('이 처방을 비활성화하시겠습니까?\n데이터는 삭제되지 않고 숨겨집니다.')) {
      deactivatePrescription(id);
    }
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-[#202B3F] text-white' : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'}`;

  return (
    <div className="space-y-6">
      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">마틴골프처방전</h1>
          <p className="text-sm text-[#6B7280] mt-1">고객의 스윙과 몸 상태 데이터를 기반으로 맞춤형 골프 처방을 관리합니다.</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-[#2F80A7] hover:bg-[#256B8D] text-white">
          <Plus size={16} className="mr-1" /> 처방 등록
        </Button>
      </div>

      {/* ── 요약 카드 ── */}
      <PrescriptionSummaryCards prescriptions={activePrescriptions} />

      {/* ── 필터 ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <Input placeholder="고객명 · 현재 문제 · 연락처 검색" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 border-[#E5E7EB] h-9 text-sm" />
          </div>
          <button onClick={() => setSosOnly(!sosOnly)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sosOnly ? 'bg-[#C24132] text-white' : 'bg-[#FDECEA] text-[#C24132] hover:bg-[#F9D9D4]'}`}>
            <Siren size={13} /> SOS만
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-[#9CA3AF] w-16">처방유형</span>
          <button onClick={() => setTypeFilter('전체')} className={chip(typeFilter === '전체')}>전체</button>
          {PRESCRIPTION_TYPES.map((t) => <button key={t} onClick={() => setTypeFilter(t)} className={chip(typeFilter === t)}>{t}</button>)}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-[#9CA3AF] w-16">상태</span>
          <button onClick={() => setStatusFilter('전체')} className={chip(statusFilter === '전체')}>전체</button>
          {PRESCRIPTION_STATUSES.map((s) => <button key={s} onClick={() => setStatusFilter(s)} className={chip(statusFilter === s)}>{s}</button>)}
        </div>
      </div>

      {/* ── 처방 목록 ── */}
      <PrescriptionTable
        prescriptions={filtered}
        onSelect={setDetailTarget}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
      />

      {formOpen && <PrescriptionForm prescription={editTarget} onSave={handleSave} onClose={() => { setFormOpen(false); setEditTarget(null); }} />}
      {detailTarget && <PrescriptionDetailModal prescription={detailTarget} onClose={() => setDetailTarget(null)} onEdit={handleEdit} />}
    </div>
  );
}

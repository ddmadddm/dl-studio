'use client';

import { Prescription } from '@/types/prescription';
import { Sparkles, AlertCircle, Zap, Ban, Dumbbell, Package } from 'lucide-react';

interface Props { prescription: Prescription }

export default function PrescriptionFeedbackBox({ prescription: p }: Props) {
  if (p.overallScore === 0 && !p.aiSummary) {
    return (
      <p className="text-sm text-[#9CA3AF] text-center py-6">분석 결과가 없습니다.</p>
    );
  }

  const Row = ({ icon: Icon, color, label, value }: { icon: typeof Sparkles; color: string; label: string; value: string }) => (
    <div className="flex gap-3">
      <div className="shrink-0 mt-0.5"><Icon size={15} style={{ color }} /></div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#6B7280] mb-0.5">{label}</p>
        <p className="text-sm text-[#1F2937] leading-relaxed">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* AI 요약 강조 */}
      {p.aiSummary && (
        <div className="bg-[#EAF4FA] border border-[#BDD9EA] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-[#2F80A7]" />
            <span className="text-xs font-semibold text-[#1F6A8C]">AI 요약</span>
          </div>
          <p className="text-sm text-[#1F2937] leading-relaxed">{p.aiSummary}</p>
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3.5">
        <Row icon={AlertCircle} color="#C24132" label="의심 원인" value={p.aiCause} />
        <Row icon={Zap}        color="#2F8F5B" label="오늘 필드에서 바로 할 교정 포인트" value={p.fieldQuickFix} />
        <Row icon={Ban}        color="#A17400" label="오늘 하지 말아야 할 동작" value={p.doNotToday} />
        <Row icon={Dumbbell}   color="#2F80A7" label="추천 운동" value={p.recommendedExercise} />
        <Row icon={Package}    color="#7C3AED" label="추천 프로그램" value={p.recommendedProgram} />
      </div>
    </div>
  );
}

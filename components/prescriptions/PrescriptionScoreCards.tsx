'use client';

import { Prescription } from '@/types/prescription';
import { scoreColor } from '@/utils/prescriptionAnalysis';

interface Props { prescription: Prescription }

const SCORE_ITEMS: { key: keyof Prescription; label: string }[] = [
  { key: 'headStabilityScore',   label: '머리 안정성' },
  { key: 'shoulderRotationScore', label: '어깨 회전' },
  { key: 'thoracicRotationScore', label: '흉추 회전' },
  { key: 'hipRotationScore',      label: '골반 회전' },
  { key: 'weightShiftScore',      label: '체중 이동' },
  { key: 'balanceScore',          label: '밸런스' },
  { key: 'finishScore',           label: '피니시' },
];

export default function PrescriptionScoreCards({ prescription: p }: Props) {
  const analyzed = p.overallScore > 0;

  if (!analyzed) {
    return (
      <div className="bg-[#FFF6D8] border border-[#F0D875] rounded-xl p-5 text-center">
        <p className="text-sm font-medium text-[#A17400]">아직 분석되지 않은 처방입니다.</p>
        <p className="text-xs text-[#B38600] mt-1">상세에서 “AI 분석 결과 생성”을 실행하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 종합점수 */}
      <div className="bg-[#202B3F] rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#8BC6D9] mb-1">종합 점수</p>
          <p className="text-4xl font-black text-white">{p.overallScore}<span className="text-lg font-medium text-[#8BC6D9] ml-1">점</span></p>
        </div>
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${scoreColor(p.overallScore)} ${p.overallScore * 3.6}deg, #2D3748 0deg)` }}>
          <div className="w-14 h-14 rounded-full bg-[#202B3F] flex items-center justify-center">
            <span className="text-sm font-bold text-white">{p.overallScore}</span>
          </div>
        </div>
      </div>

      {/* 세부 점수 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SCORE_ITEMS.map(({ key, label }) => {
          const v = Number(p[key] ?? 0);
          return (
            <div key={key} className="bg-white border border-[#E5E7EB] rounded-xl p-3">
              <p className="text-xs text-[#9CA3AF] mb-1.5">{label}</p>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-xl font-bold" style={{ color: scoreColor(v) }}>{v}</span>
                <span className="text-xs text-[#9CA3AF]">점</span>
              </div>
              <div className="bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, backgroundColor: scoreColor(v) }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

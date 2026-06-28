'use client';

import { useState } from 'react';
import { Prescription } from '@/types/prescription';
import { X, Pencil, Sparkles, Film, Image as ImageIcon, Siren, Save } from 'lucide-react';
import { usePrescription } from '@/context/PrescriptionContext';
import { getPrescriptionStatusBadge, getPrescriptionTypeBadge } from '@/utils/prescriptionAnalysis';
import PrescriptionScoreCards from './PrescriptionScoreCards';
import PrescriptionFeedbackBox from './PrescriptionFeedbackBox';

interface Props {
  prescription: Prescription;
  onClose: () => void;
  onEdit: (p: Prescription) => void;
}

export default function PrescriptionDetailModal({ prescription, onClose, onEdit }: Props) {
  const { activePrescriptions, runAnalysis, updatePrescription } = usePrescription();
  // 변경 후 즉시 반영되도록 최신 데이터 참조
  const p = activePrescriptions.find((x) => x.id === prescription.id) ?? prescription;

  const [comment, setComment] = useState(p.coachComment);
  const statusBadge = getPrescriptionStatusBadge(p.status);
  const typeBadge = getPrescriptionTypeBadge(p.prescriptionType);
  const analyzed = p.overallScore > 0;

  function saveComment() {
    updatePrescription(p.id, {
      coachComment: comment,
      status: comment.trim() ? '코치피드백완료' : p.status,
    });
  }

  const isVideo = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1F2937]">{p.customerName}</h2>
                {p.isSOS && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#FDECEA] text-[#C24132]">
                    <Siren size={11} /> SOS
                  </span>
                )}
              </div>
              <p className="text-sm text-[#9CA3AF]">{p.prescriptionDate} · {p.customerPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge.className}`}>{typeBadge.label}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>{statusBadge.label}</span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F3F4F6]"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* 입력 요약 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Info label="업로드" value={p.uploadType} />
            <Info label="촬영 방향" value={p.swingView} />
            <Info label="현재 문제" value={p.currentProblem} />
            <Info label="컨디션" value={p.condition} />
            <Info label="통증 부위" value={p.painArea} />
          </div>

          {/* 미디어 */}
          <div>
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">업로드 미디어</p>
            {p.mediaUrls.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">업로드된 미디어가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {p.mediaUrls.map((url, i) => (
                  <div key={`${url}-${i}`} className="flex items-center gap-1.5 bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg px-3 py-2">
                    {isVideo(url) ? <Film size={14} className="text-[#2F80A7]" /> : <ImageIcon size={14} className="text-[#2F8F5B]" />}
                    <span className="text-xs text-[#374151] max-w-44 truncate">{url.replace('mock://', '')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI 분석 결과 생성 (미분석 시) */}
          {!analyzed && (
            <div className="bg-[#FFF6D8] border border-[#F0D875] rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#A17400]">아직 분석되지 않았습니다.</p>
                <p className="text-xs text-[#B38600] mt-0.5">버튼을 누르면 임시 점수·피드백이 생성됩니다.</p>
              </div>
              <button onClick={() => runAnalysis(p.id)} className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#202B3F] hover:bg-[#2D3748] text-white text-xs font-semibold">
                <Sparkles size={14} /> AI 분석 결과 생성
              </button>
            </div>
          )}

          {/* 점수 */}
          <div>
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">분석 점수</p>
            <PrescriptionScoreCards prescription={p} />
          </div>

          {/* 분석 피드백 */}
          {analyzed && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">분석 결과</p>
                <button onClick={() => runAnalysis(p.id)} className="flex items-center gap-1 text-xs text-[#2F80A7] hover:underline">
                  <Sparkles size={12} /> 재분석
                </button>
              </div>
              <PrescriptionFeedbackBox prescription={p} />
            </div>
          )}

          {/* 코치 코멘트 작성 */}
          <div>
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">코치 코멘트</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="코치 피드백을 작성하세요. 저장 시 '코치피드백완료'로 변경됩니다."
              className="w-full rounded-xl border border-[#E5E7EB] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F80A7]/30"
            />
            <button
              onClick={saveComment}
              disabled={comment === p.coachComment}
              className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2F8F5B] hover:bg-[#277A4C] text-white text-xs font-semibold disabled:opacity-40"
            >
              <Save size={14} /> 코멘트 저장
            </button>
          </div>

          <button
            onClick={() => onEdit(p)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2F80A7] hover:bg-[#256B8D] text-white text-sm font-medium transition-colors"
          >
            <Pencil size={15} /> 처방 수정
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#9CA3AF] mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#1F2937]">{value}</p>
    </div>
  );
}

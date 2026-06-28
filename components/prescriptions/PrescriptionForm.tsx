'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import {
  Prescription, PrescriptionType, PrescriptionStatus, UploadType, SwingView, CurrentProblem, Condition, PainArea,
  PRESCRIPTION_TYPES, UPLOAD_TYPES, SWING_VIEWS, CURRENT_PROBLEMS, CONDITIONS, PAIN_AREAS,
} from '@/types/prescription';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CustomerSearchSelect from '@/components/customers/CustomerSearchSelect';
import PrescriptionMediaUploader from './PrescriptionMediaUploader';
import { generateMockPrescriptionAnalysis } from '@/utils/prescriptionAnalysis';
import { genId, nowTs, today } from '@/lib/softDelete';

interface Props {
  prescription: Prescription | null;
  onSave: (p: Prescription) => void;
  onClose: () => void;
}

export default function PrescriptionForm({ prescription, onSave, onClose }: Props) {
  const [form, setForm] = useState<Prescription>(prescription ?? {
    id: genId('rx'),
    customerId: '', customerName: '', customerPhone: '',
    prescriptionDate: today(),
    prescriptionType: '일반분석', uploadType: '영상+사진', swingView: '정면',
    currentProblem: '슬라이스', condition: '보통', painArea: '없음',
    mediaUrls: [],
    overallScore: 0, headStabilityScore: 0, shoulderRotationScore: 0, thoracicRotationScore: 0,
    hipRotationScore: 0, weightShiftScore: 0, balanceScore: 0, finishScore: 0,
    aiSummary: '', aiCause: '', fieldQuickFix: '', doNotToday: '', recommendedExercise: '', recommendedProgram: '',
    coachComment: '',
    status: '분석대기', isSOS: false,
    isActive: true, createdAt: today(), updatedAt: nowTs(),
  });

  const selectedCustomer = form.customerId
    ? { id: form.customerId, name: form.customerName, phone: form.customerPhone }
    : null;

  const selectCls = 'w-full h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2F80A7]/30 appearance-none';

  const sectionTitle = (t: string) => (
    <div className="flex items-center gap-2 pt-2">
      <div className="w-1 h-4 bg-[#2F80A7] rounded-full" />
      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{t}</p>
    </div>
  );

  function runMockAnalysis() {
    const result = generateMockPrescriptionAnalysis(form);
    setForm((f) => ({ ...f, ...result, status: f.coachComment ? f.status : '코치확인대기' }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId) return alert('고객을 검색하여 선택해주세요.');
    if (!form.prescriptionDate) return alert('처방일을 선택해주세요.');
    if (form.mediaUrls.length === 0) {
      const ok = confirm('업로드된 영상/사진이 없습니다.\n그래도 등록할까요?');
      if (!ok) return;
    }
    // 상태 자동 정리: 코치 메모 있으면 피드백완료 > 분석됐으면 코치확인대기 > 아니면 분석대기
    const derivedStatus: PrescriptionStatus = form.coachComment.trim()
      ? '코치피드백완료'
      : form.overallScore > 0
        ? '코치확인대기'
        : '분석대기';
    onSave({
      ...form,
      isSOS: form.prescriptionType === '필드SOS',
      status: derivedStatus,
      updatedAt: nowTs(),
      prevSnapshot: prescription ? JSON.stringify(prescription) : undefined,
    });
  }

  const analyzed = form.overallScore > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-[#1F2937]">{prescription ? '처방 수정' : '처방 등록'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F3F4F6]"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 고객 선택 */}
          {sectionTitle('고객 선택')}
          <div className="space-y-1.5">
            <Label>고객 검색 *<span className="text-xs text-[#9CA3AF] font-normal ml-2">고객관리에서 검색하여 선택</span></Label>
            <CustomerSearchSelect
              selected={selectedCustomer}
              onSelect={(c) => setForm({ ...form, customerId: c?.id ?? '', customerName: c?.name ?? '', customerPhone: c?.phone ?? '' })}
              onAddNew={() => {}}
            />
          </div>

          {/* 처방 정보 */}
          {sectionTitle('처방 정보')}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>처방일</Label>
              <input type="date" value={form.prescriptionDate} onChange={(e) => setForm({ ...form, prescriptionDate: e.target.value })} className={selectCls} />
            </div>
            <div className="space-y-1.5">
              <Label>처방 유형</Label>
              <select value={form.prescriptionType} onChange={(e) => setForm({ ...form, prescriptionType: e.target.value as PrescriptionType })} className={selectCls}>
                {PRESCRIPTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>업로드 유형</Label>
              <select value={form.uploadType} onChange={(e) => setForm({ ...form, uploadType: e.target.value as UploadType })} className={selectCls}>
                {UPLOAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>스윙 촬영 방향</Label>
              <select value={form.swingView} onChange={(e) => setForm({ ...form, swingView: e.target.value as SwingView })} className={selectCls}>
                {SWING_VIEWS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>현재 문제</Label>
              <select value={form.currentProblem} onChange={(e) => setForm({ ...form, currentProblem: e.target.value as CurrentProblem })} className={selectCls}>
                {CURRENT_PROBLEMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>오늘 컨디션</Label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as Condition })} className={selectCls}>
                {CONDITIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>통증 부위</Label>
              <select value={form.painArea} onChange={(e) => setForm({ ...form, painArea: e.target.value as PainArea })} className={selectCls}>
                {PAIN_AREAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 미디어 업로드 */}
          {sectionTitle('영상 / 사진 업로드')}
          <PrescriptionMediaUploader mediaUrls={form.mediaUrls} onChange={(urls) => setForm({ ...form, mediaUrls: urls })} />

          {/* AI 분석 (mock) */}
          {sectionTitle('AI 분석')}
          <div className="bg-[#F4F6F8] rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#1F2937]">
                {analyzed ? `분석 완료 · 종합 ${form.overallScore}점` : '아직 분석 전입니다'}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">버튼을 누르면 임시 점수·피드백이 자동 입력됩니다 (실제 AI는 추후 연동).</p>
            </div>
            <button type="button" onClick={runMockAnalysis} className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#202B3F] hover:bg-[#2D3748] text-white text-xs font-semibold">
              <Sparkles size={14} /> AI 분석 결과 생성
            </button>
          </div>

          {/* 코치 메모 */}
          {sectionTitle('코치 메모')}
          <Textarea value={form.coachComment} onChange={(e) => setForm({ ...form, coachComment: e.target.value })} rows={3} className="border-[#E5E7EB]" placeholder="코치 피드백 / 특이사항 (선택)" />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-[#E5E7EB]">취소</Button>
            <Button type="submit" className="flex-1 bg-[#2F80A7] hover:bg-[#256B8D] text-white">
              {prescription ? '수정 완료' : '처방 등록'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

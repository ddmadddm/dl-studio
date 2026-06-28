'use client';

import { Customer, CustomerGrade, CustomerSource, ServiceType, ConcernType, PaymentStatus, GLOVE_SIZES, Gender } from '@/types/customer';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/context/SettingsContext';
import CoachSelect from '@/components/coaches/CoachSelect';
import { genId, nowTs } from '@/lib/softDelete';

interface Props {
  customer: Customer | null;
  onSave: (c: Customer) => void;
  onClose: () => void;
}

const allPaymentStatuses: PaymentStatus[] = ['미결제', '결제완료', '부분결제'];

const FOOT_SIZES = ['225', '230', '235', '240', '245', '250', '255', '260', '265', '270', '275', '280'];

export default function CustomerForm({ customer, onSave, onClose }: Props) {
  const { getLabels } = useSettings();

  const gradeLabels   = getLabels('customerGrade')   as CustomerGrade[];
  const sourceLabels  = getLabels('inflowPath')      as CustomerSource[];
  const serviceLabels = getLabels('interestService') as ServiceType[];
  const concernLabels = getLabels('painPoint')       as ConcernType[];

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<Customer>(
    customer ?? {
      id: genId('c'),
      name: '', phone: '',
      grade: gradeLabels[0] ?? '신규',
      source: sourceLabels[0] ?? '기타',
      services: [], concerns: [],
      firstVisit: todayStr, lastVisit: todayStr,
      paymentStatus: '미결제', totalPayment: 0,
      coach: '', coachId: '', coachName: '',
      handicap: '', footSize: '', gloveSize: '',
      memo: '',
      isActive: true, createdAt: todayStr, updatedAt: nowTs(),
    }
  );

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return alert('고객명을 입력해주세요.');
    if (!form.phone.trim()) return alert('연락처를 입력해주세요.');
    // 숫자 9자리 이상 (010-0000-0000 등 하이픈 허용)
    if (form.phone.replace(/\D/g, '').length < 9) return alert('연락처 형식을 확인해주세요. (예: 010-0000-0000)');
    onSave({
      ...form,
      updatedAt: nowTs(),
      prevSnapshot: customer ? JSON.stringify(customer) : undefined,
    });
  }

  const chip = (active: boolean) =>
    `px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
      active ? 'bg-[#202B3F] text-white border-[#202B3F]' : 'border-[#E5E7EB] text-[#374151] hover:border-[#2F80A7]'
    }`;

  const sectionTitle = (title: string) => (
    <div className="flex items-center gap-2 pt-2">
      <div className="w-1 h-4 bg-[#2F80A7] rounded-full" />
      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{title}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-[#1F2937]">{customer ? '고객 수정' : '고객 추가'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F3F4F6]"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* ── 기본 정보 ── */}
          {sectionTitle('기본 정보')}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>고객명 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-[#E5E7EB]" />
            </div>
            <div className="space-y-1.5">
              <Label>연락처 *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" className="border-[#E5E7EB]" />
            </div>
          </div>

          {/* 성별 */}
          <div className="space-y-1.5">
            <Label>성별</Label>
            <div className="flex gap-2">
              {(['남성', '여성', '미입력'] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`px-5 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    (form.gender ?? '미입력') === g
                      ? g === '남성' ? 'bg-[#EAF4FA] text-[#1F6A8C] border-[#BDD9EA]'
                        : g === '여성' ? 'bg-[#FCE8F0] text-[#9B3066] border-[#F0B8D0]'
                        : 'bg-[#202B3F] text-white border-[#202B3F]'
                      : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#2F80A7]'
                  }`}
                >
                  {g === '남성' ? '♂ 남성' : g === '여성' ? '♀ 여성' : '미입력'}
                </button>
              ))}
            </div>
          </div>

          {/* ── 고객 분류 ── */}
          {sectionTitle('고객 분류')}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label>고객 등급</Label>
              <div className="flex flex-wrap gap-2">
                {gradeLabels.map((g) => (
                  <button key={g} type="button" onClick={() => setForm({ ...form, grade: g })} className={chip(form.grade === g)}>{g}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>유입경로</Label>
              <div className="flex flex-wrap gap-2">
                {sourceLabels.map((s) => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, source: s })} className={chip(form.source === s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 관심 서비스 & 주요 고민 ── */}
          {sectionTitle('서비스 & 고민')}
          <div className="space-y-1.5">
            <Label>관심 서비스 (복수 선택)</Label>
            <div className="flex flex-wrap gap-2">
              {serviceLabels.map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, services: toggle(form.services, s) })} className={chip(form.services.includes(s))}>{s}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>주요 고민 (복수 선택)</Label>
            <div className="flex flex-wrap gap-2">
              {concernLabels.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, concerns: toggle(form.concerns, c) })} className={chip(form.concerns.includes(c))}>{c}</button>
              ))}
            </div>
          </div>

          {/* ── 골프 정보 ── */}
          {sectionTitle('골프 정보')}
          <div className="grid grid-cols-3 gap-4">
            {/* 핸디캡 */}
            <div className="space-y-1.5">
              <Label>핸디캡</Label>
              <Input
                value={form.handicap ?? ''}
                onChange={(e) => setForm({ ...form, handicap: e.target.value })}
                placeholder="예: 18, 보기플레이어, 초보"
                className="border-[#E5E7EB]"
              />
            </div>

            {/* 발 사이즈 */}
            <div className="space-y-1.5">
              <Label>발 사이즈 (mm)</Label>
              <div className="relative">
                <select
                  value={form.footSize ?? ''}
                  onChange={(e) => setForm({ ...form, footSize: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2F80A7]/30 appearance-none"
                >
                  <option value="">선택</option>
                  {FOOT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* 장갑 사이즈 */}
            <div className="space-y-1.5">
              <Label>장갑 사이즈</Label>
              <div className="relative">
                <select
                  value={form.gloveSize ?? ''}
                  onChange={(e) => setForm({ ...form, gloveSize: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2F80A7]/30 appearance-none"
                >
                  <option value="">선택</option>
                  {GLOVE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── 방문 & 결제 ── */}
          {sectionTitle('방문 & 결제')}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>첫 방문일</Label>
              <Input type="date" value={form.firstVisit} onChange={(e) => setForm({ ...form, firstVisit: e.target.value })} className="border-[#E5E7EB]" />
            </div>
            <div className="space-y-1.5">
              <Label>최근 방문일</Label>
              <Input type="date" value={form.lastVisit} onChange={(e) => setForm({ ...form, lastVisit: e.target.value })} className="border-[#E5E7EB]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>결제 상태</Label>
              <div className="flex gap-2">
                {allPaymentStatuses.map((p) => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, paymentStatus: p })} className={chip(form.paymentStatus === p)}>{p}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>누적 결제금액</Label>
              <Input type="number" value={form.totalPayment} onChange={(e) => setForm({ ...form, totalPayment: Number(e.target.value) })} className="border-[#E5E7EB]" />
              <p className="text-xs text-[#9CA3AF]">매출관리에서 자동 집계됩니다. 신규 등록 시 0 권장 (기존 금액이 있으면 입력)</p>
            </div>
          </div>

          {/* ── 담당 코치 ── */}
          {sectionTitle('담당 코치')}
          <div className="space-y-1.5">
            <Label>
              담당 코치
              <span className="text-xs text-[#9CA3AF] font-normal ml-2">활동중인 코치만 표시됩니다</span>
            </Label>
            <CoachSelect
              value={form.coachId ?? ''}
              onChange={(id, name) => setForm({ ...form, coachId: id, coachName: name, coach: name })}
              legacyName={form.coach}
            />
            {/* 기존 텍스트 코치명이 있고 아직 매핑 안 된 경우 안내 */}
            {form.coach && !form.coachId && (
              <p className="text-xs text-[#A17400] bg-[#FFF6D8] px-3 py-2 rounded-lg">
                기존 담당 코치: <strong>{form.coach}</strong> — 위에서 코치를 선택하면 DB와 연결됩니다.
              </p>
            )}
          </div>

          {/* ── 메모 ── */}
          {sectionTitle('메모')}
          <div className="space-y-1.5">
            <Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} rows={3} className="border-[#E5E7EB]" placeholder="특이사항, 상담 내용 등 자유롭게 입력" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-[#E5E7EB]">취소</Button>
            <Button type="submit" className="flex-1 bg-[#2F80A7] hover:bg-[#256B8D] text-white">
              {customer ? '수정 완료' : '고객 추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

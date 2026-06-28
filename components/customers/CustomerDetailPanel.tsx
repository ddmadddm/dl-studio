'use client';

import { Customer } from '@/types/customer';
import CustomerPassCard from './CustomerPassCard';
import { X, CalendarDays } from 'lucide-react';

interface Props {
  customer: Customer;
  reservationDate?: string;
  reservationTime?: string;
  program?: string;
  onClose: () => void;
}

const gradeBadge: Record<string, string> = {
  신규: 'bg-[#EAF4FA] text-[#1F6A8C]',
  체험: 'bg-[#E0F4F8] text-[#2F80A7]',
  일반: 'bg-[#E8F6EF] text-[#2F8F5B]',
  VIP: 'bg-[#202B3F] text-white',
  휴면: 'bg-[#F3F4F6] text-[#9CA3AF]',
};

const payBadge: Record<string, string> = {
  미결제: 'bg-[#FDECEA] text-[#C24132]',
  결제완료: 'bg-[#E8F6EF] text-[#2F8F5B]',
  부분결제: 'bg-[#FFF6D8] text-[#A17400]',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#9CA3AF] mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#1F2937]">{value}</p>
    </div>
  );
}

export default function CustomerDetailPanel({ customer: c, reservationDate, reservationTime, program, onClose }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] h-full flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EAF4FA] rounded-full flex items-center justify-center text-[#2F80A7] font-bold text-lg">
            {c.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-[#1F2937] text-base">{c.name}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${gradeBadge[c.grade] ?? 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                {c.grade}
              </span>
              {c.gender && c.gender !== '미입력' && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.gender === '남성' ? 'bg-[#EAF4FA] text-[#1F6A8C]' : 'bg-[#FCE8F0] text-[#9B3066]'}`}>
                  {c.gender === '남성' ? '♂ 남성' : '♀ 여성'}
                </span>
              )}
            </div>
            <p className="text-sm text-[#9CA3AF]">{c.phone}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF]">
          <X size={18} />
        </button>
      </div>

      {/* 예약 정보 배너 */}
      {(reservationDate || program) && (
        <div className="mx-5 mt-4 flex items-center gap-2.5 bg-[#EAF4FA] rounded-xl px-4 py-2.5 shrink-0">
          <CalendarDays size={14} className="text-[#2F80A7] shrink-0" />
          <p className="text-sm text-[#1F6A8C] font-medium">
            {reservationDate} {reservationTime && <span className="font-bold">{reservationTime}</span>}
            {program && <span className="ml-2 text-[#2F80A7]">· {program}</span>}
          </p>
        </div>
      )}

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* 이용권 */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">이용권</p>
          <CustomerPassCard customerId={c.id} customerName={c.name} />
        </div>

        {/* 기본 정보 */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">기본 정보</p>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="유입경로" value={c.source} />
            <InfoRow label="담당코치" value={c.coachName || c.coach || '—'} />
            <InfoRow label="첫 방문일" value={c.firstVisit} />
            <InfoRow label="최근 방문일" value={c.lastVisit} />
            <InfoRow label="결제 상태" value={c.paymentStatus} />
            <InfoRow label="누적 결제금액" value={`${c.totalPayment.toLocaleString()}원`} />
          </div>
        </div>

        {/* 골프 정보 */}
        {(c.handicap || c.footSize || c.gloveSize) && (
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">골프 정보</p>
            <div className="grid grid-cols-3 gap-2">
              {c.handicap && (
                <div className="bg-[#F4F6F8] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#9CA3AF] mb-0.5">핸디캡</p>
                  <p className="text-sm font-bold text-[#1F2937]">{c.handicap}</p>
                </div>
              )}
              {c.footSize && (
                <div className="bg-[#F4F6F8] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#9CA3AF] mb-0.5">발 사이즈</p>
                  <p className="text-sm font-bold text-[#1F2937]">{c.footSize}mm</p>
                </div>
              )}
              {c.gloveSize && (
                <div className="bg-[#F4F6F8] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#9CA3AF] mb-0.5">장갑 사이즈</p>
                  <p className="text-sm font-bold text-[#1F2937]">{c.gloveSize}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 관심 서비스 */}
        {c.services.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">관심 서비스</p>
            <div className="flex flex-wrap gap-1.5">
              {c.services.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-[#EAF4FA] text-[#1F6A8C] rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* 주요 고민 */}
        {c.concerns.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">주요 고민</p>
            <div className="flex flex-wrap gap-1.5">
              {c.concerns.map((con) => (
                <span key={con} className="px-2.5 py-1 bg-[#202B3F] text-white rounded-full text-xs font-medium">{con}</span>
              ))}
            </div>
          </div>
        )}

        {/* 결제 상태 뱃지 */}
        <div className="flex items-center gap-2 pt-1">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${payBadge[c.paymentStatus] ?? 'bg-[#F3F4F6] text-[#6B7280]'}`}>
            {c.paymentStatus}
          </span>
        </div>

        {/* 메모 */}
        {c.memo && (
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">메모</p>
            <p className="text-sm text-[#374151] bg-[#F4F6F8] rounded-xl px-4 py-3 leading-relaxed">{c.memo}</p>
          </div>
        )}
      </div>
    </div>
  );
}

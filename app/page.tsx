'use client';

import { useState } from 'react';
import { mockReservations } from '@/data/mockReservations';
import { usePass } from '@/context/PassContext';
import { useCustomer } from '@/context/CustomerContext';
import { useSales, sumRevenue, sumOutstanding } from '@/context/SalesContext';
import { useTransaction } from '@/context/TransactionContext';
import { usePrescription } from '@/context/PrescriptionContext';
import { getPrescriptionStatusBadge, scoreColor } from '@/utils/prescriptionAnalysis';
import { Reservation } from '@/types/reservation';
import StatCard from '@/components/dashboard/StatCard';
import RecentCustomers from '@/components/dashboard/RecentCustomers';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import ReservationSummary from '@/components/dashboard/ReservationSummary';
import TodayReservations from '@/components/dashboard/TodayReservations';
import WeeklyReservationCalendar from '@/components/reservations/WeeklyReservationCalendar';
import CustomerDetailPanel from '@/components/customers/CustomerDetailPanel';
import {
  DollarSign, TrendingDown, TrendingUp, Users, Star, UserPlus, AlertCircle, BarChart2, Ticket, AlertTriangle,
  Wallet, CheckCircle, CalendarPlus, Link2, Banknote, Stethoscope, UserCheck, Siren,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { passes } = usePass();
  const { activeCustomers } = useCustomer();
  const { activeSales } = useSales();
  const { activeTransactions } = useTransaction();
  const { activePrescriptions } = usePrescription();

  // 캘린더에서 선택된 예약
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthlyTx = activeTransactions.filter((t) => t.date.startsWith(thisMonth));
  const income  = monthlyTx.filter((t) => t.type === '입금').reduce((s, t) => s + t.amount, 0);
  const expense = monthlyTx.filter((t) => t.type === '출금').reduce((s, t) => s + t.amount, 0);
  const profit  = income - expense;

  // ── 매출 현황 ──
  const todayStr = now.toISOString().split('T')[0];
  const salesThisMonth   = sumRevenue(activeSales.filter((s) => s.saleDate.startsWith(thisMonth)));
  const salesOutstanding = sumOutstanding(activeSales);
  const salesTodayCount  = activeSales.filter((s) => s.createdAt?.startsWith(todayStr)).length;
  const salesPaidTotal   = activeSales.filter((s) => s.paymentStatus === '결제완료').reduce((sum, s) => sum + s.amount, 0);

  // ── 매출 연결 현황 ──
  const salesTotalCount  = activeSales.length;
  const linkedIncome     = activeSales.filter((s) => s.transactionId).length;   // 입출금 입금 연결
  const linkedPass       = activeSales.filter((s) => s.passId).length;          // 이용권 연결
  const linkedAny        = activeSales.filter((s) => s.transactionId || s.passId).length;
  const unlinkedSales    = salesTotalCount - linkedAny;
  const linkRate         = salesTotalCount ? Math.round((linkedAny / salesTotalCount) * 100) : 0;

  // ── 마틴골프처방전 ──
  const rxThisMonth   = activePrescriptions.filter((p) => p.prescriptionDate.startsWith(thisMonth)).length;
  const rxWaitCoach   = activePrescriptions.filter((p) => p.status === '코치확인대기').length;
  const recentSOS     = [...activePrescriptions].filter((p) => p.isSOS).sort((a, b) => b.prescriptionDate.localeCompare(a.prescriptionDate))[0] ?? null;
  const recentRx      = [...activePrescriptions].sort((a, b) => b.prescriptionDate.localeCompare(a.prescriptionDate))[0] ?? null;

  const newCount   = activeCustomers.filter((c) => c.firstVisit.startsWith(thisMonth)).length;
  const trialCount = activeCustomers.filter((c) => c.grade === '체험').length;
  const vipCount   = activeCustomers.filter((c) => c.grade === 'VIP').length;

  const sourceMap: Record<string, number> = {};
  activeCustomers.forEach((c) => { sourceMap[c.source] = (sourceMap[c.source] ?? 0) + 1; });
  const sortedSources = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]);
  const maxSource = sortedSources[0]?.[1] ?? 1;

  const lowPasses      = passes.filter((p) => p.remainCount <= 3 && p.remainCount > 0 && p.status !== '사용완료' && p.status !== '중지');
  const expiringPasses = passes.filter((p) => p.status === '만료예정');

  // 선택된 예약의 고객 찾기
  const selectedCustomer = selectedReservation
    ? activeCustomers.find((c) => c.id === selectedReservation.customerId) ?? null
    : null;

  return (
    <div className="space-y-6">

      {/* ── 예약 요약 ── */}
      <ReservationSummary reservations={mockReservations} />

      {/* ── 주간 캘린더(좌) + 고객 상세 패널(우) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
        {/* 캘린더: 예약 클릭 시 오른쪽 패널에 표시 */}
        <WeeklyReservationCalendar
          reservations={mockReservations}
          compact={true}
          onReservationSelect={setSelectedReservation}
        />

        {/* 우측 패널: 예약 선택 시 고객 상세, 미선택 시 오늘 예약 리스트 */}
        <div className="sticky top-4">
          {selectedCustomer ? (
            <CustomerDetailPanel
              customer={selectedCustomer}
              reservationDate={selectedReservation?.date}
              reservationTime={selectedReservation?.time}
              program={selectedReservation?.program}
              onClose={() => setSelectedReservation(null)}
            />
          ) : (
            <TodayReservations
              reservations={mockReservations}
              onReservationClick={setSelectedReservation}
            />
          )}
        </div>
      </div>

      {/* ── 매출 KPI ── */}
      <div>
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">이번 달 매출</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="이번 달 매출"   value={`${income.toLocaleString()}원`}   icon={DollarSign}   color="blue"   />
          <StatCard title="이번 달 지출"   value={`${expense.toLocaleString()}원`}  icon={TrendingDown} color="red"    />
          <StatCard title="이번 달 순이익" value={`${profit.toLocaleString()}원`}   icon={TrendingUp}   color="navy"   />
          <StatCard title="미수금"         value="200,000원" sub="미결제+부분결제"   icon={AlertCircle}  color="yellow" />
        </div>
      </div>

      {/* ── 매출 현황 ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">매출 현황</p>
          <Link href="/sales" className="text-xs text-[#2F80A7] hover:underline">매출관리로 이동</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="이번 달 매출"   value={`${salesThisMonth.toLocaleString()}원`}   sub="환불 제외"      icon={Wallet}      color="blue"  />
          <StatCard title="누적 미수금"    value={`${salesOutstanding.toLocaleString()}원`} sub="미수금 합계"    icon={AlertCircle} color="red"   />
          <StatCard title="오늘 등록 매출" value={`${salesTodayCount}건`}                    sub="오늘 등록된 건" icon={CalendarPlus} color="teal"  />
          <StatCard title="결제완료 매출"  value={`${salesPaidTotal.toLocaleString()}원`}    sub="결제완료 합계"  icon={CheckCircle} color="green" />
        </div>
      </div>

      {/* ── 매출 연결 현황 ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">매출 연결 현황</p>
          <span className="text-xs text-[#9CA3AF]">전체 매출 {salesTotalCount}건</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="입금 연결"   value={`${linkedIncome}건`}  sub="입출금 자동 등록"          icon={Banknote} color="green" />
          <StatCard title="이용권 연결" value={`${linkedPass}건`}    sub="이용권 자동 생성"          icon={Ticket}   color="teal"  />
          <Link href="/sales?filter=unlinked" className="block rounded-xl transition-transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A17400]/40">
            <StatCard title="미연결 매출" value={`${unlinkedSales}건`} sub="입금·이용권 연동 없음 · 클릭하여 관리" icon={AlertCircle} color="yellow" />
          </Link>
          <StatCard title="연결률"      value={`${linkRate}%`}       sub={`전체 ${salesTotalCount}건 중 ${linkedAny}건`} icon={Link2} color="navy" />
        </div>
      </div>

      {/* ── 마틴골프처방전 ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">마틴골프처방전</p>
          <Link href="/martin-prescription" className="text-xs text-[#2F80A7] hover:underline">처방전 관리로 이동</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="이번 달 처방"  value={`${rxThisMonth}건`} sub={`${thisMonth} 기준`} icon={Stethoscope} color="teal" />
          <StatCard title="코치 확인 대기" value={`${rxWaitCoach}건`} sub="피드백 필요"        icon={UserCheck}   color="yellow" />

          {/* 최근 SOS 요청 */}
          <Link href="/martin-prescription" className="block rounded-xl border p-5 bg-[#FDECEA] border-[#F5B8B0] hover:-translate-y-0.5 hover:shadow-md transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <Siren size={15} className="text-[#C24132]" />
              <p className="text-xs font-medium text-[#C24132]">최근 SOS 요청</p>
            </div>
            {recentSOS ? (
              <>
                <p className="text-lg font-bold text-[#C24132]">{recentSOS.customerName}</p>
                <p className="text-xs text-[#C24132]/70 mt-0.5">{recentSOS.prescriptionDate} · {recentSOS.currentProblem}</p>
              </>
            ) : <p className="text-sm text-[#C24132]/60">SOS 요청 없음</p>}
          </Link>

          {/* 최근 처방 고객 */}
          <Link href="/martin-prescription" className="block rounded-xl border p-5 bg-[#E0F4F8] border-[#B0DEEA] hover:-translate-y-0.5 hover:shadow-md transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope size={15} className="text-[#1F6A8C]" />
              <p className="text-xs font-medium text-[#2F80A7]">최근 처방 고객</p>
            </div>
            {recentRx ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-[#1F6A8C]">{recentRx.customerName}</p>
                  {recentRx.overallScore > 0 && <span className="text-sm font-bold" style={{ color: scoreColor(recentRx.overallScore) }}>{recentRx.overallScore}점</span>}
                </div>
                <p className="text-xs text-[#2F80A7]/80 mt-0.5">{recentRx.prescriptionDate} · {getPrescriptionStatusBadge(recentRx.status).label}</p>
              </>
            ) : <p className="text-sm text-[#2F80A7]/60">처방 내역 없음</p>}
          </Link>
        </div>
      </div>

      {/* ── 고객 통계 ── */}
      <div>
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">고객 현황</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="신규 고객" value={`${newCount}명`}            sub="이번 달 등록"  icon={UserPlus} color="blue"  />
          <StatCard title="체험 고객" value={`${trialCount}명`}          sub="현재 체험 중"  icon={Users}    color="teal"  />
          <StatCard title="VIP 고객"  value={`${vipCount}명`}            sub="VIP 등급"     icon={Star}     color="navy"  />
          <StatCard title="전체 고객" value={`${activeCustomers.length}명`}                 icon={Users}    color="green" />
        </div>
      </div>

      {/* ── 이용권 알림 ── */}
      {(lowPasses.length > 0 || expiringPasses.length > 0) && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Ticket size={15} className="text-[#2F80A7]" />
              <h3 className="font-semibold text-[#1F2937] text-sm">이용권 알림</h3>
            </div>
            <Link href="/passes" className="text-xs text-[#2F80A7] hover:underline">전체보기</Link>
          </div>
          {lowPasses.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-[#FFF6D8] rounded-lg px-4 py-2.5">
              <AlertTriangle size={13} className="text-[#A17400] shrink-0" />
              <p className="text-sm text-[#A17400] flex-1"><span className="font-semibold">{p.customerName}</span> · {p.passName}</p>
              <span className="text-sm font-bold text-[#A17400]">잔여 {p.remainCount}회</span>
            </div>
          ))}
          {expiringPasses.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-[#FDECEA] rounded-lg px-4 py-2.5">
              <Ticket size={13} className="text-[#C24132] shrink-0" />
              <p className="text-sm text-[#C24132] flex-1"><span className="font-semibold">{p.customerName}</span> · {p.passName}</p>
              <span className="text-sm font-bold text-[#C24132]">만료 {p.expiryDate}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── 최근 고객 + 입출금 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentCustomers customers={activeCustomers} />
        <RecentTransactions transactions={activeTransactions} />
      </div>

      {/* ── 유입경로 차트 ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={16} className="text-[#2F80A7]" />
          <h3 className="font-semibold text-[#1F2937] text-sm">유입경로별 고객 수</h3>
        </div>
        <div className="space-y-3">
          {sortedSources.map(([source, count], i) => {
            const colors = ['#2F80A7','#7AC29A','#8BC6D9','#E9C46A','#E76F51','#6B7280','#A78BFA'];
            const color = colors[i % colors.length];
            return (
              <div key={source} className="flex items-center gap-4">
                <span className="text-sm text-[#6B7280] w-20 shrink-0">{source}</span>
                <div className="flex-1 bg-[#F3F4F6] rounded-full h-5 overflow-hidden">
                  <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500" style={{ width: `${(count / maxSource) * 100}%`, backgroundColor: color }}>
                    <span className="text-xs font-bold text-white">{count}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#1F2937] w-8 text-right">{count}명</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

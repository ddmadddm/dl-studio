'use client';

import { Sale } from '@/types/sale';
import { sumRevenue, sumOutstanding } from '@/context/SalesContext';
import StatCard from '@/components/dashboard/StatCard';
import { Wallet, CalendarDays, AlertCircle, Filter } from 'lucide-react';

interface Props {
  /** 활성 매출 전체 (요약 카드 1~3 계산용) */
  activeSales: Sale[];
  /** 현재 필터로 걸러진 매출 (카드 4 계산용) */
  filtered: Sale[];
}

export default function SalesSummaryCards({ activeSales, filtered }: Props) {
  const now = new Date();
  const year = String(now.getFullYear());
  const thisMonth = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const yearSales  = activeSales.filter((s) => s.saleDate.startsWith(`${year}-`));
  const monthSales = activeSales.filter((s) => s.saleDate.startsWith(thisMonth));

  const yearRevenue   = sumRevenue(yearSales);
  const monthRevenue  = sumRevenue(monthSales);
  const outstanding   = sumOutstanding(activeSales);
  const selectedTotal = sumRevenue(filtered);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={`${year}년 누적 매출`}
        value={`${yearRevenue.toLocaleString()}원`}
        sub={`${year}년 전체 매출 (환불 제외)`}
        icon={Wallet}
        color="blue"
      />
      <StatCard
        title="이번 달 매출"
        value={`${monthRevenue.toLocaleString()}원`}
        sub={`${thisMonth} 기준`}
        icon={CalendarDays}
        color="green"
      />
      <StatCard
        title="누적 미수금"
        value={`${outstanding.toLocaleString()}원`}
        sub="결제상태 미수금 합계"
        icon={AlertCircle}
        color="red"
      />
      <StatCard
        title="현재 선택 합계"
        value={`${selectedTotal.toLocaleString()}원`}
        sub={`현재 필터 기준 ${filtered.length}건`}
        icon={Filter}
        color="navy"
      />
    </div>
  );
}

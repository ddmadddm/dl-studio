'use client';

import { useState, useEffect } from 'react';
import { Sale } from '@/types/sale';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts';

interface Props {
  /** 활성 매출 전체 */
  activeSales: Sale[];
  /** 차트 기준 연도 (예: '2026') */
  year: string;
}

/** 금액 → 만원 단위 라벨 (예: 11950000 → "1,195만") */
function toManLabel(v: number): string {
  if (!v) return '';
  return `${Math.round(v / 10000).toLocaleString()}만`;
}

export default function SalesChart({ activeSales, year }: Props) {
  // ResponsiveContainer는 컨테이너 크기 측정이 필요하므로 마운트 후에만 렌더링
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // 1~12월 매출 합계 (환불 제외, 날짜미정 제외)
  const data = Array.from({ length: 12 }, (_, i) => {
    const mm = String(i + 1).padStart(2, '0');
    const total = activeSales
      .filter((s) => !s.isDateUnknown && s.paymentStatus !== '환불' && s.saleDate.startsWith(`${year}-${mm}`))
      .reduce((acc, s) => acc + s.amount, 0);
    return { month: `${i + 1}월`, total };
  });

  const hasData = data.some((d) => d.total > 0);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-[#1F2937] text-sm">{year}년 월별 매출 현황</h3>
        <p className="text-xs text-[#9CA3AF] mt-1">
          월별 추이를 빠르게 확인한 뒤 아래 목록에서 상세 건을 살펴볼 수 있습니다.
        </p>
      </div>

      {!mounted ? (
        <div className="h-72" />
      ) : hasData ? (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
              <YAxis
                tickFormatter={(v: number) => (v >= 10000 ? `${Math.round(v / 10000).toLocaleString()}만` : `${v}`)}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()}원`, '매출']}
                labelStyle={{ color: '#1F2937', fontWeight: 600 }}
                contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                cursor={{ fill: '#F4F6F8' }}
              />
              <Bar dataKey="total" fill="#2F80A7" radius={[6, 6, 0, 0]} maxBarSize={44}>
                <LabelList dataKey="total" position="top" formatter={toManLabel} style={{ fontSize: 10, fill: '#6B7280' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 flex items-center justify-center text-sm text-[#9CA3AF]">
          {year}년 매출 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Sale } from '@/types/sale';
import { useSales } from '@/context/SalesContext';
import { Button } from '@/components/ui/button';
import SalesSummaryCards from '@/components/sales/SalesSummaryCards';
import SalesChart from '@/components/sales/SalesChart';
import SalesFilters, { SalesFilterState, makeDefaultFilters } from '@/components/sales/SalesFilters';
import SalesTable from '@/components/sales/SalesTable';
import SaleForm from '@/components/sales/SaleForm';
import SaleDetailModal from '@/components/sales/SaleDetailModal';

export default function SalesPage() {
  // useSearchParams는 Suspense 경계 안에서 사용 (Next 권장)
  return (
    <Suspense fallback={null}>
      <SalesPageInner />
    </Suspense>
  );
}

function SalesPageInner() {
  const { activeSales, addSale, updateSale, deactivateSale } = useSales();
  const searchParams = useSearchParams();

  // 대시보드 "미연결 매출" 카드에서 ?filter=unlinked 로 진입 시 자동 필터 적용
  const [filters, setFilters] = useState<SalesFilterState>(() => ({
    ...makeDefaultFilters(),
    unlinkedOnly: searchParams.get('filter') === 'unlinked',
  }));
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Sale | null>(null);
  const [detailTarget, setDetailTarget] = useState<Sale | null>(null);

  // 선택 가능한 연도 (데이터 + 올해)
  const years = useMemo(() => {
    const set = new Set<string>([String(new Date().getFullYear())]);
    activeSales.forEach((s) => { if (!s.isDateUnknown && s.saleDate) set.add(s.saleDate.slice(0, 4)); });
    return Array.from(set).sort().reverse();
  }, [activeSales]);

  // 차트 기준 연도: 연도 필터가 '전체'면 올해
  const chartYear = filters.year === '전체' ? String(new Date().getFullYear()) : filters.year;

  // 필터 적용
  const filtered = useMemo(() => {
    return activeSales.filter((s) => {
      if (filters.dateUnknownOnly && !s.isDateUnknown) return false;
      if (filters.unlinkedOnly && (s.transactionId || s.passId)) return false;

      if (filters.search) {
        const q = filters.search;
        const hit = s.saleTitle.includes(q) || s.customerName.includes(q) || s.programName.includes(q) || s.memo.includes(q);
        if (!hit) return false;
      }
      if (filters.paymentStatus !== '전체' && s.paymentStatus !== filters.paymentStatus) return false;
      if (filters.saleType !== '전체' && s.saleType !== filters.saleType) return false;

      // 날짜 필터 (날짜미정 전용 모드가 아닐 때만 적용)
      if (!filters.dateUnknownOnly) {
        if (filters.year !== '전체') {
          if (s.isDateUnknown) return false;
          if (!s.saleDate.startsWith(filters.year)) return false;
        }
        if (filters.month !== '전체') {
          if (s.isDateUnknown) return false;
          if (s.saleDate.slice(5, 7) !== filters.month) return false;
        }
      }
      return true;
    });
  }, [activeSales, filters]);

  function handleSave(s: Sale) {
    if (editTarget) updateSale(s.id, s);
    else addSale(s);
    setFormOpen(false);
    setEditTarget(null);
  }

  function handleEdit(s: Sale) {
    setDetailTarget(null);
    setEditTarget(s);
    setFormOpen(true);
  }

  function handleDeactivate(id: string) {
    if (confirm('이 매출을 비활성화하시겠습니까?\n데이터는 삭제되지 않고 숨겨집니다.')) {
      deactivateSale(id);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">매출 관리</h1>
          <p className="text-sm text-[#6B7280] mt-1">DL STUDIO 매출과 미수금을 한눈에 관리합니다.</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="bg-[#2F80A7] hover:bg-[#256B8D] text-white">
          <Plus size={16} className="mr-1" /> 매출 등록
        </Button>
      </div>

      {/* ── 요약 카드 ── */}
      <SalesSummaryCards activeSales={activeSales} filtered={filtered} />

      {/* ── 월별 차트 ── */}
      <SalesChart activeSales={activeSales} year={chartYear} />

      {/* ── 필터 ── */}
      <SalesFilters filters={filters} years={years} onChange={setFilters} />

      {/* ── 매출 목록 ── */}
      <SalesTable
        sales={filtered}
        onSelect={setDetailTarget}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
      />

      {formOpen && <SaleForm sale={editTarget} onSave={handleSave} onClose={() => { setFormOpen(false); setEditTarget(null); }} />}
      {detailTarget && <SaleDetailModal sale={detailTarget} onClose={() => setDetailTarget(null)} onEdit={handleEdit} />}
    </div>
  );
}

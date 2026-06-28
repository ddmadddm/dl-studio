'use client';

import { usePass } from '@/context/PassContext';
import PassSummaryCards from '@/components/passes/PassSummaryCards';
import PassTable from '@/components/passes/PassTable';

export default function PassesPage() {
  const { passes } = usePass();
  return (
    <div className="space-y-6">
      <PassSummaryCards passes={passes} />
      <PassTable passes={passes} />
    </div>
  );
}

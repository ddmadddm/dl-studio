'use client';

import { Prescription } from '@/types/prescription';
import StatCard from '@/components/dashboard/StatCard';
import { ClipboardList, CalendarDays, Siren, UserCheck } from 'lucide-react';

interface Props { prescriptions: Prescription[] }   // 활성 처방 전체

export default function PrescriptionSummaryCards({ prescriptions }: Props) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const total      = prescriptions.length;
  const monthCount = prescriptions.filter((p) => p.prescriptionDate.startsWith(thisMonth)).length;
  const sosCount   = prescriptions.filter((p) => p.isSOS).length;
  const waitCoach  = prescriptions.filter((p) => p.status === '코치확인대기').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="전체 처방"      value={`${total}건`}      sub="누적 처방 건수"   icon={ClipboardList} color="blue"  />
      <StatCard title="이번 달 처방"   value={`${monthCount}건`}  sub={`${thisMonth} 기준`} icon={CalendarDays}  color="teal"  />
      <StatCard title="SOS 요청"      value={`${sosCount}건`}    sub="필드 SOS 처방"   icon={Siren}         color="red"   />
      <StatCard title="코치 확인 대기" value={`${waitCoach}건`}   sub="피드백 필요"      icon={UserCheck}     color="yellow" />
    </div>
  );
}

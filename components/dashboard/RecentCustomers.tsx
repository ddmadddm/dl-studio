import { Customer } from '@/types/customer';
import Link from 'next/link';

const gradeBadge: Record<string, string> = {
  신규: 'bg-[#EAF4FA] text-[#1F6A8C]',
  체험: 'bg-[#E0F4F8] text-[#2F80A7]',
  일반: 'bg-[#E8F6EF] text-[#2F8F5B]',
  VIP:  'bg-[#202B3F] text-white',
  휴면: 'bg-[#F3F4F6] text-[#9CA3AF]',
};

export default function RecentCustomers({ customers }: { customers: Customer[] }) {
  const recent = [...customers].sort((a, b) => b.firstVisit.localeCompare(a.firstVisit)).slice(0, 5);
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#1F2937] text-sm">최근 등록 고객</h3>
        <Link href="/customers" className="text-xs text-[#2F80A7] hover:underline font-medium">전체보기</Link>
      </div>
      <div className="space-y-2.5">
        {recent.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EAF4FA] rounded-full flex items-center justify-center text-[#2F80A7] font-bold text-sm">{c.name[0]}</div>
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{c.name}</p>
                <p className="text-xs text-[#9CA3AF]">{c.source} · {c.firstVisit}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gradeBadge[c.grade] ?? 'bg-[#F3F4F6] text-[#6B7280]'}`}>{c.grade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

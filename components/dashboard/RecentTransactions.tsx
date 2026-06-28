import { Transaction } from '@/types/transaction';
import Link from 'next/link';

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#1F2937] text-sm">최근 입출금 내역</h3>
        <Link href="/finance" className="text-xs text-[#2F80A7] hover:underline font-medium">전체보기</Link>
      </div>
      <div className="space-y-2.5">
        {recent.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${t.type === '입금' ? 'bg-[#7AC29A]' : 'bg-[#E76F51]'}`} />
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{t.counterpart}</p>
                <p className="text-xs text-[#9CA3AF]">{t.category} · {t.date}</p>
              </div>
            </div>
            <span className={`text-sm font-semibold ${t.type === '입금' ? 'text-[#2F8F5B]' : 'text-[#E76F51]'}`}>
              {t.type === '입금' ? '+' : '-'}{t.amount.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

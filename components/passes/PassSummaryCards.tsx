import { Pass } from '@/types/pass';
import { Ticket, AlertTriangle, Clock, CreditCard, TrendingUp } from 'lucide-react';

interface Props { passes: Pass[] }

export default function PassSummaryCards({ passes }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const active      = passes.filter((p) => p.status === '사용중').length;
  const expiringSoon = passes.filter((p) => p.status === '만료예정').length;
  const lowRemain   = passes.filter((p) => p.remainCount <= 3 && p.remainCount > 0 && p.status !== '사용완료' && p.status !== '중지').length;
  const unpaid      = passes.filter((p) => p.paymentStatus !== '결제완료' && p.status !== '사용완료').length;
  const monthRevenue = passes.filter((p) => p.purchaseDate.startsWith(thisMonth)).reduce((s, p) => s + p.paymentAmount, 0);

  const cards = [
    { label: '사용중 이용권',      value: `${active}건`,              icon: Ticket,        bg: 'bg-[#EBF5F0] border-[#C8E6DA]',   text: 'text-[#1F5C4D]' },
    { label: '만료 예정',          value: `${expiringSoon}건`,        icon: Clock,         bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-700' },
    { label: '잔여 3회 이하',      value: `${lowRemain}건`,           icon: AlertTriangle, bg: 'bg-orange-50 border-orange-200',   text: 'text-orange-700' },
    { label: '미결제 이용권',      value: `${unpaid}건`,              icon: CreditCard,    bg: 'bg-red-50 border-red-200',         text: 'text-red-600' },
    { label: '이번 달 이용권 매출', value: `${monthRevenue.toLocaleString()}원`, icon: TrendingUp, bg: 'bg-white border-gray-200', text: 'text-gray-900' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, icon: Icon, bg, text }) => (
        <div key={label} className={`rounded-2xl border p-4 ${bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon size={15} className={text} />
            <span className={`text-xs font-medium ${text} opacity-70`}>{label}</span>
          </div>
          <p className={`text-2xl font-bold ${text}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

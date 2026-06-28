import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'navy' | 'teal';
}

const palette = {
  blue:   { card: 'bg-[#EAF4FA] border-[#BDD9EA]', icon: 'bg-[#2F80A7]/20 text-[#2F80A7]', value: 'text-[#1F6A8C]', label: 'text-[#2F80A7]' },
  green:  { card: 'bg-[#E8F6EF] border-[#B6DECA]', icon: 'bg-[#7AC29A]/20 text-[#3D9B6A]', value: 'text-[#2F8F5B]', label: 'text-[#3D9B6A]' },
  yellow: { card: 'bg-[#FFF6D8] border-[#F0D875]', icon: 'bg-[#E9C46A]/30 text-[#A17400]', value: 'text-[#A17400]', label: 'text-[#B38600]' },
  red:    { card: 'bg-[#FDECEA] border-[#F5B8B0]', icon: 'bg-[#E76F51]/20 text-[#C24132]', value: 'text-[#C24132]', label: 'text-[#C24132]' },
  navy:   { card: 'bg-[#202B3F] border-[#2D3748]', icon: 'bg-white/10 text-[#4BA3C7]',     value: 'text-white',    label: 'text-[#8BC6D9]' },
  teal:   { card: 'bg-[#E0F4F8] border-[#B0DEEA]', icon: 'bg-[#8BC6D9]/30 text-[#1F6A8C]', value: 'text-[#1F6A8C]', label: 'text-[#2F80A7]' },
};

export default function StatCard({ title, value, sub, icon: Icon, color = 'blue' }: StatCardProps) {
  const p = palette[color];
  return (
    <div className={`rounded-xl border p-5 ${p.card}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium mb-1 ${p.label}`}>{title}</p>
          <p className={`text-2xl font-bold ${p.value}`}>{value}</p>
          {sub && <p className={`text-xs mt-1 ${p.label} opacity-70`}>{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${p.icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { Search, X, UserPlus, ChevronDown } from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';

const gradeBadge: Record<string, string> = {
  신규: 'bg-gray-100 text-gray-500',
  체험: 'bg-gray-100 text-gray-500',
  일반: 'bg-gray-100 text-gray-600',
  VIP: 'bg-gray-900 text-white',
  휴면: 'bg-gray-50 text-gray-400',
};

interface SelectedCustomer {
  id: string;
  name: string;
  phone: string;
}

interface Props {
  selected: SelectedCustomer | null;
  onSelect: (c: SelectedCustomer | null) => void;
  onAddNew: () => void;
  /** 외부에서 customers를 주입하는 경우 (선택적) — 없으면 Context에서 가져옴 */
  customers?: Customer[];
}

export default function CustomerSearchSelect({ customers: propCustomers, selected, onSelect, onAddNew }: Props) {
  const { activeCustomers } = useCustomer();
  const customers = propCustomers ?? activeCustomers;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const results = query.trim()
    ? customers.filter(
        (c) =>
          c.name.includes(query.trim()) ||
          c.phone.replace(/-/g, '').includes(query.replace(/-/g, ''))
      )
    : customers.slice(0, 8); // 검색어 없으면 최근 8명 미리보기

  function handleSelect(c: Customer) {
    onSelect({ id: c.id, name: c.name, phone: c.phone });
    setOpen(false);
    setQuery('');
  }

  function handleClear() {
    onSelect(null);
    setQuery('');
    setOpen(false);
  }

  // 선택된 상태
  if (selected) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm shrink-0">
          {selected.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
          <p className="text-xs text-gray-400">{selected.phone}</p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* 입력창 */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
          open ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-200'
        } bg-white cursor-text`}
        onClick={() => setOpen(true)}
      >
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="고객명 또는 연락처 검색..."
          className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
        />
        <ChevronDown size={15} className="text-gray-400 shrink-0" />
      </div>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          {/* 검색 결과 */}
          {results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto divide-y divide-gray-50">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${gradeBadge[c.grade]}`}>
                          {c.grade}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{c.phone}</p>
                    </div>
                    <span className="text-xs text-gray-300 shrink-0">{c.source}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400 mb-1">
                <span className="font-semibold text-gray-600">"{query}"</span> 검색 결과가 없습니다.
              </p>
              <p className="text-xs text-gray-400">고객관리에 등록되지 않은 고객입니다.</p>
            </div>
          )}

          {/* 신규 고객 등록 버튼 */}
          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              onClick={() => { setOpen(false); onAddNew(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
            >
              <UserPlus size={15} />
              신규 고객 등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

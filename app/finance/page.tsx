'use client';

import { useTransaction } from '@/context/TransactionContext';
import TransactionTable from '@/components/finance/TransactionTable';

export default function FinancePage() {
  const { transactions, setTransactions } = useTransaction();
  return <TransactionTable transactions={transactions} onChange={setTransactions} />;
}

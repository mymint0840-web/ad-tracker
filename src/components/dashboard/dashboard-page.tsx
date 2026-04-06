'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { SummaryGrid } from '@/components/dashboard/summary-grid';
import { DateFilter } from '@/components/dashboard/date-filter';
import { EntryTable } from '@/components/entries/entry-table';
import { EntryForm } from '@/components/entries/entry-form';
import { TargetModal } from '@/components/entries/target-modal';
import { ProductModal } from '@/components/entries/product-modal';
import { AccountModal } from '@/components/entries/account-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEntries, useProducts, useAccounts, useTargets } from '@/hooks/use-dashboard';
import type { Entry } from '@/types';

export function DashboardPage() {
  const { entries, summary, addEntry, updateEntry, deleteEntry } = useEntries();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { accounts, addAccount, deleteAccount } = useAccounts();
  const { targets, updateTargets } = useTargets();

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [showTargets, setShowTargets] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

  const handleEdit = (entry: Entry) => { setEditEntry(entry); setShowEntryForm(true); };
  const handleNew = () => { setEditEntry(null); setShowEntryForm(true); };

  return (
    <div className="min-h-screen bg-[#0d0e1a] p-6 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <Header onShowTargets={() => setShowTargets(true)} onShowProducts={() => setShowProducts(true)} onShowAccounts={() => setShowAccounts(true)} />
        <SummaryGrid summary={summary} targets={targets} />
        <div className="flex items-center justify-between mb-3">
          <DateFilter accounts={accounts} products={products} />
          <Button onClick={handleNew} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold gap-1.5">
            <Plus className="h-4 w-4" />
            เพิ่มข้อมูล
          </Button>
        </div>
        <EntryTable entries={entries} products={products} onEdit={handleEdit} onDelete={deleteEntry} />

        {/* Modals */}
        <EntryForm open={showEntryForm} onClose={() => { setShowEntryForm(false); setEditEntry(null); }} onSave={data => editEntry ? updateEntry(editEntry.id, data) : addEntry(data)} entry={editEntry} products={products} accounts={accounts} />
        <TargetModal open={showTargets} onClose={() => setShowTargets(false)} targets={targets} onSave={updateTargets} />
        <ProductModal open={showProducts} onClose={() => setShowProducts(false)} products={products} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} />
        <AccountModal open={showAccounts} onClose={() => setShowAccounts(false)} accounts={accounts} onAdd={addAccount} onDelete={deleteAccount} />
      </div>
    </div>
  );
}

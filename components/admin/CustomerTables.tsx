"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  deliveryZone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function CustomersTable({ customers }: { customers: Customer[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = useMemo(
    () => customers.slice(startIndex, startIndex + itemsPerPage),
    [customers, startIndex, itemsPerPage]
  );

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
    else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    return pages;
  };

  return (
    <div className="bg-white border border-shopici-black/[0.08] rounded-none overflow-hidden">
      {/* Table Console */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-shopici-black/10">
              {['Client', 'Contact', 'Zone', 'Cmd', 'Total', 'Dernière'].map((head, i) => (
                <th key={head} className={`px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-shopici-black/40 ${i > 3 ? 'text-right' : ''} ${head === 'Cmd' ? 'text-center' : ''}`}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-shopici-black/[0.05]">
            {currentCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-shopici-blue/[0.02] transition-colors group">
                {/* CLIENT */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-shopici-black flex items-center justify-center text-white font-black text-xs shrink-0">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[13px] uppercase tracking-tight text-shopici-black leading-none mb-1">
                        {customer.name}
                      </p>
                      <p className="font-mono text-[9px] text-shopici-black/30 uppercase">
                        REG_ID: {customer.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CONTACT */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-shopici-black/60">
                      <Phone size={12} className="text-shopici-blue" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-[10px] text-shopici-black/30 italic">
                        <Mail size={12} />
                        <span className="truncate max-w-[150px]">{customer.email}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* ZONE */}
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 border border-shopici-black/10 bg-slate-50">
                    <MapPin size={10} className="text-shopici-black/40" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-shopici-black/60">
                      {customer.deliveryZone}
                    </span>
                  </div>
                </td>

                {/* CMD */}
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-black text-shopici-black tabular-nums">
                    {customer.totalOrders}
                  </span>
                </td>

                {/* TOTAL */}
                <td className="px-6 py-4 text-right">
                  <p className="font-black text-[13px] text-shopici-black tabular-nums">
                    {customer.totalSpent.toLocaleString()} <span className="text-[9px] text-shopici-black/30">XAF</span>
                  </p>
                  <p className="text-[9px] font-bold text-shopici-coral uppercase tracking-tighter">
                    AVG: {Math.round(customer.totalSpent / customer.totalOrders).toLocaleString()}
                  </p>
                </td>

                {/* LAST ORDER */}
                <td className="px-6 py-4 text-right">
                  <p className="font-mono text-[10px] text-shopici-black/40">
                    {new Date(customer.lastOrderDate).toLocaleDateString('en-GB').replace(/\//g, '.')}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Console */}
      <div className="border-t border-shopici-black/10 bg-slate-50 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-shopici-black/40">Lignes:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-shopici-black/10 px-2 py-1 text-[11px] font-black focus:outline-none focus:border-shopici-blue"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <span className="font-mono text-[10px] text-shopici-black/30 uppercase tracking-tighter">
              Séquence: {startIndex + 1}—{Math.min(startIndex + itemsPerPage, customers.length)} / TOTAL {customers.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 border border-shopici-black/5 hover:bg-white disabled:opacity-20 transition-colors"><ChevronsLeft size={16}/></button>
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 border border-shopici-black/5 hover:bg-white disabled:opacity-20 transition-colors mr-2"><ChevronLeft size={16}/></button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, i) => (
                p === '...' ? <span key={i} className="px-2 text-shopici-black/20">...</span> :
                <button
                  key={i}
                  onClick={() => goToPage(p as number)}
                  className={`min-w-[32px] h-8 text-[11px] font-black transition-all ${
                    currentPage === p ? 'bg-shopici-black text-white' : 'border border-shopici-black/5 text-shopici-black/40 hover:bg-white'
                  }`}
                >
                  {String(p).padStart(2, '0')}
                </button>
              ))}
            </div>

            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border border-shopici-black/5 hover:bg-white disabled:opacity-20 transition-colors ml-2"><ChevronRight size={16}/></button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 border border-shopici-black/5 hover:bg-white disabled:opacity-20 transition-colors"><ChevronsRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
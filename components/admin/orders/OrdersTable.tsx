// components/admin/orders/OrdersTable.tsx
import { useState, useMemo } from "react";
import { Package, MessageCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ThumbsUp, ThumbsDown, Search } from "lucide-react";
import type { OrderTracking } from "@/types/OrderTracking";
import StatusBadge from "./shared/StatusBadge";

interface OrdersTableProps {
  orders: OrderTracking[];
  onSelectOrder: (order: OrderTracking) => void;
  onToggleSeriousness: (orderId: string, value: boolean | null) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function OrdersTable({ orders, onSelectOrder, onToggleSeriousness }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = useMemo(() => orders.slice(startIndex, endIndex), [orders, startIndex, endIndex]);

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <div className="bg-white border border-shopici-black/10 rounded-none overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          {/* 1. INDUSTRIAL TABLE HEADER */}
          <thead>
            <tr className="bg-shopici-black border-b border-shopici-black">
              {["ID", "Client", "Contact", "Statut", "Total", "Date", "Sérieux", "Action"].map((h) => (
                <th key={h} className={`py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 text-left ${h === 'Total' ? 'text-right' : h === 'Sérieux' || h === 'Action' ? 'text-center' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* 2. TABLE BODY */}
          <tbody className="divide-y divide-shopici-black/[0.05]">
            {currentOrders.map((order) => (
              <tr
                key={order.id}
                onClick={() => order.isSeriousCustomer !== false && onSelectOrder(order)}
                className={`group transition-colors duration-300 border-b border-shopici-black/5 hover:bg-shopici-black/[0.02] ${order.isSeriousCustomer === false ? "bg-red-50/30 opacity-60" : "cursor-pointer"
                  }`}
              >
                <td className="py-5 px-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black tracking-tighter text-shopici-black/20 uppercase">
                      Reference ID
                    </span>
                    <span className="text-[11px] font-black tracking-widest text-shopici-black font-mono">
                      {order.id}
                    </span>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-shopici-black">{order.customer.name}</p>
                    <p className="text-[10px] font-bold text-shopici-black/30 flex items-center gap-1 uppercase tracking-tighter">
                      <Package size={10} /> {order.customer.deliveryZone}
                    </p>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tabular-nums text-shopici-black/60">{order.customer.phone}</span>
                    {order.customer.hasWhatsApp && <MessageCircle className="w-3.5 h-3.5 text-green-600" />}
                  </div>
                </td>
                <td className="py-5 px-6">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-5 px-6 text-right">
                  <span className="text-xs font-black tabular-nums text-shopici-black">{order.total.toLocaleString()} XAF</span>
                </td>
                <td className="py-5 px-6 text-[10px] font-bold uppercase tracking-tighter text-shopici-black/40">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </td>

                {/* SERIOUSNESS TOGGLE: Precision Buttons */}
                <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onToggleSeriousness(order.id, order.isSeriousCustomer === true ? null : true)}
                      className={`p-2 transition-all border-2 ${order.isSeriousCustomer === true ? "bg-green-600 border-green-600 text-white" : "border-shopici-black/5 text-shopici-black/20 hover:border-green-600 hover:text-green-600"}`}
                    >
                      <ThumbsUp size={12} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => onToggleSeriousness(order.id, order.isSeriousCustomer === false ? null : false)}
                      className={`p-2 transition-all border-2 ${order.isSeriousCustomer === false ? "bg-shopici-coral border-shopici-coral text-white" : "border-shopici-black/5 text-shopici-black/20 hover:border-shopici-coral hover:text-shopici-coral"}`}
                    >
                      <ThumbsDown size={12} strokeWidth={3} />
                    </button>
                  </div>
                </td>

                {/* ACTION: Industrial Button */}
                <td className="py-5 px-6 text-center">
                  <button
                    disabled={order.isSeriousCustomer === false}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${order.isSeriousCustomer === false
                      ? "border-transparent text-shopici-black/10 cursor-not-allowed"
                      : "border-shopici-black text-shopici-black hover:bg-shopici-black hover:text-white"
                      }`}
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. SYSTEM PAGINATION: Smart Sequence Logic */}
      <div className="bg-shopici-black/[0.02] border-t border-shopici-black px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Left: Metadata */}
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-shopici-black/30 uppercase tracking-[0.2em]">Registres par bloc</p>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-transparent text-xs font-black text-shopici-black focus:outline-none cursor-pointer border-b border-shopici-black/20 appearance-none pr-4"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt} Entrées</option>
              ))}
            </select>
          </div>
          <div className="h-8 w-[1px] bg-shopici-black/10" />
          <p className="text-[10px] font-black text-shopici-black uppercase tracking-widest tabular-nums">
            Affichage <span className="text-shopici-coral">{startIndex + 1}—{Math.min(endIndex, orders.length)}</span> <span className="text-shopici-black/20">/</span> {orders.length}
          </p>
        </div>

        {/* Right: Smart Navigation Controls */}
        <div className="flex items-center gap-1">
          {/* Rapid Jump Back */}
          <PaginationButton onClick={() => goToPage(1)} disabled={currentPage === 1} icon={<ChevronsLeft size={16} strokeWidth={3} />} />
          <PaginationButton onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} icon={<ChevronLeft size={16} strokeWidth={3} />} />

          {/* Numeric Sequence */}
          <div className="flex items-center bg-white border border-shopici-black/10 p-1 mx-1">
            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                if (currentPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
                else if (currentPage >= totalPages - 2) pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                else pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
              }

              return pages.map((p, i) => (
                p === "..." ? (
                  <span key={`sep-${i}`} className="px-2 text-[10px] font-black text-shopici-black/20">...</span>
                ) : (
                  <button
                    key={`page-${p}`}
                    onClick={() => goToPage(p as number)}
                    className={`w-8 h-8 text-[11px] font-black transition-all ${currentPage === p
                        ? "bg-shopici-black text-white"
                        : "text-shopici-black/40 hover:bg-shopici-gray/10"
                      }`}
                  >
                    {String(p).padStart(2, '0')}
                  </button>
                )
              ));
            })()}
          </div>

          <PaginationButton onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} icon={<ChevronRight size={16} strokeWidth={3} />} />
          <PaginationButton onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} icon={<ChevronsRight size={16} strokeWidth={3} />} />
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean pagination buttons
function PaginationButton({ onClick, disabled, icon }: { onClick: () => void; disabled: boolean; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 border border-shopici-black/30 text-shopici-black disabled:opacity-10 disabled:border-shopici-black/20 hover:bg-shopici-black hover:text-white transition-all transition-duration-300"
    >
      {icon}
    </button>
  );
}
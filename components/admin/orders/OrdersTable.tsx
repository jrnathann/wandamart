// components/admin/orders/OrdersTable.tsx
import { useState, useMemo } from "react";
import { Package, MessageCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { OrderTracking } from "@/types/OrderTracking";
import StatusBadge from "./shared/StatusBadge";

interface OrdersTableProps {
  orders: OrderTracking[];
  onSelectOrder: (order: OrderTracking) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = useMemo(
    () => orders.slice(startIndex, endIndex),
    [orders, startIndex, endIndex]
  );

  // Reset to page 1 when filters change (orders length changes)
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [orders.length]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near start
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="bg-white dark:bg-shopici-charcoal/95 rounded-2xl shadow-lg border-2 border-shopici-charcoal/10 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gradient-to-r from-shopici-blue/10 via-shopici-coral/5 to-shopici-blue/10 border-b-2 border-shopici-charcoal/10">
            <tr>
              <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-shopici-charcoal dark:text-shopici-gray">
                ID
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-shopici-charcoal dark:text-shopici-gray">
                Client
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-shopici-charcoal dark:text-shopici-gray">
                Contact
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-shopici-charcoal dark:text-shopici-gray">
                Statut
              </th>
              <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider text-shopici-charcoal dark:text-shopici-gray">
                Total
              </th>
              <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-shopici-charcoal dark:text-shopici-gray">
                Date
              </th>
              <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider text-shopici-charcoal dark:text-shopici-gray">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-shopici-charcoal/5">
            {currentOrders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="hover:bg-gradient-to-r hover:from-shopici-blue/5 hover:to-shopici-coral/5 cursor-pointer transition-all group"
              >
                <td className="py-4 px-4">
                  <span className="text-xs font-mono font-semibold text-shopici-black dark:text-shopici-foreground">
                    {order.id}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm font-bold text-shopici-black dark:text-shopici-foreground">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-shopici-charcoal dark:text-shopici-gray flex items-center gap-1">
                      <Package size={12} className="text-shopici-blue" />
                      {order.customer.deliveryZone}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-shopici-charcoal dark:text-shopici-gray">
                      {order.customer.phone}
                    </span>
                    {order.customer.hasWhatsApp && (
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-sm font-bold text-shopici-black dark:text-shopici-foreground">
                    {order.total.toLocaleString()} XAF
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs text-shopici-charcoal dark:text-shopici-gray">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC'
                    })}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder(order);
                    }}
                    className="px-4 py-2 bg-shopici-blue/10 hover:bg-shopici-blue hover:text-white text-shopici-blue text-xs font-bold rounded-lg transition-all border border-shopici-blue/30 group-hover:scale-105"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="py-16 text-center">
          <Package size={64} className="mx-auto mb-4 text-shopici-charcoal/30" />
          <p className="text-lg font-semibold text-shopici-charcoal dark:text-shopici-gray mb-1">
            Aucune commande trouvée
          </p>
          <p className="text-sm text-shopici-charcoal/60">
            Les commandes apparaîtront ici
          </p>
        </div>
      )}

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="border-t-2 border-shopici-charcoal/10 bg-gradient-to-r from-shopici-blue/5 via-transparent to-shopici-coral/5 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-shopici-charcoal dark:text-shopici-gray">
                Lignes par page:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border-2 border-shopici-charcoal/10 rounded-lg bg-white dark:bg-shopici-charcoal/50 text-shopici-black dark:text-shopici-foreground font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-shopici-blue/30 transition-all"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="text-sm text-shopici-charcoal dark:text-shopici-gray">
                {startIndex + 1}-{Math.min(endIndex, orders.length)} sur {orders.length}
              </span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              {/* First page */}
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border-2 border-shopici-charcoal/10 hover:bg-shopici-blue/10 hover:border-shopici-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Première page"
              >
                <ChevronsLeft size={18} className="text-shopici-charcoal" />
              </button>

              {/* Previous page */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border-2 border-shopici-charcoal/10 hover:bg-shopici-blue/10 hover:border-shopici-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Page précédente"
              >
                <ChevronLeft size={18} className="text-shopici-charcoal" />
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-shopici-charcoal">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page as number)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-shopici-blue to-shopici-coral text-white shadow-md scale-105'
                          : 'border-2 border-shopici-charcoal/10 text-shopici-charcoal hover:bg-shopici-blue/10 hover:border-shopici-blue/30'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              {/* Mobile page indicator */}
              <div className="sm:hidden px-3 py-2 bg-shopici-gray/10 rounded-lg">
                <span className="text-sm font-semibold text-shopici-black dark:text-shopici-foreground">
                  {currentPage} / {totalPages}
                </span>
              </div>

              {/* Next page */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border-2 border-shopici-charcoal/10 hover:bg-shopici-blue/10 hover:border-shopici-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Page suivante"
              >
                <ChevronRight size={18} className="text-shopici-charcoal" />
              </button>

              {/* Last page */}
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border-2 border-shopici-charcoal/10 hover:bg-shopici-blue/10 hover:border-shopici-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Dernière page"
              >
                <ChevronsRight size={18} className="text-shopici-charcoal" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
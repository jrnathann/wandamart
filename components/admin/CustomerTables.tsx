// components/admin/customers/CustomersTable.tsx
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

interface CustomersTableProps {
  customers: Customer[];
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function CustomersTable({ customers }: CustomersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = useMemo(
    () => customers.slice(startIndex, endIndex),
    [customers, startIndex, endIndex]
  );

  // Reset to page 1 when filters change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [customers.length]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-2xl border border-shopici-charcoal/10 overflow-hidden">
      {/* Table */}
      <div className="relative -mx-4 sm:mx-0 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gradient-to-r from-shopici-blue/10 via-shopici-coral/5 to-shopici-blue/10 border-b-2 border-shopici-charcoal/10">
            <tr>
              <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider text-shopici-charcoal ">
                Client
              </th>
              <th className="px-3 py-2 sm:px-4 lg:px-6 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider text-shopici-charcoal ">
                Contact
              </th>
              <th className="hidden md:table-cell px-3 py-2 sm:px-4 lg:px-6 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider text-shopici-charcoal ">
                Zone
              </th>
              <th className="px-3 py-2 sm:px-4 lg:px-6 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-shopici-charcoal ">
                Cmd
              </th>
              <th className="hidden sm:table-cell px-3 py-2 sm:px-4 lg:px-6 text-right text-[10px] sm:text-xs font-bold uppercase tracking-wider text-shopici-charcoal ">
                Total
              </th>
              <th className="hidden lg:table-cell px-3 py-2 sm:px-4 lg:px-6 text-right text-[10px] sm:text-xs font-bold uppercase tracking-wider text-shopici-charcoal ">
                Dernière
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-shopici-charcoal/5">
            {currentCustomers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-gradient-to-r hover:from-shopici-blue/5 hover:to-shopici-coral/5 transition-all group"
              >
                {/* CLIENT */}
                <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-shopici-blue to-shopici-coral flex items-center justify-center text-white font-bold text-xs sm:text-sm border border-white shadow-md">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <p className="font-semibold text-sm sm:text-base text-shopici-black">
                        {customer.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-shopici-charcoal">
                        ID: {customer.id.slice(-8)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* CONTACT */}
                <td className="px-3 py-2 sm:px-4 lg:px-6">
                  <div className="space-y-0.5 sm:space-y-1 text-[11px] sm:text-sm text-shopici-charcoal">
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-shopici-blue" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="hidden sm:flex items-center gap-1.5">
                        <Mail size={12} className="text-shopici-coral" />
                        <span className="truncate max-w-[200px]">{customer.email}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* ZONE */}
                <td className="hidden md:table-cell px-3 py-2 sm:px-4 lg:px-6">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-shopici-blue/10 border border-shopici-blue/30 rounded-full">
                    <MapPin size={12} className="text-shopici-blue" />
                    <span className="text-xs font-semibold text-shopici-blue">
                      {customer.deliveryZone}
                    </span>
                  </div>
                </td>

                {/* COMMANDES */}
                <td className="px-3 py-2 sm:px-4 lg:px-6 text-center">
                  <div className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-md bg-shopici-coral/10 border border-shopici-coral/30">
                    <span className="text-xs sm:text-sm font-bold text-shopici-coral">
                      {customer.totalOrders}
                    </span>
                  </div>
                </td>

                {/* TOTAL */}
                <td className="hidden sm:table-cell px-3 py-2 sm:px-4 lg:px-6 text-right">
                  <p className="font-bold text-sm sm:text-base text-shopici-black dark:text-shopici-foreground">
                    {customer.totalSpent.toLocaleString()} XAF
                  </p>
                  <p className="text-[10px] sm:text-xs text-shopici-charcoal">
                    ~{Math.round(customer.totalSpent / customer.totalOrders).toLocaleString()} XAF/cmd
                  </p>
                </td>

                {/* LAST ORDER */}
                <td className="hidden lg:table-cell px-3 py-2 sm:px-4 lg:px-6 text-right">
                  <p className="text-xs text-shopici-charcoal ">
                    {new Date(customer.lastOrderDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC'
                    })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="text-center py-16">
          <Users size={64} className="mx-auto text-shopici-charcoal/30 mb-4" />
          <p className="text-shopici-charcoal text-lg font-semibold mb-2">
            Aucun client trouvé
          </p>
          <p className="text-sm text-shopici-charcoal/60">
            Essayez de modifier vos filtres de recherche
          </p>
        </div>
      )}

      {/* Pagination */}
      {customers.length > 0 && (
        <div className="border-t-2 border-shopici-charcoal/10 bg-gradient-to-r from-shopici-coral/5 via-transparent to-shopici-blue/5 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-shopici-charcoal  whitespace-nowrap">
                Lignes par page:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-shopici-charcoal/10 rounded-lg bg-white text-shopici-black font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-shopici-coral/30 transition-all"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="text-shopici-charcoal whitespace-nowrap">
                {startIndex + 1}-{Math.min(endIndex, customers.length)} sur {customers.length}
              </span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              {/* First page */}
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-shopici-charcoal/10 hover:bg-shopici-coral/10 hover:border-shopici-coral/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Première page"
              >
                <ChevronsLeft size={18} className="text-shopici-charcoal" />
              </button>

              {/* Previous page */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-shopici-charcoal/10 hover:bg-shopici-coral/10 hover:border-shopici-coral/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                          ? 'bg-gradient-to-r from-shopici-coral to-shopici-blue text-white shadow-md scale-105'
                          : 'border border-shopici-charcoal/10 text-shopici-charcoal hover:bg-shopici-coral/10 hover:border-shopici-coral/30'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              {/* Mobile page indicator */}
              <div className="sm:hidden px-3 py-2 bg-shopici-gray/10 rounded-lg">
                <span className="text-sm font-semibold text-shopici-black ">
                  {currentPage} / {totalPages}
                </span>
              </div>

              {/* Next page */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-shopici-charcoal/10 hover:bg-shopici-coral/10 hover:border-shopici-coral/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Page suivante"
              >
                <ChevronRight size={18} className="text-shopici-charcoal" />
              </button>

              {/* Last page */}
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-shopici-charcoal/10 hover:bg-shopici-coral/10 hover:border-shopici-coral/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
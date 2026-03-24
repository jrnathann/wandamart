"use client";

import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useConfig } from "@/context/ConfigContext";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const storeConfig = useConfig();
  const logoLoading = !storeConfig;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Vous devez être connecté pour accéder à l'admin.</p>
      </div>
    );
  }

  const user = {
    name: session.user.name || "Admin",
    email: session.user.email || "",
    avatar: session.user.image || "/default-avatar.png",
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/admin", exact: true },
    { icon: <ShoppingBag size={20} />, label: "Orders", href: "/admin/orders" },
    { icon: <Package size={20} />, label: "Products", href: "/admin/products" },
    { icon: <Users size={20} />, label: "Customers", href: "/admin/customers" },
    { icon: <Settings size={20} />, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-shopici-gray/20 via-shopici-blue/5 to-shopici-coral/5">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-72 flex-col bg-white border-r-2 border-shopici-charcoal/10 shadow-xl z-40">

        {/* Logo */}
        <div className="p-4 border-b-2 border-shopici-charcoal/10 flex items-center justify-center h-20">
          {logoLoading ? (
            <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg" />
          ) : storeConfig.logo ? (
            <div className="relative w-full h-12">
              <Image
                src={storeConfig.logo}
                alt={`${storeConfig.name} Logo`}
                fill
                className="object-contain"
                priority
                draggable={false}
                unoptimized
              />
            </div>
          ) : (
            <span className="font-bold text-xl text-shopici-black">{storeConfig.name}</span>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-b-2 border-shopici-charcoal/10 bg-gradient-to-br from-shopici-blue/5 to-shopici-coral/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-shopici-charcoal/10">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-shopici-blue/30 object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-shopici-black truncate">{user.name}</p>
              <p className="text-xs text-shopici-charcoal truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-shopici-charcoal px-3 mb-3">
            Menu
          </p>
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={
                item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/')
              }
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t-2 border-shopici-charcoal/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-shopici-coral hover:bg-shopici-coral/10 transition-all duration-200 group border-2 border-transparent hover:border-shopici-coral/20"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-shopici-charcoal/10 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="relative w-32 h-8">
            {logoLoading ? (
              <div className="w-32 h-8 bg-gray-200 animate-pulse rounded" />
            ) : storeConfig.logo ? (
              <Image
                src={storeConfig.logo}
                alt={`${storeConfig.name} Logo`}
                fill
                className="object-contain"
                priority
                unoptimized
              />
            ) : (
              <span className="font-bold text-lg text-shopici-black">{storeConfig.name}</span>
            )}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-shopici-gray/20 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed top-[73px] left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto animate-in slide-in-from-left duration-300">
            {/* Mobile User Profile */}
            <div className="p-4 border-b-2 border-shopici-charcoal/10 bg-gradient-to-br from-shopici-blue/5 to-shopici-coral/5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-shopici-blue/30"
                />
                <div>
                  <p className="font-semibold text-sm text-shopici-black">{user.name}</p>
                  <p className="text-xs text-shopici-charcoal">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.label} onClick={() => setIsMobileMenuOpen(false)}>
                  <NavItem
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={
                      item.exact
                        ? pathname === item.href
                        : pathname === item.href || pathname.startsWith(item.href + '/')
                    }
                  />
                </div>
              ))}
            </nav>

            {/* Mobile Logout */}
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-shopici-coral hover:bg-shopici-coral/10 transition-all border-2 border-transparent hover:border-shopici-coral/20"
              >
                <LogOut size={20} />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:ml-72">
        <div className="p-6 lg:p-8 md:mt-0 mt-[73px]">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  href,
  isActive
}: {
  icon: ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer
        transition-all duration-200 group relative overflow-hidden
        ${isActive
          ? 'bg-gradient-to-r from-shopici-blue/10 to-shopici-coral/10 text-shopici-blue border-2 border-shopici-blue/30 shadow-sm'
          : 'text-shopici-charcoal hover:bg-shopici-gray/10 border-2 border-transparent hover:border-shopici-charcoal/10'
        }
      `}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
          {icon}
        </div>
        <span className={`font-semibold ${isActive ? 'text-shopici-black' : ''}`}>
          {label}
        </span>
      </div>
      {isActive && <ChevronRight size={18} className="animate-pulse" />}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-shopici-blue/5 to-shopici-coral/5 animate-pulse" />
      )}
    </Link>
  );
}
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
  Settings,
  Lock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useConfig } from "@/context/ConfigContext";
import { NotifyProvider } from "@/context/NotifyContext";
import { CldImage } from "next-cloudinary";

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
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-6">

          {/* INDICATEUR VISUEL : Barre de progression technique */}
          <div className="w-48 h-[2px] bg-shopici-black/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-shopici-black animate-[loading_1.5s_ease-in-out_infinite] origin-left" />
          </div>

          {/* TEXTE DE STATUT : Zéro underscore, Typo aérée */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-shopici-black">
              Initialisation du système
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-shopici-black/20">
              Veuillez patienter
            </span>
          </div>

        </div>

        {/* STYLE CSS POUR L'ANIMATION (À mettre dans ton fichier global ou via style tag) */}
        <style jsx>{`
        @keyframes loading {
          0% { transform: scaleX(0); transform-origin: left; }
          45% { transform: scaleX(1); transform-origin: left; }
          55% { transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white p-6">

        {/* CADRE DE SÉCURITÉ : Angles droits et minimalisme */}
        <div className="w-full max-w-md border-2 border-shopici-black p-10 sm:p-16 relative">

          {/* BADGE D'ÉTAT : Positionné à cheval sur la bordure */}
          <div className="absolute -top-4 left-10 px-4 py-1 bg-shopici-black text-white text-[10px] font-black uppercase tracking-[0.3em]">
            Accès Restreint
          </div>

          <div className="space-y-8">
            {/* ICON & TITRE */}
            <div className="space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-shopici-coral/10 border border-shopici-coral/20">
                <Lock size={20} className="text-shopici-coral" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold tracking-tighter text-shopici-black leading-none">
                Authentification Requise
              </h1>
              <p className="text-[12px] font-medium uppercase tracking-wider text-shopici-black/40 leading-relaxed">
                Cette section est réservée au personnel administratif autorisé. Votre session actuelle ne permet pas l'accès.
              </p>
            </div>

            {/* ACTIONS : Bouton rectangulaire signature */}
            <div className="pt-4 flex flex-col gap-4">
              <Link
                href="/auth/signin"
                className="w-full bg-shopici-black text-white py-4 text-[11px] font-black uppercase tracking-[0.2em] text-center hover:bg-shopici-coral transition-colors duration-300"
              >
                Se Connecter au Système
              </Link>

              <Link
                href="/"
                className="w-full border border-shopici-black/10 py-4 text-[10px] font-bold uppercase tracking-widest text-shopici-black/40 text-center hover:border-shopici-black transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* FOOTER TECHNIQUE */}
          <div className="mt-12 pt-6 border-t border-shopici-black/[0.05]">
            <span className="text-[9px] font-bold uppercase tracking-widest text-shopici-black/20 tabular-nums">
              ID Erreur : 403 / AUTH REDIRECT
            </span>
          </div>

        </div>
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
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-72 flex-col bg-white border-r-1 border-shopici-charcoal/10 shadow-sm z-40">

        {/* Logo: System Brand Identifier */}
        <div className="p-6 border-b border-shopici-charcoal/20 bg-white flex flex-col items-center justify-center min-h-[100px] relative">
          {/* Corner Accents: Industrial Detail */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-shopici-charcoal/20" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-shopici-charcoal/20" />

          {logoLoading ? (
            <div className="w-full h-10 bg-shopici-gray/10 animate-pulse border border-shopici-charcoal/5 rounded-none" />
          ) : storeConfig.logo ? (
            <div className="relative w-full h-12 flex items-center justify-center">
              <Image
                src={storeConfig.logo}
                alt={`${storeConfig.name} System Logo`}
                fill
                className="object-contain grayscale-[0.5] hover:grayscale-0 transition-all duration-500"
                priority
                draggable={false}
                unoptimized
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="font-black text-lg text-shopici-black uppercase tracking-[0.25em] leading-none">
                {storeConfig.name}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-4 bg-shopici-blue" />
                <span className="text-[8px] font-mono font-bold text-shopici-charcoal/30 uppercase tracking-widest">
                  Terminal_Active
                </span>
                <div className="h-[1px] w-4 bg-shopici-blue" />
              </div>
            </div>
          )}

          {/* Technical Sub-label */}
          {!logoLoading && (
            <div className="absolute bottom-1 right-2">
              <span className="text-[7px] font-mono text-shopici-charcoal/20 uppercase tracking-tighter">
                Rev_2026.03
              </span>
            </div>
          )}
        </div>

        {/* User Profile: Operator ID Badge */}
        <div className="p-5 border-b border-shopici-charcoal/15 bg-shopici-gray/5 relative overflow-hidden">
          {/* Subtle "Grid" Background element to reinforce the technical look */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

          <div className="relative z-10 flex items-center gap-4 p-1">
            {/* Operator Avatar: Shifted to a sharp square frame */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 border border-shopici-charcoal/20 p-1 bg-white">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-300 shadow-inner"
                />
              </div>
              {/* Status indicator: Moved to a top-right 'LED' position */}
              <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-white px-1 py-0.5 border border-shopici-charcoal/10 shadow-sm">
                <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
                <span className="text-[7px] font-black uppercase text-shopici-charcoal/40">On_</span>
              </div>
            </div>

            {/* Operator Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-shopici-blue uppercase tracking-tighter bg-shopici-blue/10 px-1">Admin</span>
                <p className="font-black text-[11px] text-shopici-black uppercase tracking-tight truncate">
                  {user.name}
                </p>
              </div>

              <p className="text-[10px] font-mono text-shopici-charcoal/50 truncate mt-0.5 lowercase tracking-tighter">
                {user.email}
              </p>

              {/* Visual Data bar: Represents "System Health" or just adds to the UI texture */}
              <div className="flex gap-0.5 mt-2">
                <div className="h-1 w-4 bg-shopici-blue" />
                <div className="h-1 w-2 bg-shopici-blue/30" />
                <div className="h-1 w-full bg-shopici-charcoal/10" />
              </div>
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

        {/* Logout: Industrial System Termination */}
        <div className="p-6 border-t border-shopici-charcoal/15 bg-shopici-gray/5">
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer flex items-center justify-between px-5 py-4 
      border-2 border-shopici-coral/30 text-shopici-coral 
      hover:bg-shopici-coral hover:text-white transition-all duration-300 
      group rounded-none relative overflow-hidden"
          >
            <div className="flex items-center gap-4 z-10">
              <LogOut size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Terminer_Session</span>
            </div>

            {/* Small Technical Indicator */}
            <div className="w-1.5 h-1.5 bg-shopici-coral group-hover:bg-white transition-colors z-10" />

            {/* Subtle scanline effect on hover */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
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
                <CldImage
                  src={user.avatar}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-shopici-blue/30"
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

            {/* Mobile Logout: Handheld Interface Terminal */}
            <div className="p-4 bg-shopici-gray/5 border-t border-shopici-charcoal/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-6 py-5 
      bg-white border-2 border-shopici-coral/40 text-shopici-coral 
      active:bg-shopici-coral active:text-white transition-all duration-150 
      rounded-none shadow-sm group"
              >
                <div className="flex items-center gap-4">
                  <LogOut size={20} strokeWidth={3} className="shrink-0" />
                  <span className="text-[12px] font-black uppercase tracking-[0.2em]">
                    DÉCONNEXION_SYSTÈME
                  </span>
                </div>

                {/* Handheld Status Indicator */}
                <div className="flex gap-1">
                  <div className="w-1.5 h-3 bg-shopici-coral/30 group-active:bg-white/40" />
                  <div className="w-1.5 h-3 bg-shopici-coral group-active:bg-white" />
                </div>
              </button>

              <p className="text-center text-[8px] font-mono text-shopici-charcoal/30 mt-3 uppercase tracking-tighter">
                Session_ID: {Math.random().toString(36).substring(7).toUpperCase()} // User_Auth_End
              </p>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <NotifyProvider>
        <main className="flex-1 overflow-y-auto md:ml-72">
          <div className="p-6 lg:p-8 md:mt-0 mt-[73px]">
            {children}
          </div>
        </main>
      </NotifyProvider>
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
        flex items-center justify-between gap-3 px-6 py-4 cursor-pointer
        transition-all duration-300 group relative border-b border-shopici-black/[0.03]
        ${isActive
          ? 'bg-shopici-black/[0.02] text-shopici-black border-l-4 border-l-shopici-black'
          : 'text-shopici-black/40 hover:bg-shopici-black/[0.01] hover:text-shopici-black border-l-4 border-l-transparent'
        }
      `}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`
          ${isActive ? 'text-shopici-black' : 'text-shopici-black/30 group-hover:text-shopici-black'} 
          transition-colors duration-300
        `}>
          {icon}
        </div>
        <span className={`
          text-[11px] font-bold uppercase tracking-[0.15em]
          ${isActive ? 'text-shopici-black' : 'text-shopici-black/40 group-hover:text-shopici-black'}
        `}>
          {label}
        </span>
      </div>

      {/* Indicateur de direction discret */}
      <div className={`
        transition-all duration-300 transform
        ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-30 group-hover:translate-x-0'}
      `}>
        <ArrowRight size={14} strokeWidth={3} />
      </div>
    </Link>
  );
}
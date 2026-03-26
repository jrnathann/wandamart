"use client"

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useConfig } from "@/context/ConfigContext";
import { CldImage } from 'next-cloudinary';

export default function Navbar({ onCartClick }: { onCartClick: () => void }) {
    const [open, setOpen] = useState(false);
    const { totalItems } = useCart();
    const storeConfig = useConfig();

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [open]);

    return (
        <>
            <header className="w-full sticky top-0 z-30 backdrop-blur-md bg-[var(--shopici-background)]/80 border-b border-shopici-gray/10">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:py-8">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-2 z-50">
                        {storeConfig?.logo ? (
                            <CldImage
                                src={storeConfig.logo}
                                alt={`${storeConfig.name} Logo`}
                                width={130}
                                height={45}
                                loading="eager"
                                className="object-contain"
                            />
                        ) : (
                            <div className="w-[120px] h-[35px] bg-shopici-gray/20 animate-pulse" />
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-10 md:flex">
                        {[
                            { href: "/", label: "Accueil" },
                            { href: "/products", label: "Boutique" },
                            { href: "/contact", label: "Contact" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[11px] font-black uppercase tracking-[0.2em] text-shopici-charcoal hover:text-shopici-blue transition-colors relative group"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-shopici-coral transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Actions Area */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onCartClick}
                            aria-label="Shopping cart"
                            className="relative text-shopici-black hover:text-shopici-blue transition-all active:scale-90"
                        >
                            <ShoppingCart className="h-6 w-6 stroke-[1.5]" />
                            {totalItems > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-none bg-shopici-coral text-[9px] font-black text-white">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        <button
                            className="md:hidden z-50 relative p-2"
                            onClick={() => setOpen(!open)}
                            aria-label="Toggle menu"
                        >
                            <div className="relative w-6 h-6">
                                <Menu className={`h-6 w-6 absolute inset-0 transition-all duration-500 text-shopici-black ${open ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} />
                                <X className={`h-6 w-6 absolute inset-0 transition-all duration-500 text-shopici-black ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                            </div>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-shopici-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setOpen(false)}
            />

            {/* Mobile Menu Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[var(--shopici-background)] z-50 md:hidden transform transition-transform duration-500 cubic-bezier(0.23,1,0.32,1) ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Close Button Inside Drawer */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-8 right-6 p-2 text-shopici-black hover:text-shopici-coral transition-colors"
                >
                    <X className="h-7 w-7 stroke-[1.5]" />
                </button>

                <div className="flex flex-col h-full p-8 pt-24">
                    <nav className="flex flex-col gap-8">
                        {[
                            { href: "/", label: "Accueil" },
                            { href: "/products", label: "Boutique" },
                            { href: "/contact", label: "Contact" },
                            { href: "/shipping", label: "Suivi de colis" },
                        ].map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className="text-3xl font-black uppercase tracking-tighter text-shopici-black hover:text-shopici-blue transition-colors flex items-center justify-between group"
                            >
                                {label}
                                <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-shopici-coral" />
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-10 border-t border-shopici-gray/20">
                        <p className="text-[10px] font-bold text-shopici-gray uppercase tracking-widest mb-6">Besoin d'aide ?</p>
                        <Link
                            href="https://wa.me/yournumber"
                            className="block w-full text-center py-5 bg-shopici-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-shopici-blue transition-colors"
                        >
                            WhatsApp Support
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
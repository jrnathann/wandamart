"use client"

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useConfig } from "@/context/ConfigContext";

export default function Navbar({ onCartClick }: { onCartClick: () => void }) {
    const [open, setOpen] = useState(false);
    const { totalItems } = useCart();
    const storeConfig = useConfig(); // null until config is ready

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [open]);

    return (
        <>
            <header className="w-full sticky top-0 z-30 backdrop-blur-sm bg-white">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 md:px-6">
                    <Link href="/" className="flex items-center gap-2 z-40">
                        {storeConfig?.logo ? (
                            <Image
                                src={storeConfig.logo}
                                alt={`${storeConfig.name} Logo`}
                                width={120}
                                height={40}
                                priority
                                unoptimized
                            />
                        ) : (
                            // Skeleton — shown on server render and while config loads
                            <div className="w-[120px] h-[40px] bg-gray-200 animate-pulse rounded" />
                        )}
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        <Link href="/" className="text-sm font-medium text-[#414141] hover:text-shopici-black transition-colors">
                            Home
                        </Link>
                        <Link href="/products" className="text-sm font-medium text-[#414141] hover:text-shopici-black transition-colors">
                            Products
                        </Link>
                        <Link href="/contact" className="text-sm font-medium text-[#414141] hover:text-shopici-black transition-colors">
                            Contact
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCartClick}
                            aria-label="Shopping cart"
                            className="relative text-shopici-black hover:text-shopici-coral transition-colors"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {totalItems > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-shopici-coral text-[10px] font-semibold text-white animate-bounce">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        <button
                            className="md:hidden z-40 relative"
                            onClick={() => setOpen(!open)}
                            aria-label="Toggle menu"
                        >
                            <div className="relative w-6 h-6">
                                <Menu className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${open ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
                                <X className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${open ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
                            </div>
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setOpen(false)}
            />

            {/* Mobile Menu Drawer */}
            <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-end p-4 border-b border-gray-100">
                        <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <X className="h-6 w-6 text-shopici-charcoal" />
                        </button>
                    </div>

                    <div className="flex flex-col h-full pt-6 px-6">
                        <nav className="flex flex-col gap-2">
                            {[
                                { href: "/", label: "Home" },
                                { href: "/products", label: "Products" },
                                { href: "/contact", label: "Contact" },
                            ].map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setOpen(false)}
                                    className="group relative px-4 py-3 text-base font-medium text-shopici-charcoal hover:text-shopici-black transition-colors rounded-lg hover:bg-gray-50"
                                >
                                    <span className="relative z-10">{label}</span>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-shopici-coral rounded-r transition-all duration-300 group-hover:h-8" />
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto mb-8 pt-6 border-t border-gray-200">
                            <button className="w-full px-4 py-3 text-sm font-semibold text-white bg-shopici-coral rounded-lg hover:bg-shopici-coral/90 transition-colors shadow-lg">
                                Shop Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
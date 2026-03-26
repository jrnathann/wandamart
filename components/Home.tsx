"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCart";
import { Product } from "@/types/Product";
import HomepageSkeleton from "./HomeSkeleton";
import { useConfig } from "@/context/ConfigContext";
import { CldImage } from "next-cloudinary";

interface HomepageProps {
    onProductAdded?: (productName: string) => void;
}

export default function Homepage({ onProductAdded }: HomepageProps) {
    const storeConfig = useConfig();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    const POPULAR_PRODUCTS_LIMIT = 8;
    const bannerSlides = storeConfig?.bannerSlides ?? [];
    const configLoading = !storeConfig;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/products");
                if (!res.ok) throw new Error("Impossible de récupérer les produits");
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (bannerSlides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [bannerSlides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);

    if (productsLoading || configLoading) {
        return <HomepageSkeleton />;
    }

    return (
        <main className="min-h-screen bg-[var(--shopici-background)]">
            {/* Hero Banner Slider - Editorial Style */}
            <section className="relative w-full h-[500px] md:h-[650px] overflow-hidden bg-shopici-black">
                {bannerSlides.map((slide, index) => (
                    <div
                        key={slide.id ?? index}
                        className={`absolute inset-0 transition-all duration-[1000ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                            }`}
                    >
                        {/* Image Layer */}
                        <CldImage
                            src={slide.image}
                            alt={slide.title}
                            fill
                            sizes="100vw"
                            className="object-cover opacity-60"
                            loading={index === 0 ? "eager" : "lazy"}
                        />

                        {/* Gradient Overlay using Brand Colors */}
                        <div className="absolute inset-0 bg-gradient-to-t from-shopici-black via-transparent to-transparent opacity-90" />

                        {/* Content Layer */}
                        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
                            <div className="max-w-3xl">
                                <span className="inline-block text-shopici-coral font-black tracking-[0.3em] text-[10px] md:text-xs mb-4 uppercase animate-fade-in">
                                    Collection Exclusive
                                </span>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter uppercase">
                                    {slide.title}
                                </h1>
                                <p className="text-lg md:text-xl text-white/70 mb-10 max-w-lg font-medium leading-relaxed">
                                    {slide.subtitle}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href="/products"
                                        className="px-10 py-5 bg-shopici-blue text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-shopici-black transition-all duration-300 shadow-2xl"
                                    >
                                        {slide.cta}
                                    </Link>
                                    <Link href="/shipping" className="px-10 py-5 border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                                        Suivi Commande
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Controls */}
                <div className="absolute bottom-10 right-10 hidden md:flex items-center gap-4 z-20">
                    <button onClick={prevSlide} className="p-4 border border-white/10 text-white hover:bg-white hover:text-shopici-black transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-white font-black tracking-widest text-sm">
                        {String(currentSlide + 1).padStart(2, '0')} / {String(bannerSlides.length).padStart(2, '0')}
                    </div>
                    <button onClick={nextSlide} className="p-4 border border-white/10 text-white hover:bg-white hover:text-shopici-black transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar Indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-20">
                    <div
                        className="h-full bg-shopici-coral transition-all duration-[6000ms] ease-linear"
                        style={{ width: '100%' }}
                        key={currentSlide}
                    />
                </div>
            </section>

            {/* Popular Products Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-xl">
                        <div className="w-12 h-1 bg-shopici-coral mb-6" />
                        <h2 className="text-4xl md:text-6xl font-black text-shopici-black leading-none tracking-tighter uppercase">
                            Produits <span className="text-shopici-blue">Populaires.</span>
                        </h2>
                    </div>
                    <Link
                        href="/products"
                        className="group inline-flex items-center gap-3 text-xs font-black text-shopici-black tracking-widest uppercase pb-2 border-b-2 border-shopici-gray hover:border-shopici-blue transition-all"
                    >
                        Explorer la boutique <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Updated Grid - Added Gap and Removed fused borders for more space */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {products.slice(0, POPULAR_PRODUCTS_LIMIT).map((product) => (
                        <div key={product._id}>
                            <ProductCard
                                product={product}
                                onProductAdded={onProductAdded}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, MapPin, Clock } from "lucide-react";
import { products, getFeaturedProducts } from "@/data/products";
import ProductCard from "./ProductCart";
import { Product } from "@/types/Product";
import HomepageSkeleton from "./HomeSkeleton";

// Banner slides
const bannerSlides = [
    {
        id: 1,
        title: "Nouveautés 2026",
        subtitle: "Découvrez nos derniers produits",
        cta: "Acheter Maintenant",
        image: "/banner1.png",
        bgColor: "from-blue-500 to-purple-600",
    },
    {
        id: 2,
        title: "Offres Spéciales",
        subtitle: "Jusqu'à 30% de réduction",
        cta: "Voir les Offres",
        image: "/banner2.png",
        bgColor: "from-orange-500 to-red-600",
    },
];

// Add interface for props
interface HomepageProps {
    onProductAdded?: (productName: string) => void;
}

export default function Homepage({ onProductAdded }: HomepageProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const POPULAR_PRODUCTS_LIMIT = 8;

    // Fetch products from backend API
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
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);


    // Auto-slide effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR').format(price);
    };

    const calculateDiscount = (price: number, comparePrice?: number) => {
        if (!comparePrice) return 0;
        return Math.round(((comparePrice - price) / comparePrice) * 100);
    };
    if (loading) {
        return <HomepageSkeleton />;
    }
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Banner Slider */}
            <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                {bannerSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                            ? 'opacity-100 translate-x-0'
                            : index < currentSlide
                                ? 'opacity-0 -translate-x-full'
                                : 'opacity-0 translate-x-full'
                            }`}
                    >
                        {/* Background Image */}
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-80`}>
                            <div className="absolute inset-0 bg-black/30" />
                        </div>

                        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 flex items-center">
                            <div className="text-white max-w-2xl">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
                                    {slide.title}
                                </h1>
                                <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90">
                                    {slide.subtitle}
                                </p>
                                <Link href={"/products"} className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                                    {slide.cta}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm transition-all z-10"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm transition-all z-10"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {bannerSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8 md:w-12' : 'bg-white/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* Products Section */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                        Produits Populaires
                    </h2>
                    <Link
                        href="/products"
                        className="text-sm md:text-base font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        Voir tout →
                    </Link>
                </div>

                {/* Product Grid - Pass onProductAdded to ProductCard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.slice(0, POPULAR_PRODUCTS_LIMIT).map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onProductAdded={onProductAdded}
                        />
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-12 md:py-16 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-[#414141] text-lg mb-2">Livraison Rapide</h3>
                            <p className="text-gray-600 text-sm">Recevez vos commandes en 1-2 jours</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <Star className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-[#414141] text-lg mb-2">Qualité Garantie</h3>
                            <p className="text-gray-600 text-sm">Produits authentiques et vérifiés</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-[#414141] text-lg mb-2">Partout au Cameroun</h3>
                            <p className="text-gray-600 text-sm">Livraison dans toutes les régions</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
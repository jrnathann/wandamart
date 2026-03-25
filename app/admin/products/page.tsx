"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Search,
    Plus,
    X,
    Edit,
    Trash2,
    Eye,
    Package,
    TrendingUp,
    AlertCircle,
    Grid3x3,
    List,
    ImageIcon,
    ChevronDown,
} from "lucide-react";

// import { products } from "@/data/products";
import type { Product } from "@/types/Product";
import StatCard from "@/components/admin/orders/shared/StatCard";
import ProductCard from "@/components/admin/products/ProductCard";
import ProductListItem from "@/components/admin/products/ProductListItem";
import Link from "next/link";
import VintageHeader from "@/components/VintageHeader";
import ActionButton from "@/components/admin/orders/shared/ActionButton";

type ViewMode = "grid" | "list";
type SortOption = "name" | "price" | "stock" | "recent";

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [availabilityFilter, setAvailabilityFilter] =
        useState<"all" | "available" | "unavailable">("all");
    const [sortBy, setSortBy] = useState<SortOption>("recent");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    // Fetch products from backend
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/products");
                const data = await res.json();
                setProducts(data);

            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();

    }, []);
    /* ---------------------------------------------
     * Derived Data
     * -------------------------------------------*/
    // console.log(products)  
    const categories = useMemo(
        () => Array.from(new Set(products.map((p) => p.category))).sort(),
        [products] // <-- update whenever products change
    );

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch =
                !searchQuery ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.tags?.some(tag =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                );

            const matchesCategory =
                !categoryFilter || product.category === categoryFilter;

            const matchesAvailability =
                availabilityFilter === "all" ||
                (availabilityFilter === "available" && product.isAvailable) ||
                (availabilityFilter === "unavailable" && !product.isAvailable);

            return matchesSearch && matchesCategory && matchesAvailability;
        }).sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "price") return b.price - a.price;
            if (sortBy === "stock") return b.stock - a.stock;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
    }, [products, searchQuery, categoryFilter, availabilityFilter, sortBy]);

    const handleProductDelete = (deletedId: string) => {
        setProducts((prev) => prev.filter((p) => p._id !== deletedId));
    };
    /* ---------------------------------------------
     * Stats
     * -------------------------------------------*/

    const stats = {
        total: products.length,
        available: products.filter((p) => p.isAvailable).length,
        lowStock: products.filter((p) => p.stock < 10).length,
        featured: products.filter((p) => p.isFeatured).length,
    };

    const availabilityRate = stats.total
        ? Math.round((stats.available / stats.total) * 100)
        : 0;

    const clearFilters = () => {
        setSearchQuery("");
        setCategoryFilter("");
        setAvailabilityFilter("all");
    };
    /* ---------------------------------------------
         * Skeleton Components
         * -------------------------------------------*/
    const StatSkeleton = () => (
        <div className="h-24 rounded-xl animate-pulse bg-gray-200" />
    );

    const ProductCardSkeleton = () => (
        <div className="h-60 bg-gray-200 rounded-xl animate-pulse" />
    );

    const ProductListItemSkeleton = () => (
        <div className="h-20 bg-gray-200 rounded-xl animate-pulse mb-3" />
    );
    /* ---------------------------------------------
     * Render
     * -------------------------------------------*/

    return (
        <div className="min-h-screen">
            <div className="mx-auto space-y-6">
                {/* Header */}
                <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <VintageHeader
                            title="Catalogue Produits"
                            count={filteredProducts.length}
                            
                        />
                        <ActionButton
                            href="/admin/products/new"
                            label="Nouveau Produit"
                            icon={<Plus />}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
                    ) : (
                        <>
                            <StatCard
                                title="Total Produits"
                                value={stats.total}
                                icon={<Package size={18} className="text-white" />}
                            />
                            <StatCard
                                title="Disponibles"
                                value={stats.available}
                                icon={<Eye size={18} className="text-white" />}
                                percentage={availabilityRate}
                                trend={availabilityRate >= 50 ? "up" : "down"}
                            />
                            <StatCard
                                title="Stock Bas"
                                value={stats.lowStock}
                                icon={<AlertCircle size={18} className="text-white" />}
                            />
                            <StatCard
                                title="En Vedette"
                                value={stats.featured}
                                icon={<TrendingUp size={18} className="text-white" />}
                            />
                        </>
                    )}
                </div>

                {/* Filters */}
                <div className="">
                    <div className="bg-white border border-shopici-black/10 p-5 md:p-8 rounded-none space-y-6">
                        {loading ? (
                            <div className="space-y-4">
                                {/* Industrial Skeleton */}
                                <div className="h-12 w-full bg-slate-100 border-2 border-slate-200 animate-pulse rounded-none" />
                                <div className="h-12 w-full bg-slate-50 border-2 border-slate-100 animate-pulse rounded-none" />
                            </div>
                        ) : (
                            <>
                                {/* Search Input Group */}
                                <div className="relative group">
                                    {/* Icon stays sharp and high-contrast */}
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-shopici-black w-5 h-5 transition-transform group-focus-within:scale-110" />

                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="RECHERCHER PAR NOM, DESCRIPTION OU TAGS..."
                                        className="w-full pl-12 pr-4 py-4 border border-shopici-black/20 rounded-none 
                               text-[11px] font-black uppercase tracking-[0.1em] placeholder:text-shopici-black/20
                               focus:outline-none focus:bg-shopici-black focus:text-white focus:placeholder:text-white/30
                               transition-all duration-200 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] focus:shadow-none"
                                    />

                                    {/* Optional: Keyboard shortcut hint for that "Pro" feel */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                                        <span className="px-2 py-1 border border-shopici-black/10 text-[9px] font-mono text-shopici-black/30">
                                            ESC
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 py-4">

                            {/* LEFT SIDE: Filter Group */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Category Select */}
                                <div className="relative group">
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-shopici-black/10 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:bg-shopici-black focus:text-white transition-all cursor-pointer rounded-none"
                                    >
                                        <option value="">Catégories (Toutes)</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100">
                                        <ChevronDown size={14} strokeWidth={3} />
                                    </div>
                                </div>

                                {/* Availability Select */}
                                <div className="relative group">
                                    <select
                                        value={availabilityFilter}
                                        onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                                        className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-shopici-black/10 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:bg-shopici-black focus:text-white transition-all cursor-pointer rounded-none"
                                    >
                                        <option value="all">Statuts (Tous)</option>
                                        <option value="available">Disponibles</option>
                                        <option value="unavailable">Indisponibles</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100">
                                        <ChevronDown size={14} strokeWidth={3} />
                                    </div>
                                </div>

                                {/* Sort Select */}
                                <div className="relative group">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-shopici-black/10 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:bg-shopici-black focus:text-white transition-all cursor-pointer rounded-none"
                                    >
                                        <option value="recent">Plus récents</option>
                                        <option value="name">Nom A-Z</option>
                                        <option value="price">Prix ↓</option>
                                        <option value="stock">Stock ↓</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100">
                                        <ChevronDown size={14} strokeWidth={3} />
                                    </div>
                                </div>

                                {/* Clear Filters - Industrial style */}
                                {(searchQuery || categoryFilter || availabilityFilter !== "all") && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2.5 bg-shopici-coral text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-shopici-black transition-all rounded-none"
                                    >
                                        <X size={14} strokeWidth={3} />
                                        Réinitialiser
                                    </button>
                                )}
                            </div>

                            {/* RIGHT SIDE: View Mode Toggle */}
                            <div className="flex border border-shopici-black/10 bg-white rounded-none">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 transition-all rounded-none ${viewMode === "grid"
                                        ? "bg-shopici-black text-white"
                                        : "text-shopici-black/30 hover:text-shopici-black"
                                        }`}
                                    title="Vue Grille"
                                >
                                    <Grid3x3 size={18} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 transition-all rounded-none ${viewMode === "list"
                                        ? "bg-shopici-black text-white"
                                        : "text-shopici-black/30 hover:text-shopici-black"
                                        }`}
                                    title="Vue Liste"
                                >
                                    <List size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Products */}
                {loading ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductListItemSkeleton key={i} />
                            ))}
                        </div>
                    )
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onDelete={handleProductDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredProducts.map((product) => (
                            <ProductListItem
                                key={product._id}
                                product={product}
                                onDelete={handleProductDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

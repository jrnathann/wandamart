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
} from "lucide-react";

// import { products } from "@/data/products";
import type { Product } from "@/types/Product";
import StatCard from "@/components/admin/orders/shared/StatCard";
import ProductCard from "@/components/admin/products/ProductCard";
import ProductListItem from "@/components/admin/products/ProductListItem";
import Link from "next/link";

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
        <div className="h-24 rounded-xl animate-pulse bg-gray-200 dark:bg-gray-700" />
    );

    const ProductCardSkeleton = () => (
        <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    );

    const ProductListItemSkeleton = () => (
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-3" />
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
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-shopici-black mb-2">
                                Catalogue Produits
                            </h1>
                            <div className="h-1 w-24 bg-gradient-to-r from-shopici-blue via-shopici-coral to-transparent rounded-full" />
                            <p className="text-sm text-shopici-charcoal mt-2">
                                {filteredProducts.length} produit
                                {filteredProducts.length > 1 ? "s" : ""} • Gestion complète
                            </p>
                        </div>

                        <Link href={'/admin/products/new'} className="px-6 py-3 bg-gradient-to-r from-shopici-blue to-shopici-coral text-white text-sm font-bold rounded-xl shadow-sm hover:scale-105 transition-all flex items-center gap-2 border-2 border-white/20">
                            <Plus size={18} />
                            Nouveau Produit
                        </Link>
                    </div>

                    <div className="mt-6 h-0.5 w-full bg-gradient-to-r from-transparent via-shopici-charcoal/20 to-transparent" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loading ? (
                        [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
                    ) : (
                        <>
                            <StatCard
                                title="Total Produits"
                                value={stats.total}
                                gradient="from-shopici-charcoal via-shopici-charcoal/90 to-shopici-black"
                                icon={<Package size={18} className="text-white" />}
                            />
                            <StatCard
                                title="Disponibles"
                                value={stats.available}
                                gradient="from-green-500 via-green-600 to-emerald-700"
                                icon={<Eye size={18} className="text-white" />}
                                percentage={availabilityRate}
                                trend={availabilityRate >= 50 ? "up" : "down"}
                            />
                            <StatCard
                                title="Stock Bas"
                                value={stats.lowStock}
                                gradient="from-shopici-coral via-shopici-coral/90 to-orange-600"
                                icon={<AlertCircle size={18} className="text-white" />}
                            />
                            <StatCard
                                title="En Vedette"
                                value={stats.featured}
                                gradient="from-shopici-blue via-shopici-blue/90 to-blue-700"
                                icon={<TrendingUp size={18} className="text-white" />}
                            />
                        </>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-shopici-charcoal/95 rounded-2xl border border-shopici-charcoal/10 p-6 space-y-4">
                    <div className="bg-white dark:bg-shopici-charcoal/95 rounded-2xl border border-shopici-charcoal/10 p-6 space-y-4">
                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            </div>
                        ) : (
                            <>
                                {/* Filters Inputs */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-shopici-charcoal w-5 h-5" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher par nom, description ou tags..."
                                        className="w-full pl-11 pr-4 py-3 border border-shopici-charcoal/10 rounded-xl focus:ring-2 focus:ring-shopici-blue/20 outline-none"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 justify-between">
                        <div className="flex flex-wrap gap-3">
                            {/* Category */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2.5 border border-shopici-charcoal/20 rounded-xl bg-white dark:bg-shopici-charcoal/90 text-shopici-black dark:text-shopici-foreground hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-shopici-blue/30 transition-all"
                            >
                                <option value="">Toutes catégories</option>
                                {categories.map((cat) => (
                                    <option key={cat}>{cat}</option>
                                ))}
                            </select>

                            {/* Availability */}
                            <select
                                value={availabilityFilter}
                                onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                                className="px-4 py-2.5 border border-shopici-charcoal/20 rounded-xl bg-white dark:bg-shopici-charcoal/90 text-shopici-black dark:text-shopici-foreground hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-shopici-blue/30 transition-all"
                            >
                                <option value="all">Tous statuts</option>
                                <option value="available">Disponibles</option>
                                <option value="unavailable">Indisponibles</option>
                            </select>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="px-4 py-2.5 border border-shopici-charcoal/20 rounded-xl bg-white dark:bg-shopici-charcoal/90 text-shopici-black dark:text-shopici-foreground hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-shopici-blue/30 transition-all"
                            >
                                <option value="recent">Plus récents</option>
                                <option value="name">Nom A-Z</option>
                                <option value="price">Prix décroissant</option>
                                <option value="stock">Stock décroissant</option>
                            </select>

                            {/* Clear filters */}
                            {(searchQuery || categoryFilter || availabilityFilter !== "all") && (
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2.5 bg-shopici-coral/10 text-shopici-coral rounded-xl font-semibold flex items-center gap-2 hover:shadow-sm transition-all"
                                >
                                    <X size={16} />
                                    Effacer
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 bg-shopici-gray/10 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg ${viewMode === "grid"
                                    ? "bg-white shadow text-shopici-blue"
                                    : ""
                                    }`}
                            >
                                <Grid3x3 size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg ${viewMode === "list"
                                    ? "bg-white shadow text-shopici-blue"
                                    : ""
                                    }`}
                            >
                                <List size={18} />
                            </button>
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

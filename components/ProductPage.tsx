import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Package } from "lucide-react";
import { getAllProducts } from "@/data/products";
import ProductCard from "./ProductCart";
import { Product } from "@/types/Product";
import ProductsSkeleton from "./admin/products/ProductSkeleton";

export default function ProductsPage() {
  // const allProducts = getAllProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [allProducts, setProducts] = useState<Product[]>([]);
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
  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category));
    return Array.from(cats);
  }, [allProducts]);

  // Get price range
  const maxPrice = useMemo(() => {
    return Math.max(...allProducts.map(p => p.price));
  }, [allProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

      // Price filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      // Stock filter
      const matchesStock = !inStockOnly || product.stock > 0;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.reverse();
        break;
      default:
        // Featured - keep default order
        break;
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, priceRange, sortBy, inStockOnly]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, maxPrice]);
    setInStockOnly(false);
    setSortBy("featured");
    setSearchQuery("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (inStockOnly) count++;
    if (searchQuery) count++;
    return count;
  }, [selectedCategory, priceRange, inStockOnly, searchQuery, maxPrice]);
  if (loading) {
    return <ProductsSkeleton />;
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
{/* 1. Atelier Header: Editorial Style Alignment */}
      <div className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-6 bg-white overflow-hidden">
        {/* The "Brand Accent" - A thin, sophisticated dual-tone line */}
        <div className="absolute top-0 left-0 w-full h-1 flex">
          <div className="h-full w-1/3 bg-shopici-blue opacity-80" />
          <div className="h-full w-1/12 bg-shopici-coral opacity-80" />
          <div className="h-full flex-1 bg-shopici-gray/5" />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Small Eyebrow Label */}
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-shopici-blue">
              Conciergerie Shopici
            </span>

            {/* Main Title: Black, Sharp, and Statue-like */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-shopici-black uppercase tracking-tighter leading-[0.9]">
              Contactez <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-shopici-black to-shopici-charcoal/40">
                L'Équipe
              </span>
            </h1>
          </div>

          {/* Metadata / Description: Pushed to the right for asymmetric balance */}
          <div className="md:text-right space-y-2 border-l-2 md:border-l-0 md:border-r-2 border-shopici-coral/30 pl-6 md:pl-0 md:pr-6 py-2">
            <p className="text-lg sm:text-xl font-medium text-shopici-black tracking-tight leading-snug">
              Une assistance <span className="font-black italic text-shopici-coral">personnalisée</span>.
            </p>
            <p className="text-xs sm:text-sm font-bold text-shopici-charcoal/40 uppercase tracking-[0.1em]">
              Support Réactif • Expérience Premium • Cameroun
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Search and Filter Bar */}
        <div className="mb-10 space-y-6">
          {/* 1. Search Bar: Minimalist with focus-line animation */}
          <div className="relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-shopici-charcoal/30 group-focus-within:text-shopici-blue transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="RECHERCHER UN PRODUIT..."
              className="w-full pl-8 pr-12 py-5 text-sm font-bold tracking-widest uppercase border-b border-shopici-gray/20 focus:border-shopici-black focus:outline-none bg-transparent text-shopici-black placeholder:text-shopici-charcoal/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-shopici-gray/5 rounded-full transition-all"
              >
                <X className="w-4 h-4 text-shopici-black" />
              </button>
            )}
          </div>

          {/* 2. Controls & Metadata Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">

            <div className="flex items-center gap-3">
              {/* Filter Button: Ghost Style */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-3 px-6 py-3 border transition-all duration-300 ${showFilters
                  ? 'bg-shopici-black border-shopici-black text-white'
                  : 'bg-white border-shopici-gray/20 hover:border-shopici-black text-shopici-black'
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-shopici-blue text-[10px] font-bold text-white ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Results Count: Subtle Typographic Detail */}
              <div className="hidden sm:block pl-4 border-l border-shopici-gray/20">
                <span className="text-[10px] font-bold text-shopici-charcoal/40 uppercase tracking-[0.15em]">
                  Affichage de <span className="text-shopici-black">{filteredProducts.length}</span> résultats
                </span>
              </div>
            </div>

            {/* Sort Dropdown: Elegant Select */}
            <div className="relative min-w-[240px]">
              <label className="absolute -top-2 left-3 px-1 bg-white text-[9px] font-black text-shopici-charcoal/40 uppercase tracking-widest z-10">
                Trier par
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 border border-shopici-gray/20 focus:border-shopici-black bg-white text-shopici-black text-[11px] font-bold uppercase tracking-widest appearance-none cursor-pointer outline-none transition-colors"
                >
                  <option value="featured">En vedette</option>
                  <option value="newest">Nouveautés</option>
                  <option value="price-low">Prix: Bas → Élevé</option>
                  <option value="price-high">Prix: Élevé → Bas</option>
                  <option value="name">Nom A-Z</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-shopici-black pointer-events-none" />
              </div>
            </div>

            {/* Mobile Only: Results Count */}
            <div className="sm:hidden text-center py-2 border-t border-shopici-gray/10">
              <span className="text-[10px] font-bold text-shopici-charcoal/40 uppercase tracking-[0.15em]">
                {filteredProducts.length} produits trouvés
              </span>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white border-2 border-shopici-gray/30 rounded-2xl animate-slideDown">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-shopici-black">Filtres</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-shopici-coral hover:text-shopici-coral/80 transition-colors"
                >
                  Effacer tout
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-shopici-black mb-3">
                  Catégorie
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all ${selectedCategory === "all"
                      ? 'bg-shopici-blue text-white'
                      : 'bg-shopici-gray/10 text-shopici-black hover:bg-shopici-gray/20'
                      }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all ${selectedCategory === category
                        ? 'bg-shopici-blue text-white'
                        : 'bg-shopici-gray/10 text-shopici-black hover:bg-shopici-gray/20'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-bold text-shopici-black mb-3">
                  Fourchette de prix
                </label>
                <div className="space-y-4">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-shopici-gray/30 rounded-lg appearance-none cursor-pointer accent-shopici-blue"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-shopici-charcoal mb-1">Min</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 border border-shopici-gray/30 rounded-lg text-sm focus:outline-none focus:border-shopici-blue"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-shopici-charcoal mb-1">Max</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                        className="w-full px-3 py-2 border border-shopici-gray/30 rounded-lg text-sm focus:outline-none focus:border-shopici-blue"
                      />
                    </div>
                  </div>
                  <div className="text-center py-2 px-3 bg-shopici-gray/10 rounded-lg">
                    <span className="text-sm font-semibold text-shopici-black">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} XAF
                    </span>
                  </div>
                </div>
              </div>

              {/* Other Filters */}
              <div>
                <label className="block text-sm font-bold text-shopici-black mb-3">
                  Disponibilité
                </label>
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${inStockOnly
                    ? 'bg-shopici-blue text-white'
                    : 'bg-shopici-gray/10 text-shopici-black hover:bg-shopici-gray/20'
                    }`}
                >
                  En stock uniquement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                style={{
                  animation: `fadeIn 0.4s ease-out ${index * 0.05}s backwards`
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="w-24 h-24 bg-shopici-gray/20 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-shopici-charcoal/40" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-shopici-black mb-3">
              Aucun produit trouvé
            </h3>
            <p className="text-sm sm:text-base text-shopici-charcoal mb-6 text-center max-w-md">
              Essayez d'ajuster vos filtres ou votre recherche pour trouver ce que vous cherchez
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-shopici-black hover:bg-shopici-blue text-white font-semibold rounded-lg transition-all duration-300"
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
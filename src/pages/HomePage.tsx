import { useState, useMemo } from 'react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { mockProducts } from '@/data/mockData';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X, Sparkles, Shield, Clock, HeadphonesIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { products: dbProducts, isLoading } = useProducts();
  
  // Use mock data if Supabase is not configured
  const products = isSupabaseConfigured && dbProducts.length > 0 ? dbProducts : mockProducts;

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Get max price for slider
  const maxPrice = useMemo(() => {
    return Math.max(...products.map(p => p.salePrice || 0), 5000);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = (p.salePrice || 0) >= priceRange[0] && (p.salePrice || 0) <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [products, selectedCategory, searchQuery, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceRange([0, maxPrice]);
  };

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery !== '' || priceRange[0] > 0 || priceRange[1] < maxPrice;

  if (isLoading && isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3">Categories</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                selectedCategory === category
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={maxPrice}
            min={0}
            step={50}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg">₹{priceRange[0]}</span>
            <span className="text-gray-400">to</span>
            <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg">₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full border-2 border-gray-300 hover:border-red-400 hover:text-red-500"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Trusted by 10,000+ Happy Users
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Premium Services,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                Unbeatable Prices
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Get instant access to Canva Pro, LinkedIn Premium, Netflix, and more. 
              Verified accounts, fast delivery, 24/7 support.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <p className="text-2xl md:text-3xl font-bold text-white">10K+</p>
                <p className="text-xs md:text-sm text-white/70">Happy Users</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <p className="text-2xl md:text-3xl font-bold text-white">2 Hrs</p>
                <p className="text-xs md:text-sm text-white/70">Avg Delivery</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <p className="text-2xl md:text-3xl font-bold text-white">4.9★</p>
                <p className="text-xs md:text-sm text-white/70">Rating</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="sm:hidden h-12 border-2 border-gray-200 rounded-xl relative"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <FilterContent />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:block mt-6">
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
              <FilterContent />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-2 text-primary hover:underline text-sm"
                >
                  (Clear filters)
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <Button onClick={clearFilters} className="bg-primary hover:bg-primary/90">
              Clear All Filters
            </Button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Devsera Store?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We provide the best premium subscription sharing service with unmatched quality and support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-400 text-sm">
                Get your credentials within 2 hours of payment verification
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Secure</h3>
              <p className="text-gray-400 text-sm">
                All accounts are verified and regularly monitored for security
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeadphonesIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24/7 Support</h3>
              <p className="text-gray-400 text-sm">
                Our team is always available to help via Telegram
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Best Prices</h3>
              <p className="text-gray-400 text-sm">
                Save up to 85% on premium subscriptions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

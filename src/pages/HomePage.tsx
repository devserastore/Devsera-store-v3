import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useBundles } from '@/hooks/useBundles';
import { mockProducts } from '@/data/mockData';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X, Sparkles, Shield, Clock, HeadphonesIcon, Gift, ArrowRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { HeroBanner } from '@/components/shared/HeroBanner';
import { FlashSales } from '@/components/shared/FlashSales';
import { CategoryIcons } from '@/components/shared/CategoryIcons';
import { TrustBadges } from '@/components/shared/TrustBadges';
import { Testimonials } from '@/components/shared/Testimonials';
import { HowItWorks } from '@/components/shared/HowItWorks';
import { ProductGridSkeleton } from '@/components/shared/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { products: dbProducts, isLoading } = useProducts();
  const { bundles } = useBundles();
  
  const products = isSupabaseConfigured && dbProducts.length > 0 ? dbProducts : mockProducts;

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const maxPrice = useMemo(() => {
    return Math.max(...products.map(p => p.salePrice || 0), 5000);
  }, [products]);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Price Range</h4>
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
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">₹{priceRange[0]}</span>
            <span className="text-gray-400">to</span>
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 hover:text-red-500"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20 md:pb-0">
      <HeroBanner />
      <TrustBadges />
      <FlashSales products={products} />

      {bundles.length > 0 && (
        <section className="container mx-auto px-4 pb-8">
          <div 
            onClick={() => navigate('/bundles')}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-6 md:p-8 cursor-pointer hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Gift className="h-7 w-7 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    🎉 Special Bundle Offers Available!
                  </h3>
                  <p className="text-white/80 text-sm md:text-base">
                    Save up to 50% when you buy multiple subscriptions together
                  </p>
                </div>
              </div>
              <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold rounded-xl group-hover:scale-105 transition-transform">
                View Bundles
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our collection of premium subscriptions at unbeatable prices
          </p>
        </div>

        <div className="mb-8">
          <CategoryIcons 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 text-base border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-gray-800 shadow-sm"
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

            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="sm:hidden h-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl relative"
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

          <div className="hidden sm:block mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <FilterContent />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> products
              {hasActiveFilters && (
                <button onClick={clearFilters} className="ml-2 text-primary hover:underline text-sm">
                  (Clear filters)
                </button>
              )}
            </p>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <EmptyState
            type="search"
            title="No products found"
            description="Try adjusting your search or filter criteria"
            actionLabel="Clear All Filters"
            onAction={clearFilters}
          />
        )}
      </section>

      <HowItWorks />
      <Testimonials />

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
              <p className="text-gray-400 text-sm">Get your credentials within 2 hours of payment verification</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Secure</h3>
              <p className="text-gray-400 text-sm">All accounts are verified and regularly monitored for security</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeadphonesIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24/7 Support</h3>
              <p className="text-gray-400 text-sm">Our team is always available to help via Telegram</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Best Prices</h3>
              <p className="text-gray-400 text-sm">Save up to 85% on premium subscriptions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

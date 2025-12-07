import { useState } from 'react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { mockProducts } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'All'
    ? mockProducts
    : mockProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b-2 border-black">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-extrabold font-['Space_Grotesk'] leading-tight mb-6">
              Premium Services,
              <br />
              <span className="text-primary">Shared Access</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 font-['Manrope']">
              Get instant access to Canva Pro, LinkedIn Premium, Netflix, and more at unbeatable prices.
              Verified accounts, instant delivery, 24/7 support.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="brutalist-card px-6 py-3">
                <p className="text-sm text-muted-foreground">Trusted by</p>
                <p className="text-2xl font-bold font-['Space_Grotesk']">10,000+</p>
                <p className="text-sm">Happy Users</p>
              </div>
              <div className="brutalist-card px-6 py-3">
                <p className="text-sm text-muted-foreground">Average delivery</p>
                <p className="text-2xl font-bold font-['Space_Grotesk']">2 Hours</p>
                <p className="text-sm">Or Less</p>
              </div>
              <div className="brutalist-card px-6 py-3">
                <p className="text-sm text-muted-foreground">Customer rating</p>
                <p className="text-2xl font-bold font-['Space_Grotesk']">4.9/5</p>
                <p className="text-sm">⭐⭐⭐⭐⭐</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] mb-4">
            Browse Products
          </h2>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="border-2 border-black bg-white h-auto p-1">
              {categories.map(category => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ProductGrid products={filteredProducts} />
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 border-y-2 border-black py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] mb-12 text-center">
            Why Choose Devsera Store?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="brutalist-card p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] mb-2">Instant Delivery</h3>
              <p className="text-muted-foreground">
                Get your credentials within 2 hours of payment verification
              </p>
            </div>
            <div className="brutalist-card p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] mb-2">100% Secure</h3>
              <p className="text-muted-foreground">
                All accounts are verified and regularly monitored for security
              </p>
            </div>
            <div className="brutalist-card p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">
                Our team is always available to help via Telegram
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

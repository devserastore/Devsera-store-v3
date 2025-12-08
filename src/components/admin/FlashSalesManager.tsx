import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { mockProducts } from '@/data/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Zap, Clock, Flame, Settings, Save, RefreshCw, Percent, Package } from 'lucide-react';
import { Product } from '@/types';

interface FlashSaleConfig {
  enabled: boolean;
  duration_hours: number;
  min_discount_percent: number;
  max_products: number;
  product_ids: string[];
}

export function FlashSalesManager() {
  const { toast } = useToast();
  const { products: dbProducts, isLoading: productsLoading } = useProducts();
  const products = isSupabaseConfigured && dbProducts.length > 0 ? dbProducts : mockProducts;
  
  const [config, setConfig] = useState<FlashSaleConfig>({
    enabled: true,
    duration_hours: 6,
    min_discount_percent: 10,
    max_products: 3,
    product_ids: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Get products with discounts
  const discountedProducts = products.filter(p => p.originalPrice > p.salePrice);
  
  // Calculate discount percentage for a product
  const getDiscountPercent = (product: Product) => {
    return Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100);
  };

  // Load config from localStorage or settings
  useEffect(() => {
    const savedConfig = localStorage.getItem('flashSaleConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      setSelectedProducts(parsed.product_ids || []);
    }
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const newConfig = {
        ...config,
        product_ids: selectedProducts
      };
      
      // Save to localStorage for now (can be extended to Supabase)
      localStorage.setItem('flashSaleConfig', JSON.stringify(newConfig));
      
      setConfig(newConfig);
      toast({
        title: 'Flash Sale Settings Saved',
        description: 'Your flash sale configuration has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= config.max_products) {
        toast({
          title: 'Maximum products reached',
          description: `You can only select up to ${config.max_products} products for flash sale.`,
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, productId];
    });
  };

  const autoSelectTopDiscounts = () => {
    const topDiscounted = discountedProducts
      .filter(p => getDiscountPercent(p) >= config.min_discount_percent)
      .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a))
      .slice(0, config.max_products)
      .map(p => p.id);
    
    setSelectedProducts(topDiscounted);
    toast({
      title: 'Auto-selected products',
      description: `Selected top ${topDiscounted.length} discounted products.`,
    });
  };

  return (
    <Card className="border-2 border-gray-200 shadow-lg">
      <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Flash Sales Manager</CardTitle>
              <p className="text-sm text-gray-600">Configure flash sale products and settings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
              />
              <span className="text-sm font-medium text-gray-700">
                {config.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Duration (hours)
            </Label>
            <Input
              type="number"
              value={config.duration_hours}
              onChange={(e) => setConfig(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 6 }))}
              min={1}
              max={24}
              className="border-2 border-gray-200 focus:border-orange-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Percent className="h-4 w-4 text-gray-500" />
              Min Discount %
            </Label>
            <Input
              type="number"
              value={config.min_discount_percent}
              onChange={(e) => setConfig(prev => ({ ...prev, min_discount_percent: parseInt(e.target.value) || 10 }))}
              min={5}
              max={90}
              className="border-2 border-gray-200 focus:border-orange-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              Max Products
            </Label>
            <Input
              type="number"
              value={config.max_products}
              onChange={(e) => setConfig(prev => ({ ...prev, max_products: parseInt(e.target.value) || 3 }))}
              min={1}
              max={10}
              className="border-2 border-gray-200 focus:border-orange-400"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={autoSelectTopDiscounts}
              variant="outline"
              className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Auto Select
            </Button>
          </div>
        </div>

        {/* Product Selection */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-semibold text-gray-900">Select Flash Sale Products</h3>
            <Badge variant="outline" className="w-fit border-orange-300 text-orange-600">
              {selectedProducts.length} / {config.max_products} selected
            </Badge>
          </div>
          
          {productsLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : discountedProducts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No discounted products available</p>
              <p className="text-sm text-gray-400">Add products with discounts to enable flash sales</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
              {discountedProducts.map((product) => {
                const discount = getDiscountPercent(product);
                const isSelected = selectedProducts.includes(product.id);
                const meetsMinDiscount = discount >= config.min_discount_percent;
                
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProductSelection(product.id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : meetsMinDiscount
                        ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Zap className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=100&q=80'}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${discount >= 30 ? 'bg-red-500' : discount >= 20 ? 'bg-orange-500' : 'bg-amber-500'} text-white`}>
                            -{discount}%
                          </Badge>
                          <span className="text-sm font-bold text-gray-900">₹{product.salePrice}</span>
                          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                        </div>
                        {!meetsMinDiscount && (
                          <p className="text-xs text-red-500 mt-1">Below min discount</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

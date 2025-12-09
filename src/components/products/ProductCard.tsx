import { useState, useEffect } from 'react';
import { Product, DeliveryType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { Clock, Key, Package, UserCheck, Zap, ArrowRight, Heart, Eye, Star, AlertTriangle, Layers, Flame } from 'lucide-react';

interface FlashSaleProduct {
  productId: string;
  discountAmount: number;
}

interface FlashSaleConfig {
  enabled: boolean;
  flash_sale_products: FlashSaleProduct[];
  end_time?: string;
}

const deliveryIcons: Record<DeliveryType, React.ReactNode> = {
  CREDENTIALS: <Key className="h-3 w-3" />,
  COUPON_CODE: <Package className="h-3 w-3" />,
  MANUAL_ACTIVATION: <UserCheck className="h-3 w-3" />,
  INSTANT_KEY: <Zap className="h-3 w-3" />
};

const deliveryLabels: Record<DeliveryType, string> = {
  CREDENTIALS: 'Login Access',
  COUPON_CODE: 'License Key',
  MANUAL_ACTIVATION: 'Manual Setup',
  INSTANT_KEY: 'Instant Key'
};

// Helper to get flash sale info for a product
function getFlashSaleInfo(productId: string): { isOnFlashSale: boolean; discountAmount: number } {
  try {
    const savedConfig = localStorage.getItem('flashSaleConfig');
    if (!savedConfig) return { isOnFlashSale: false, discountAmount: 0 };
    
    const config: FlashSaleConfig = JSON.parse(savedConfig);
    
    // Check if flash sale is enabled and not expired
    if (!config.enabled || !config.end_time) return { isOnFlashSale: false, discountAmount: 0 };
    
    const endTime = new Date(config.end_time).getTime();
    if (Date.now() >= endTime) return { isOnFlashSale: false, discountAmount: 0 };
    
    // Find the product in flash sale
    const flashProduct = config.flash_sale_products?.find(fp => fp.productId === productId);
    if (!flashProduct) return { isOnFlashSale: false, discountAmount: 0 };
    
    return { isOnFlashSale: true, discountAmount: flashProduct.discountAmount };
  } catch {
    return { isOnFlashSale: false, discountAmount: 0 };
  }
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [flashSaleInfo, setFlashSaleInfo] = useState({ isOnFlashSale: false, discountAmount: 0 });
  
  // Check flash sale status
  useEffect(() => {
    const checkFlashSale = () => {
      setFlashSaleInfo(getFlashSaleInfo(product.id));
    };
    checkFlashSale();
    const interval = setInterval(checkFlashSale, 1000);
    return () => clearInterval(interval);
  }, [product.id]);
  
  // Get price range for products with variants
  const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;
  const baseMinPrice = hasVariants 
    ? Math.min(...product.variants!.map(v => v.salePrice))
    : product.salePrice || 0;
  const baseMaxPrice = hasVariants 
    ? Math.max(...product.variants!.map(v => v.salePrice))
    : product.salePrice || 0;
  
  // Apply flash sale discount
  const minPrice = flashSaleInfo.isOnFlashSale 
    ? Math.max(0, baseMinPrice - flashSaleInfo.discountAmount)
    : baseMinPrice;
  const maxPrice = flashSaleInfo.isOnFlashSale 
    ? Math.max(0, baseMaxPrice - flashSaleInfo.discountAmount)
    : baseMaxPrice;
  
  const salePrice = minPrice;
  const originalPrice = hasVariants 
    ? Math.min(...product.variants!.map(v => v.originalPrice))
    : (product.originalPrice || 0);
  
  // For flash sale, show the base price as "original" for comparison
  const displayOriginalPrice = flashSaleInfo.isOnFlashSale ? baseMinPrice : originalPrice;
  const savings = displayOriginalPrice - salePrice;
  const discountPercent = displayOriginalPrice > 0 ? Math.round((savings / displayOriginalPrice) * 100) : 0;
  
  // Simulated stock (in real app, this would come from product data)
  const stockLevel = product.stockCount !== undefined ? product.stockCount : Math.floor(Math.random() * 20) + 1;
  const isLowStock = product.deliveryType === 'INSTANT_KEY' && stockLevel <= 5;
  
  // Simulated rating
  const rating = 4.5 + Math.random() * 0.5;

  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-500 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {flashSaleInfo.isOnFlashSale ? (
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg animate-pulse">
            <Flame className="h-3 w-3 mr-1" />
            FLASH SALE -₹{flashSaleInfo.discountAmount}
          </span>
        </div>
      ) : discountPercent > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
            -{discountPercent}% OFF
          </span>
        </div>
      )}

      {/* Wishlist & Quick View Buttons */}
      <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isInWishlist(product.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/95 dark:bg-gray-800/95 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </button>
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-9 h-9 rounded-full bg-white/95 dark:bg-gray-800/95 text-gray-600 dark:text-gray-300 flex items-center justify-center shadow-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-500 transition-all"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
        <img
          src={product.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Delivery Type Badge */}
        {product.deliveryType && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-700 dark:text-gray-200 border-0 shadow-md text-xs flex items-center gap-1.5 px-2.5 py-1">
              {deliveryIcons[product.deliveryType]}
              {deliveryLabels[product.deliveryType]}
            </Badge>
          </div>
        )}

        {/* Low Stock Warning */}
        {isLowStock && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-amber-500/95 text-white border-0 shadow-md text-xs flex items-center gap-1 px-2 py-1">
              <AlertTriangle className="h-3 w-3" />
              Only {stockLevel} left
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Category, Rating & Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-xs">
              {product.category}
            </Badge>
            <div className="flex items-center text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-semibold ml-0.5">{rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span className="font-medium">{product.duration}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-baseline gap-2">
              {hasVariants && minPrice !== maxPrice ? (
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
                </span>
              ) : (
                <>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{salePrice.toLocaleString()}
                  </span>
                  {originalPrice > salePrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                  )}
                </>
              )}
            </div>
            {hasVariants ? (
              <p className="text-xs font-medium text-purple-600 mt-0.5 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {product.variants!.length} plans available
              </p>
            ) : flashSaleInfo.isOnFlashSale ? (
              <p className="text-xs font-semibold text-red-600 mt-0.5 flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Flash Sale - Save ₹{flashSaleInfo.discountAmount}
              </p>
            ) : savings > 0 ? (
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                Save ₹{savings.toLocaleString()}
              </p>
            ) : null}
          </div>
          <Button
            onClick={() => navigate(`/product/${product.id}`)}
            size="sm"
            className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all group/btn"
          >
            View
            <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

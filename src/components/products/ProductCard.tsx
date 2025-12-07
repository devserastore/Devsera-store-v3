import { Product, DeliveryType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, Key, Package, UserCheck, Zap, ArrowRight } from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  
  const salePrice = product.salePrice || 0;
  const originalPrice = product.originalPrice || 0;
  const savings = originalPrice - salePrice;
  const discountPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-1">
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
            -{discountPercent}% OFF
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-50">
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
            <Badge className="bg-white/95 backdrop-blur-sm text-gray-700 border-0 shadow-md text-xs flex items-center gap-1.5 px-2.5 py-1">
              {deliveryIcons[product.deliveryType]}
              {deliveryLabels[product.deliveryType]}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Category & Duration */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 font-medium text-xs">
            {product.category}
          </Badge>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span className="font-medium">{product.duration}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ₹{salePrice.toLocaleString()}
              </span>
              {originalPrice > salePrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                Save ₹{savings.toLocaleString()}
              </p>
            )}
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

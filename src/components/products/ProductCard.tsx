import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <div className="brutalist-card overflow-hidden group hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold font-['Space_Grotesk']">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
          </div>
          <Badge variant="outline" className="border-2 border-black">
            {product.category}
          </Badge>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">{product.duration}</span>
        </div>

        <div className="flex items-end justify-between pt-2">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-['Space_Grotesk'] text-primary">
                ₹{product.salePrice}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            </div>
            <p className="text-xs text-green-600 font-semibold mt-1">
              Save ₹{product.originalPrice - product.salePrice}
            </p>
          </div>
          <Button
            onClick={() => navigate(`/product/${product.id}`)}
            className="brutalist-button bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, ArrowRight, Flame } from 'lucide-react';

interface FlashSaleConfig {
  enabled: boolean;
  duration_hours: number;
  min_discount_percent: number;
  max_products: number;
  product_ids: string[];
  start_time?: string;
}

interface FlashSalesProps {
  products: Product[];
}

export function FlashSales({ products }: FlashSalesProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [config, setConfig] = useState<FlashSaleConfig | null>(null);

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('flashSaleConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      
      // Initialize or get start time
      let startTime = localStorage.getItem('flashSaleStartTime');
      if (!startTime) {
        startTime = new Date().toISOString();
        localStorage.setItem('flashSaleStartTime', startTime);
      }
    }
  }, []);

  // Get flash sale products based on config
  const flashProducts = config?.enabled && config?.product_ids?.length > 0
    ? products.filter(p => config.product_ids.includes(p.id))
    : products
        .filter(p => p.originalPrice > p.salePrice)
        .sort((a, b) => {
          const discountA = ((a.originalPrice - a.salePrice) / a.originalPrice) * 100;
          const discountB = ((b.originalPrice - b.salePrice) / b.originalPrice) * 100;
          return discountB - discountA;
        })
        .slice(0, 3);

  useEffect(() => {
    const durationHours = config?.duration_hours || 6;
    
    const calculateTimeLeft = () => {
      const startTimeStr = localStorage.getItem('flashSaleStartTime');
      if (!startTimeStr) {
        const now = new Date().toISOString();
        localStorage.setItem('flashSaleStartTime', now);
        return { hours: durationHours, minutes: 0, seconds: 0 };
      }
      
      const startTime = new Date(startTimeStr).getTime();
      const endTime = startTime + (durationHours * 60 * 60 * 1000);
      const now = Date.now();
      const diff = endTime - now;
      
      if (diff <= 0) {
        // Reset the timer
        const newStartTime = new Date().toISOString();
        localStorage.setItem('flashSaleStartTime', newStartTime);
        return { hours: durationHours, minutes: 0, seconds: 0 };
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  if (flashProducts.length === 0 || (config && !config.enabled)) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] animate-pulse" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                <Zap className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  <Flame className="h-6 w-6 text-yellow-300 animate-bounce" />
                  Flash Sale
                </h2>
                <p className="text-white/80 text-sm">Limited time offers!</p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-white" />
              <div className="flex gap-1">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center">
                  <span className="text-2xl font-bold text-white font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <p className="text-xs text-white/70">HRS</p>
                </div>
                <span className="text-2xl font-bold text-white self-start mt-2">:</span>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center">
                  <span className="text-2xl font-bold text-white font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <p className="text-xs text-white/70">MIN</p>
                </div>
                <span className="text-2xl font-bold text-white self-start mt-2">:</span>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center">
                  <span className="text-2xl font-bold text-white font-mono">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <p className="text-xs text-white/70">SEC</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flash Products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flashProducts.map((product) => {
              const discount = Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100);
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 cursor-pointer hover:scale-105 transition-transform duration-300 shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=200&q=80'}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <Badge className="bg-red-500 text-white mb-1">-{discount}% OFF</Badge>
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xl font-bold text-red-600 dark:text-red-400">₹{product.salePrice}</span>
                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

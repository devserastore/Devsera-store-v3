import { useParams, useNavigate } from 'react-router-dom';
import { mockProducts, mockReviews } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Star, ShieldCheck, Clock, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const product = mockProducts.find(p => p.id === id);
  const productReviews = mockReviews.filter(r => r.productId === id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } });
    } else {
      navigate(`/checkout/${id}`);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="brutalist-button mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="brutalist-card overflow-hidden brutalist-shadow">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold font-['Space_Grotesk'] mb-4">
                {product.name}
              </h1>
              <p className="text-xl text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({productReviews.length} reviews)
              </span>
            </div>

            <div className="brutalist-card p-6 bg-primary/5">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-5xl font-extrabold font-['Space_Grotesk'] text-primary">
                  ₹{product.salePrice}
                </span>
                <span className="text-2xl text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              </div>
              <p className="text-lg font-semibold text-green-600">
                Save ₹{product.originalPrice - product.salePrice} ({Math.round((1 - product.salePrice / product.originalPrice) * 100)}% OFF)
              </p>
              <div className="flex items-center space-x-2 mt-4 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-semibold">{product.duration} Access</span>
              </div>
            </div>

            <Button
              onClick={handleBuyNow}
              size="lg"
              className="w-full brutalist-button bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14"
            >
              {user ? 'Buy Now' : 'Login to Purchase'}
            </Button>

            <div className="flex items-center justify-around brutalist-card p-4 text-sm">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span>Verified Account</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>2hr Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold font-['Space_Grotesk'] mb-6">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 brutalist-card p-4">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        {productReviews.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold font-['Space_Grotesk'] mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {productReviews.map(review => (
                <div key={review.id} className="brutalist-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userName}`} />
                        <AvatarFallback>{review.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold">{review.userName}</p>
                          {review.verified && (
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

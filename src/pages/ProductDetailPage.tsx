import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useSettings } from '@/hooks/useSettings';
import { useReviews } from '@/hooks/useReviews';
import { mockProducts, mockReviews } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Check, Star, ShieldCheck, Clock, ArrowLeft, Key, Package, UserCheck, Zap, MessageCircle, Sparkles, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { isSupabaseConfigured } from '@/lib/supabase';
import { DeliveryType } from '@/types';
import { Badge } from '@/components/ui/badge';

const deliveryTypeInfo: Record<DeliveryType, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  CREDENTIALS: {
    label: 'Login Credentials',
    icon: <Key className="h-5 w-5" />,
    description: 'You will receive login credentials to access the service',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  COUPON_CODE: {
    label: 'Coupon/License Key',
    icon: <Package className="h-5 w-5" />,
    description: 'You will receive a coupon code or license key to activate',
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  MANUAL_ACTIVATION: {
    label: 'Manual Activation',
    icon: <UserCheck className="h-5 w-5" />,
    description: 'We will activate the service on your existing account',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  },
  INSTANT_KEY: {
    label: 'Instant Delivery',
    icon: <Zap className="h-5 w-5" />,
    description: 'Your license key will be delivered instantly',
    color: 'bg-amber-50 border-amber-200 text-amber-700'
  }
};

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { product: dbProduct, isLoading } = useProduct(id!);
  const { settings } = useSettings();
  const { reviews: dbReviews, createReview, isLoading: reviewsLoading } = useReviews(id);
  
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Use mock data if Supabase is not configured
  const product = isSupabaseConfigured && dbProduct ? dbProduct : mockProducts.find(p => p.id === id);
  const productReviews = isSupabaseConfigured && dbReviews.length > 0 ? dbReviews : mockReviews.filter(r => r.productId === id);

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to submit a review',
        variant: 'destructive',
      });
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        title: 'Review required',
        description: 'Please write a review comment',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await createReview(reviewRating, reviewComment);
      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback',
      });
      setReviewComment('');
      setReviewRating(5);
    } catch (error: any) {
      toast({
        title: 'Error submitting review',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading && isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 md:pb-0">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center pb-20 md:pb-0">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')} className="btn-gradient">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/checkout/${id}` } });
    } else {
      navigate(`/checkout/${id}`);
    }
  };

  const salePrice = product.salePrice || 0;
  const originalPrice = product.originalPrice || 0;
  const savings = originalPrice - salePrice;
  const discountPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        {/* Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 md:mb-16">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-2xl shadow-gray-200/50">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                }}
              />
            </div>
            {/* Discount Badge */}
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                  -{discountPercent}% OFF
                </span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Category Badge */}
            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium">
              {product.category}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400">{product.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({productReviews.length} reviews)
              </span>
            </div>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-teal-100 dark:border-teal-800">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                  ₹{salePrice.toLocaleString()}
                </span>
                {originalPrice > salePrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  Save ₹{savings.toLocaleString()} ({discountPercent}% OFF)
                </p>
              )}
              <div className="flex items-center gap-2 mt-4 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">{product.duration} Access</span>
              </div>
            </div>

            {/* Buy Button */}
            <Button
              onClick={handleBuyNow}
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all"
            >
              {user ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Buy Now
                </>
              ) : (
                'Login to Purchase'
              )}
            </Button>

            {/* Delivery Type Info */}
            {product.deliveryType && (
              <div className={`rounded-xl p-4 border-2 ${deliveryTypeInfo[product.deliveryType].color}`}>
                <div className="flex items-center gap-2 mb-2">
                  {deliveryTypeInfo[product.deliveryType].icon}
                  <span className="font-semibold">{deliveryTypeInfo[product.deliveryType].label}</span>
                </div>
                <p className="text-sm opacity-90">
                  {product.deliveryInstructions || deliveryTypeInfo[product.deliveryType].description}
                </p>
                {product.requiresUserInput && (
                  <p className="text-xs mt-2 font-medium opacity-75">
                    ℹ️ You'll need to provide your {product.userInputLabel || 'account details'} during checkout
                  </p>
                )}
              </div>
            )}

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0088cc] rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Have questions?</p>
                  <a
                    href={`https://t.me/${(settings?.telegramUsername || '@karthik_nkn').replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0088cc] font-bold hover:underline"
                  >
                    Contact {settings?.telegramUsername || '@karthik_nkn'} on Telegram
                  </a>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Verified</p>
                  <p className="text-xs text-gray-500">100% Genuine</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Fast Delivery</p>
                  <p className="text-xs text-gray-500">Within 2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">What's Included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-200 hover:shadow-md transition-all">
                <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-teal-600" />
                </div>
                <span className="font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          
          {/* Write Review Form */}
          {user && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="border-2 border-gray-200 rounded-xl min-h-[100px] resize-none focus:border-teal-500"
                  />
                </div>
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold"
                >
                  {isSubmittingReview ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {!user && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 text-center">
              <p className="text-gray-600 mb-3">Login to write a review</p>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="rounded-xl border-2 border-black"
              >
                Login
              </Button>
            </div>
          )}

          {/* Reviews List */}
          {productReviews.length > 0 ? (
            <div className="space-y-4">
              {productReviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-gray-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userName}`} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                          {review.userName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          {review.verified && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

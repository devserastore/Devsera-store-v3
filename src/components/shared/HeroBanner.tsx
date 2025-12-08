import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Shield, Clock, Gift } from 'lucide-react';

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  gradient: string;
  icon: React.ReactNode;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: 'Premium Services',
    subtitle: 'Unbeatable Prices',
    description: 'Get instant access to Canva Pro, LinkedIn Premium, Netflix, and more at up to 85% off!',
    buttonText: 'Shop Now',
    buttonLink: '/',
    gradient: 'from-teal-600 via-teal-700 to-emerald-800',
    icon: <Sparkles className="h-8 w-8" />
  },
  {
    id: 2,
    title: 'Bundle & Save',
    subtitle: 'Up to 50% Extra Off',
    description: 'Combine multiple subscriptions and unlock exclusive bundle discounts!',
    buttonText: 'View Bundles',
    buttonLink: '/bundles',
    gradient: 'from-purple-600 via-pink-600 to-purple-800',
    icon: <Gift className="h-8 w-8" />
  },
  {
    id: 3,
    title: 'Fast Delivery',
    subtitle: 'Within 2 Hours',
    description: 'Get your credentials delivered instantly after payment verification.',
    buttonText: 'Learn More',
    buttonLink: '/contact',
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    icon: <Clock className="h-8 w-8" />
  },
  {
    id: 4,
    title: '100% Secure',
    subtitle: 'Verified Accounts',
    description: 'All accounts are verified and come with replacement guarantee.',
    buttonText: 'Contact Support',
    buttonLink: '/support',
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    icon: <Shield className="h-8 w-8" />
  }
];

export function HeroBanner() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const slide = bannerSlides[currentSlide];

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${slide.gradient} transition-all duration-700`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl text-white mb-6 animate-bounce">
            {slide.icon}
          </div>

          {/* Content */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 animate-fade-in">
            {slide.title}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
              {slide.subtitle}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {slide.description}
          </p>

          <Button
            onClick={() => navigate(slide.buttonLink)}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            {slide.buttonText}
          </Button>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" className="dark:fill-gray-900"/>
        </svg>
      </div>
    </section>
  );
}

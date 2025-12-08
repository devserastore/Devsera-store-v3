import { Shield, Clock, HeadphonesIcon, RefreshCw, CreditCard, Lock } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    { icon: <Shield className="h-5 w-5" />, label: '100% Secure', color: 'text-emerald-600' },
    { icon: <Clock className="h-5 w-5" />, label: 'Fast Delivery', color: 'text-amber-600' },
    { icon: <HeadphonesIcon className="h-5 w-5" />, label: '24/7 Support', color: 'text-blue-600' },
    { icon: <RefreshCw className="h-5 w-5" />, label: 'Replacement Guarantee', color: 'text-purple-600' },
    { icon: <CreditCard className="h-5 w-5" />, label: 'Secure Payment', color: 'text-teal-600' },
    { icon: <Lock className="h-5 w-5" />, label: 'Privacy Protected', color: 'text-pink-600' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
            >
              <span className={badge.color}>{badge.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

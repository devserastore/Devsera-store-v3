import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Package, Gift, User, ShoppingBag, MessageSquare } from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
    { icon: <Package className="h-5 w-5" />, label: 'Bundles', path: '/bundles' },
    { icon: <Gift className="h-5 w-5" />, label: 'Rewards', path: '/rewards' },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'Support', path: '/support' },
    { 
      icon: user ? <User className="h-5 w-5" /> : <User className="h-5 w-5" />, 
      label: user ? 'Profile' : 'Login', 
      path: user ? '/profile' : '/login' 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-teal-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

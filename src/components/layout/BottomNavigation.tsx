import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  BarChart3, 
  Bike, 
  User, 
  Zap,
  Wrench
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Zap },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Bike Fit', href: '/bike-fitting', icon: Wrench },
  { name: 'Bikes', href: '/bikes', icon: Bike },
  { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-6 h-16">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
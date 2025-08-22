import { cn } from '@/lib/utils';
import { 
  Home, 
  Activity, 
  Bike, 
  User, 
  BarChart3, 
  Settings,
  Zap
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Bicycles', href: '/bicycles', icon: Bike },
  { name: 'Fittings', href: '/fittings', icon: Settings },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">LukSpeed</span>
        </div>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
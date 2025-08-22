import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { 
  Menu, 
  BarChart3, 
  Activity, 
  User, 
  Bike,
  Target,
  TrendingUp,
  LogOut,
  Home,
  Bell
} from 'lucide-react';

interface ResponsiveLayoutProps {
  children?: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Advanced', href: '/enhanced-activities', icon: TrendingUp },
    { name: 'Activities', href: '/enhanced-activities', icon: Activity },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Bike Fit', href: '/enhanced-bike-fitting', icon: Target },
    { name: 'Bikes', href: '/bikes', icon: Bike },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-red-500">
      {/* Top Navigation Header - NO SIDEBAR */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">LukSpeed</span>
                  <div className="text-xs text-gray-500 hidden sm:block">Cycling Performance Dashboard</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Horizontal */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="hidden lg:flex relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* Desktop Sign Out */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden lg:flex text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="flex flex-col h-full">
                      
                      {/* Mobile Header */}
                      <div className="flex items-center space-x-3 pb-6 border-b">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">LukSpeed</h2>
                          <p className="text-sm text-gray-500">Performance Analytics</p>
                        </div>
                      </div>
                      
                      {/* Mobile Navigation */}
                      <nav className="flex-1 py-6 space-y-2">
                        {navigationItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              <Icon className="h-5 w-5" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </nav>
                      
                      {/* Mobile Sign Out */}
                      <div className="border-t pt-6">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            handleSignOut();
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                      
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - FULL WIDTH, NO SIDEBAR */}
      <main className="w-full">
        <div className="max-w-none">
          {children}
        </div>
      </main>
    </div>
  );
}
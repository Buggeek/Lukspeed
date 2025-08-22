import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isStravaConnected } from '@/utils/auth';
import { Card } from '@/components/ui/card';
import { Bike } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    setIsConnected(isStravaConnected());
  }, []);

  if (isConnected === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="p-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bike className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading LukSpeed</h3>
          <p className="text-gray-500">Checking connection status...</p>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
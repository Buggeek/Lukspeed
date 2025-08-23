import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StravaAuthButton from '@/components/auth/StravaAuthButton';

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-6 text-center">
          <div className="text-6xl mb-4">🚴‍♂️</div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Bienvenido a LukSpeed
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Conecta con Strava para comenzar tu análisis narrativo de rendimiento ciclista
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OAuth Strava Directo */}
          <StravaAuthButton />
          
          <div className="text-center">
            <p className="text-sm text-gray-500 leading-relaxed">
              Al conectar, aceptas nuestros términos de servicio y política de privacidad. 
              Solo accedemos a tus actividades de ciclismo para generar análisis personalizados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
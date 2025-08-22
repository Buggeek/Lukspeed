import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación con Strava...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Strava authorization error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state');
        }

        setMessage('Intercambiando código de autorización...');

        // Exchange code for tokens
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch('https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/strava_oauth?action=exchange_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            code,
            state
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to exchange token');
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error('Token exchange failed');
        }

        setStatus('success');
        setMessage('¡Conexión con Strava exitosa!');

        // Redirect based on whether user needs onboarding
        setTimeout(() => {
          if (result.requires_onboarding) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        }, 2000);

      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Error durante la autenticación');

        // Redirect to auth page after error
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">LukSpeed</h1>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center">
              {status === 'loading' && (
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-12 w-12 text-green-600" />
              )}
              {status === 'error' && (
                <AlertCircle className="h-12 w-12 text-red-600" />
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {status === 'loading' && 'Conectando con Strava'}
                {status === 'success' && '¡Conexión Exitosa!'}
                {status === 'error' && 'Error de Conexión'}
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>

            {/* Additional Info */}
            {status === 'success' && (
              <div className="text-sm text-gray-500">
                Redirigiendo a tu dashboard...
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-sm text-gray-500">
                Redirigiendo a la página de autenticación...
              </div>
            )}

            {/* Progress for loading */}
            {status === 'loading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {status === 'error' && (
        <Alert variant="destructive" className="mt-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Si el problema persiste, intenta desconectar y volver a conectar tu cuenta de Strava.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
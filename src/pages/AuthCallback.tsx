import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { logger } from '@/services/Logger';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    const timerId = logger.startTimer('Strava OAuth Callback Processing');
    
    try {
      logger.authInfo('Processing Strava OAuth callback', {
        component: 'AuthCallback',
        action: 'handleAuthCallback',
        data: { url: window.location.href }
      });
      
      // Obtener parámetros de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      if (error) {
        logger.authError('Strava authorization error received', new Error(error), {
          component: 'AuthCallback',
          data: { error, state }
        });
        throw new Error(`Strava authorization error: ${error}`);
      }
      
      if (!code) {
        logger.authError('No authorization code received from Strava', new Error('Missing code parameter'), {
          component: 'AuthCallback',
          data: { urlParams: Object.fromEntries(urlParams.entries()) }
        });
        throw new Error('No authorization code received from Strava');
      }
      
      logger.authInfo('Authorization code received successfully', {
        component: 'AuthCallback',
        data: { codeLength: code.length, state }
      });
      
      setMessage('Intercambiando código por tokens...');
      
      // Exchange code for tokens using our edge function
      const exchangeResponse = await fetch('https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/app_dbd0941867_strava_exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          state: state
        })
      });
      
      if (!exchangeResponse.ok) {
        const errorText = await exchangeResponse.text();
        logger.authError('Token exchange failed', new Error(errorText), {
          component: 'AuthCallback',
          data: { status: exchangeResponse.status, statusText: exchangeResponse.statusText }
        });
        throw new Error(`Token exchange failed: ${errorText}`);
      }
      
      const exchangeData = await exchangeResponse.json();
      logger.authInfo('Token exchange successful', {
        component: 'AuthCallback',
        data: {
          athleteId: exchangeData.athlete?.id,
          hasAccessToken: !!exchangeData.access_token,
          hasRefreshToken: !!exchangeData.refresh_token,
          hasSession: !!exchangeData.session
        }
      });
      
      setMessage('Estableciendo sesión...');
      
      // Set the session in Supabase client
      if (exchangeData.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: exchangeData.session.access_token,
          refresh_token: exchangeData.session.refresh_token
        });
        
        if (sessionError) {
          logger.authError('Failed to set session', sessionError, {
            component: 'AuthCallback'
          });
          throw new Error(`Failed to set session: ${sessionError.message}`);
        }
        
        logger.authInfo('Session established successfully', {
          component: 'AuthCallback',
          data: {
            userId: exchangeData.user?.id,
            email: exchangeData.user?.email
          }
        });
      } else {
        // Fallback: sign in anonymously and rely on profile data
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        
        if (authError) {
          logger.authError('Failed to create fallback session', authError, {
            component: 'AuthCallback'
          });
          throw new Error(`Failed to create session: ${authError.message}`);
        }
        
        logger.authInfo('Fallback session created', {
          component: 'AuthCallback',
          data: { userId: authData.user?.id }
        });
      }
      
      logger.endTimer(timerId, 'auth', 'Strava OAuth Callback Processing');
      
      setStatus('success');
      setMessage('¡Conectado con Strava exitosamente! Redirigiendo al dashboard narrativo...');
      
      // Redirigir al dashboard narrativo
      setTimeout(() => {
        navigate('/narrative');
      }, 2000);

    } catch (error: any) {
      logger.authError('Auth callback processing failed', error, {
        component: 'AuthCallback',
        data: {
          userAgent: navigator.userAgent,
          currentUrl: window.location.href
        }
      });
      
      setStatus('error');
      setMessage(`Error: ${error.message || 'Error procesando autenticación con Strava'}`);
      
      // Redirigir a auth después de mostrar error
      setTimeout(() => {
        navigate('/auth');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="text-center p-8 max-w-md">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Conectando con Strava...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">¡Conectado exitosamente!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error de conexión</h2>
            <p className="text-gray-600 text-sm">{message}</p>
            <p className="text-gray-500 text-xs mt-2">Redirigiendo en 5 segundos...</p>
          </>
        )}
      </div>
    </div>
  );
}
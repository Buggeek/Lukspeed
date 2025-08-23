import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { logger } from '@/services/Logger';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    const timerId = logger.startTimer('Strava OAuth Callback Processing');
    
    try {
      logger.authInfo('Processing manual Strava callback', {
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
      
      const tokenData = await exchangeResponse.json();
      logger.authInfo('Tokens received successfully', {
        component: 'AuthCallback',
        data: {
          athleteId: tokenData.athlete?.id,
          hasAccessToken: !!tokenData.access_token,
          hasRefreshToken: !!tokenData.refresh_token
        }
      });
      
      // Create user session with Supabase using the Strava data
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) {
        logger.authError('Failed to create Supabase session', authError, {
          component: 'AuthCallback'
        });
        throw new Error(`Failed to create session: ${authError.message}`);
      }
      
      logger.authInfo('Supabase session created successfully', {
        component: 'AuthCallback',
        data: {
          userId: authData.user?.id,
          email: authData.user?.email
        }
      });
      
      // Create profile with Strava data
      await ensureStravaProfile(authData.user!, tokenData);
      
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
      setMessage(error.message || 'Error procesando autenticación con Strava');
      
      // Redirigir a auth después de mostrar error
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  };

  const ensureStravaProfile = async (user: any, tokenData: any) => {
    try {
      logger.authInfo('Creating/updating Strava profile', {
        component: 'AuthCallback',
        data: { userId: user.id, athleteId: tokenData.athlete?.id }
      });
      
      // Verificar si ya existe perfil
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Crear perfil nuevo para usuario OAuth Strava
        logger.authInfo('Creating new profile for Strava OAuth user', {
          component: 'AuthCallback',
          data: { userId: user.id }
        });
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: tokenData.athlete?.email || `athlete${tokenData.athlete?.id}@strava.local`,
            full_name: `${tokenData.athlete?.firstname} ${tokenData.athlete?.lastname}`.trim() || 'Strava User',
            strava_athlete_id: tokenData.athlete?.id?.toString(),
            strava_access_token: tokenData.access_token,
            strava_refresh_token: tokenData.refresh_token,
            strava_token_expires_at: tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : null,
            auth_provider: 'strava',
            created_at: new Date().toISOString(),
            onboarding_completed: true // Para usuarios OAuth, completar onboarding automáticamente
          });

        if (profileError) {
          logger.authError('Failed to create OAuth profile', profileError, {
            component: 'AuthCallback',
            data: { userId: user.id }
          });
          throw profileError;
        }
        
        logger.authInfo('OAuth Strava profile created successfully', {
          component: 'AuthCallback',
          data: { userId: user.id }
        });
        
      } else {
        // Usuario existente - actualizar tokens de Strava
        logger.authInfo('Existing user found, updating Strava tokens', {
          component: 'AuthCallback',
          data: { userId: user.id }
        });
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            strava_access_token: tokenData.access_token,
            strava_refresh_token: tokenData.refresh_token,
            strava_token_expires_at: tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : null,
            auth_provider: 'strava'
          })
          .eq('id', user.id);

        if (updateError) {
          logger.authError('Failed to update Strava tokens', updateError, {
            component: 'AuthCallback',
            data: { userId: user.id }
          });
          // No lanzar error, continuar con el flujo
        } else {
          logger.authInfo('Strava tokens updated successfully', {
            component: 'AuthCallback',
            data: { userId: user.id }
          });
        }
      }
    } catch (error) {
      logger.authError('Failed to ensure Strava profile', error as Error, {
        component: 'AuthCallback',
        data: { userId: user?.id }
      });
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="text-center p-8">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Conectando con Strava...</h2>
            <p className="text-gray-600">{message || 'Procesando tu autenticación'}</p>
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
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
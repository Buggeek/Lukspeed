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
      logger.authInfo('Iniciando procesamiento de callback OAuth de Strava', {
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
        logger.authError('Error de autorización recibido de Strava', new Error(error), {
          component: 'AuthCallback',
          data: { error, state }
        });
        throw new Error(`Error de autorización de Strava: ${error}`);
      }
      
      if (!code) {
        logger.authError('No se recibió código de autorización de Strava', new Error('Falta parámetro code'), {
          component: 'AuthCallback',
          data: { urlParams: Object.fromEntries(urlParams.entries()) }
        });
        throw new Error('No se recibió código de autorización de Strava');
      }
      
      logger.authInfo('Código de autorización recibido exitosamente', {
        component: 'AuthCallback',
        data: { codeLength: code.length, state }
      });
      
      setMessage('Intercambiando código por tokens...');
      
      // Exchange code for tokens using our edge function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        logger.authError('Timeout en intercambio de tokens', new Error('Request timeout'), {
          component: 'AuthCallback'
        });
      }, 15000); // 15 second timeout
      
      let exchangeResponse;
      try {
        exchangeResponse = await fetch('https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/app_dbd0941867_strava_exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            state: state
          }),
          signal: controller.signal
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout: La solicitud tardó demasiado. Intenta de nuevo.');
        }
        throw new Error(`Error de conexión: ${fetchError.message}`);
      }
      
      clearTimeout(timeoutId);
      
      if (!exchangeResponse.ok) {
        const errorText = await exchangeResponse.text();
        logger.authError('Fallo en intercambio de tokens', new Error(errorText), {
          component: 'AuthCallback',
          data: { 
            status: exchangeResponse.status, 
            statusText: exchangeResponse.statusText,
            errorText 
          }
        });
        
        // Provide more specific error messages
        if (exchangeResponse.status === 400) {
          throw new Error('Código de autorización inválido o expirado. Intenta conectar de nuevo.');
        } else if (exchangeResponse.status === 500) {
          throw new Error('Error del servidor. Por favor intenta de nuevo en unos momentos.');
        } else {
          throw new Error(`Error ${exchangeResponse.status}: ${errorText}`);
        }
      }
      
      const exchangeData = await exchangeResponse.json();
      logger.authInfo('Intercambio de tokens exitoso', {
        component: 'AuthCallback',
        data: {
          athleteId: exchangeData.athlete?.id,
          hasAccessToken: !!exchangeData.access_token,
          hasRefreshToken: !!exchangeData.refresh_token,
          hasSession: !!exchangeData.session,
          success: exchangeData.success
        }
      });
      
      setMessage('Estableciendo sesión...');
      
      // Set the session in Supabase client
      if (exchangeData.session && exchangeData.session.access_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: exchangeData.session.access_token,
          refresh_token: exchangeData.session.refresh_token
        });
        
        if (sessionError) {
          logger.authError('Fallo al establecer sesión', sessionError, {
            component: 'AuthCallback'
          });
          throw new Error(`Error estableciendo sesión: ${sessionError.message}`);
        }
        
        logger.authInfo('Sesión establecida exitosamente', {
          component: 'AuthCallback',
          data: {
            userId: exchangeData.user?.id,
            athleteName: `${exchangeData.athlete?.firstname} ${exchangeData.athlete?.lastname}`.trim()
          }
        });
      } else {
        // Fallback: sign in anonymously and rely on profile data
        logger.authInfo('Creando sesión anónima como fallback', {
          component: 'AuthCallback'
        });
        
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        
        if (authError) {
          logger.authError('Fallo al crear sesión fallback', authError, {
            component: 'AuthCallback'
          });
          throw new Error(`Error creando sesión: ${authError.message}`);
        }
        
        logger.authInfo('Sesión fallback creada', {
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
      logger.authError('Fallo en procesamiento de callback de autenticación', error, {
        component: 'AuthCallback',
        data: {
          userAgent: navigator.userAgent,
          currentUrl: window.location.href,
          errorMessage: error.message
        }
      });
      
      setStatus('error');
      
      // User-friendly error messages in Spanish
      let userMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      } else if (error.message.includes('timeout')) {
        userMessage = 'La conexión tardó demasiado. Intenta de nuevo.';
      } else if (error.message.includes('authorization')) {
        userMessage = 'Error en la autorización. Intenta conectar con Strava de nuevo.';
      }
      
      setMessage(userMessage);
      
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
            <div className="mt-4 text-sm text-gray-500">
              <p>Este proceso puede tomar unos segundos</p>
            </div>
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
            <p className="text-gray-600 text-sm mb-4">{message}</p>
            <div className="text-xs text-gray-500">
              <p>Redirigiendo en 5 segundos...</p>
              <p className="mt-2">Si el problema persiste, intenta cerrar y abrir tu navegador</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
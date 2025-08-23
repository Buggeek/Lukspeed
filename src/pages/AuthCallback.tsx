import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      console.log('🔄 Procesando callback OAuth de Strava...');
      
      // Obtener la sesión desde la URL
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Error obteniendo sesión:', error);
        throw error;
      }

      if (session?.user) {
        console.log('✅ Usuario autenticado:', {
          id: session.user.id,
          email: session.user.email,
          provider: session.user.app_metadata?.provider
        });
        
        // Verificar si es OAuth de Strava
        const isStravaUser = session.user.app_metadata?.provider === 'strava';
        
        if (isStravaUser) {
          console.log('✅ Usuario OAuth Strava detectado');
          
          // Extraer datos de Strava
          const stravaData = {
            athlete_id: session.user.user_metadata?.provider_id,
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token,
            expires_at: session.provider_expires_at
          };
          
          console.log('📊 Datos Strava extraídos:', stravaData);
          
          // Crear o actualizar perfil
          await ensureStravaProfile(session.user, stravaData);
          
          setStatus('success');
          setMessage('¡Conectado con Strava exitosamente! Redirigiendo al dashboard narrativo...');
          
          // Redirigir al dashboard narrativo
          setTimeout(() => {
            navigate('/narrative');
          }, 2000);
          
        } else {
          // Usuario de email/password tradicional
          console.log('📧 Usuario email tradicional');
          setStatus('success');
          setMessage('¡Autenticación exitosa! Redirigiendo...');
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else {
        throw new Error('No se encontró sesión activa después del OAuth');
      }

    } catch (error: any) {
      console.error('❌ Error en callback OAuth:', error);
      setStatus('error');
      setMessage(error.message || 'Error procesando autenticación con Strava');
      
      // Redirigir a auth después de mostrar error
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  };

  const ensureStravaProfile = async (user: any, stravaData: any) => {
    try {
      // Verificar si ya existe perfil
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Crear perfil nuevo para usuario OAuth Strava
        console.log('🆕 Creando perfil para usuario OAuth Strava...');
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
            strava_athlete_id: stravaData.athlete_id?.toString(),
            strava_access_token: stravaData.access_token,
            strava_refresh_token: stravaData.refresh_token,
            strava_token_expires_at: stravaData.expires_at ? new Date(stravaData.expires_at * 1000).toISOString() : null,
            auth_provider: 'strava',
            created_at: new Date().toISOString(),
            onboarding_completed: true // Para usuarios OAuth, completar onboarding automáticamente
          });

        if (profileError) {
          console.error('❌ Error creando perfil OAuth:', profileError);
          throw profileError;
        }
        
        console.log('✅ Perfil OAuth Strava creado exitosamente');
        
      } else {
        // Usuario existente - actualizar tokens de Strava
        console.log('🔄 Usuario existente, actualizando tokens Strava...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            strava_access_token: stravaData.access_token,
            strava_refresh_token: stravaData.refresh_token,
            strava_token_expires_at: stravaData.expires_at ? new Date(stravaData.expires_at * 1000).toISOString() : null,
            auth_provider: 'strava'
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ Error actualizando tokens Strava:', updateError);
          // No lanzar error, continuar con el flujo
        } else {
          console.log('✅ Tokens Strava actualizados exitosamente');
        }
      }
    } catch (error) {
      console.error('❌ Error asegurando perfil Strava:', error);
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
            <p className="text-gray-600">Procesando tu autenticación</p>
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
            <p className="text-gray-600">Redirigiendo al dashboard...</p>
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
            <p className="text-gray-600">Redirigiendo para intentar de nuevo...</p>
          </>
        )}
      </div>
    </div>
  );
}
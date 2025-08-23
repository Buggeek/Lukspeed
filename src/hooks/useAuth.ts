import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email, session?.user?.app_metadata?.provider);
        
        if (session?.user) {
          setUser(session.user);
          
          // Si es primera vez con OAuth Strava, asegurar perfil
          if (event === 'SIGNED_IN' && session.user.app_metadata?.provider === 'strava') {
            await ensureOAuthProfile(session.user, session);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        console.log('✅ Sesión inicial encontrada:', {
          email: session.user.email,
          provider: session.user.app_metadata?.provider
        });
      }
    } catch (error) {
      console.error('❌ Error obteniendo sesión inicial:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureOAuthProfile = async (user: User, session: any) => {
    try {
      console.log('🔄 Verificando perfil OAuth para usuario:', user.id);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log('🆕 Creando perfil OAuth automático...');
        
        const stravaData = {
          athlete_id: user.user_metadata?.provider_id,
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token,
          expires_at: session.provider_expires_at
        };

        await supabase
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
            onboarding_completed: true
          });
        
        console.log('✅ Perfil OAuth creado automáticamente');
      } else {
        console.log('✅ Perfil OAuth ya existe');
      }
    } catch (error) {
      console.error('❌ Error asegurando perfil OAuth:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      console.log('✅ Usuario desconectado exitosamente');
    } catch (error) {
      console.error('❌ Error desconectando usuario:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
    isStravaUser: user?.app_metadata?.provider === 'strava'
  };
}
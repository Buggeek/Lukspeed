import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { logger } from '@/services/Logger';

interface UserProfile {
  user_id: string;
  strava_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  weight?: number;
  height?: number;
  ftp?: number;
  max_hr?: number;
  profile_complete?: boolean;
  preferred_units?: 'metric' | 'imperial';
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    profile: null
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
        return;
      }

      const user = session?.user || null;
      let profile = null;

      if (user) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        profile = profileData;
      }

      setAuthState({
        user,
        loading: false,
        isAuthenticated: !!user,
        profile
      });
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        const user = session?.user || null;
        let profile = null;

        if (user) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          profile = profileData;
        }

        setAuthState({
          user,
          loading: false,
          isAuthenticated: !!user,
          profile
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const connectStrava = async () => {
    logger.stravaInfo('Starting Strava connection process');
    
    try {
      // First ensure user is authenticated
      logger.stravaDebug('Checking user session');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        logger.stravaError('User not authenticated - no session found');
        throw new Error('User not authenticated');
      }
      
      logger.stravaInfo('User session found', { 
        userId: session.user?.id,
        hasAccessToken: !!session.access_token 
      });

      // Get Strava auth URL
      const url = 'https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/strava_oauth?action=get_auth_url';
      const payload = {
        user_token: session.access_token,
        redirect_uri: `${window.location.origin}/auth/callback`
      };

      logger.stravaDebug('Making request to get Strava auth URL', {
        url,
        payload: { ...payload, user_token: '[REDACTED]' }
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      logger.stravaDebug('Received response from auth URL endpoint', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.stravaError('Failed to get Strava auth URL', new Error(errorText), {
          status: response.status,
          statusText: response.statusText,
          responseBody: errorText
        });
        throw new Error(`Failed to get Strava auth URL: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      logger.stravaInfo('Successfully got Strava auth URL', {
        hasAuthUrl: !!responseData.auth_url
      });
      
      if (!responseData.auth_url) {
        logger.stravaError('No auth_url in response', new Error('Invalid response'), responseData);
        throw new Error('No auth URL received from server');
      }

      logger.stravaInfo('Redirecting to Strava OAuth', {
        authUrl: responseData.auth_url
      });
      
      // Redirect to Strava
      window.location.href = responseData.auth_url;
      
    } catch (error) {
      logger.stravaError('Error in connectStrava process', error as Error, {
        userAgent: navigator.userAgent,
        currentUrl: window.location.href
      });
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!authState.user) return;

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authState.user.id)
      .single();

    setAuthState(prev => ({
      ...prev,
      profile: profileData
    }));
  };

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    connectStrava,
    refreshProfile
  };
}
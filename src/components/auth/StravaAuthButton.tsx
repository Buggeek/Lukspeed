import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { logger } from '@/services/Logger';

export default function StravaAuthButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleStravaAuth = async () => {
    const timerId = logger.startTimer('Strava OAuth Initialization');
    
    try {
      setIsLoading(true);
      logger.authInfo('Starting manual Strava OAuth process', {
        component: 'StravaAuthButton',
        action: 'handleStravaAuth'
      });
      
      // OAuth directo con Strava usando configuración manual
      const stravaClientId = '43486'; // From .env VITE_STRAVA_CLIENT_ID
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
      const scopes = encodeURIComponent('read,activity:read_all');
      const state = encodeURIComponent(Math.random().toString(36).substring(7));
      
      // Store state for validation (optional)
      sessionStorage.setItem('strava_oauth_state', decodeURIComponent(state));
      
      // Manual Strava OAuth URL construction
      const stravaAuthUrl = `https://www.strava.com/oauth/authorize?` +
        `client_id=${stravaClientId}&` +
        `response_type=code&` +
        `redirect_uri=${redirectUri}&` +
        `approval_prompt=force&` +
        `scope=${scopes}&` +
        `state=${state}`;
      
      logger.authInfo('Redirecting to Strava OAuth', {
        component: 'StravaAuthButton',
        action: 'redirect',
        data: {
          clientId: stravaClientId,
          redirectUri: decodeURIComponent(redirectUri),
          scopes: decodeURIComponent(scopes),
          state: decodeURIComponent(state)
        }
      });
      
      logger.endTimer(timerId, 'auth', 'Strava OAuth Initialization');
      
      // Redirect to Strava directly
      window.location.href = stravaAuthUrl;
      
    } catch (error) {
      logger.authError('Failed to initiate Strava OAuth', error as Error, {
        component: 'StravaAuthButton',
        action: 'handleStravaAuth',
        data: {
          userAgent: navigator.userAgent,
          currentUrl: window.location.href
        }
      });
      
      alert('Error conectando con Strava. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStravaAuth}
      disabled={isLoading}
      className="w-full bg-[#FC4C02] hover:bg-[#E33E00] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Conectando con Strava...
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <img 
            src="https://d3nn82uaxijpm6.cloudfront.net/favicon.ico" 
            alt="Strava"
            className="w-5 h-5"
          />
          Conectar con Strava
        </div>
      )}
    </Button>
  );
}
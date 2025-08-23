import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function StravaAuthButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleStravaAuth = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Iniciando OAuth con Strava...');
      
      // OAuth directo con Strava
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'strava',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read,activity:read_all'
        }
      });

      if (error) {
        console.error('❌ Error OAuth Strava:', error);
        throw error;
      }

      console.log('✅ OAuth iniciado, redirigiendo...');

    } catch (error) {
      console.error('❌ Error iniciando OAuth:', error);
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
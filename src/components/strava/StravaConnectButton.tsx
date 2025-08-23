import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface StravaConnectButtonProps {
  onConnect?: () => void;
  isConnected?: boolean;
}

export function StravaConnectButton({ onConnect, isConnected = false }: StravaConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectStrava } = useAuth();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectStrava();
      onConnect?.();
    } catch (error) {
      console.error('Failed to connect to Strava:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to Strava');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-5.15 10.173h3.066"/>
            </svg>
            Connected to Strava
          </CardTitle>
          <CardDescription>
            Your Strava account is successfully connected. You can now sync your activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            Sync Activities
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-5.15 10.173h3.066"/>
          </svg>
          Connect to Strava
        </CardTitle>
        <CardDescription>
          Connect your Strava account to import your cycling activities and start analyzing your performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect with Strava
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
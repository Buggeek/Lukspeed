import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebhookDashboard from '@/components/admin/WebhookDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/services/Logger';

export default function WebhookAdminPage() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      logger.uiInfo('Checking webhook admin authorization', {
        component: 'WebhookAdminPage',
        action: 'checkAuthorization'
      });

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        logger.uiError('No authenticated user found', error || new Error('No user'), {
          component: 'WebhookAdminPage'
        });
        navigate('/auth');
        return;
      }

      // For now, allow any authenticated user to access webhook admin
      // In production, you might want to check for specific roles or permissions
      setAuthorized(true);
      
      logger.uiInfo('Webhook admin authorization granted', {
        component: 'WebhookAdminPage',
        data: { userId: user.id }
      });

    } catch (error) {
      logger.uiError('Authorization check failed', error as Error, {
        component: 'WebhookAdminPage'
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto animate-pulse text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the webhook admin panel.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-orange-500" />
            <h1 className="text-3xl font-bold">Webhook Administration</h1>
          </div>
          <p className="text-muted-foreground">
            Manage Strava webhook subscriptions and monitor real-time activity synchronization
          </p>
        </div>

        <WebhookDashboard />
      </div>
    </div>
  );
}
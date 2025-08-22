import React from 'react';
import { OnboardingDashboard } from '@/components/OnboardingDashboard';
import { useOnboardingAlerts } from '@/hooks/useOnboardingAlerts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function OnboardingPage() {
  const { alerts, dismissAlert } = useOnboardingAlerts();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuración Inicial</h1>
        <p className="text-muted-foreground">
          Configura tu cuenta y conecta Strava para comenzar a analizar tus entrenamientos
        </p>
      </div>

      {/* Alertas activas */}
      {alerts.map(alert => (
        <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription className="flex justify-between items-center">
            <div>
              <strong>{alert.title}:</strong> {alert.message}
            </div>
            <div className="flex gap-2">
              {alert.actionLabel && alert.actionHandler && (
                <Button size="sm" variant="outline" onClick={alert.actionHandler}>
                  {alert.actionLabel}
                </Button>
              )}
              {alert.dismissible && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ))}

      <OnboardingDashboard />
    </div>
  );
}
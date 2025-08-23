import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Webhook,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { StravaWebhookService, WebhookStats, WebhookSubscription } from '@/services/StravaWebhookService';
import { logger } from '@/services/Logger';

export default function WebhookDashboard() {
  const [subscription, setSubscription] = useState<WebhookSubscription | null>(null);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      logger.uiInfo('Loading webhook dashboard data', {
        component: 'WebhookDashboard',
        action: 'loadDashboardData'
      });

      const [subscriptionResult, statsResult] = await Promise.all([
        StravaWebhookService.getSubscriptionStatus(),
        StravaWebhookService.getWebhookStats()
      ]);

      if (subscriptionResult.error) {
        throw new Error(subscriptionResult.error);
      }

      if (statsResult.error) {
        throw new Error(statsResult.error);
      }

      setSubscription(subscriptionResult.subscription || null);
      setStats(statsResult.stats || null);

    } catch (error) {
      logger.uiError('Failed to load webhook dashboard data', error as Error, {
        component: 'WebhookDashboard'
      });
      setMessage({ type: 'error', text: `Error loading data: ${(error as Error).message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    setActionLoading(true);
    setMessage(null);

    try {
      logger.uiInfo('Creating webhook subscription', {
        component: 'WebhookDashboard',
        action: 'handleCreateSubscription'
      });

      const result = await StravaWebhookService.createSubscription();

      if (result.success) {
        setSubscription(result.subscription || null);
        setMessage({ type: 'success', text: 'Webhook subscription created successfully!' });
        await loadDashboardData(); // Refresh data
      } else {
        throw new Error(result.error || 'Failed to create subscription');
      }

    } catch (error) {
      logger.uiError('Failed to create webhook subscription', error as Error, {
        component: 'WebhookDashboard'
      });
      setMessage({ type: 'error', text: `Error: ${(error as Error).message}` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!subscription) return;

    setActionLoading(true);
    setMessage(null);

    try {
      logger.uiInfo('Deleting webhook subscription', {
        component: 'WebhookDashboard',
        action: 'handleDeleteSubscription',
        data: { subscriptionId: subscription.strava_subscription_id }
      });

      const result = await StravaWebhookService.deleteSubscription(subscription.strava_subscription_id);

      if (result.success) {
        setSubscription(null);
        setMessage({ type: 'success', text: 'Webhook subscription deleted successfully!' });
        await loadDashboardData(); // Refresh data
      } else {
        throw new Error(result.error || 'Failed to delete subscription');
      }

    } catch (error) {
      logger.uiError('Failed to delete webhook subscription', error as Error, {
        component: 'WebhookDashboard'
      });
      setMessage({ type: 'error', text: `Error: ${(error as Error).message}` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryFailedJobs = async () => {
    setActionLoading(true);
    setMessage(null);

    try {
      logger.uiInfo('Retrying failed webhook jobs', {
        component: 'WebhookDashboard',
        action: 'handleRetryFailedJobs'
      });

      const result = await StravaWebhookService.retryFailedJobs();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Successfully retried ${result.retriedCount || 0} failed jobs!` 
        });
        await loadDashboardData(); // Refresh data
      } else {
        throw new Error(result.error || 'Failed to retry jobs');
      }

    } catch (error) {
      logger.uiError('Failed to retry webhook jobs', error as Error, {
        component: 'WebhookDashboard'
      });
      setMessage({ type: 'error', text: `Error: ${(error as Error).message}` });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      processing: 'secondary',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading webhook dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage Strava webhook subscriptions and events
          </p>
        </div>
        <Button 
          onClick={loadDashboardData}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_events}</div>
                  <p className="text-xs text-muted-foreground">
                    Webhook events received
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.success_rate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.processed_events} of {stats.total_events} processed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed Events</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.failed_events}</div>
                  <p className="text-xs text-muted-foreground">
                    Events that failed processing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avg_processing_time}s</div>
                  <p className="text-xs text-muted-foreground">
                    Average processing time
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Manage your Strava webhook subscription for real-time activity sync
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Active Subscription</span>
                    <Badge variant="outline">{subscription.status}</Badge>
                  </div>
                  
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscription ID:</span>
                      <span className="font-mono">{subscription.strava_subscription_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Callback URL:</span>
                      <span className="font-mono text-xs">{subscription.callback_url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(subscription.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDeleteSubscription}
                      variant="destructive"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Delete Subscription
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium">No Active Subscription</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Create a webhook subscription to enable automatic synchronization of 
                    new Strava activities in real-time.
                  </p>

                  <Button
                    onClick={handleCreateSubscription}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Create Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Recent Webhook Events</h3>
            {stats && stats.failed_events > 0 && (
              <Button
                onClick={handleRetryFailedJobs}
                variant="outline"
                size="sm"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Retry Failed Jobs
              </Button>
            )}
          </div>

          {stats && stats.recent_events.length > 0 ? (
            <div className="space-y-2">
              {stats.recent_events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{event.event_type}</Badge>
                            <span className="text-sm font-medium">
                              {event.object_type} {event.object_id}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Owner: {event.owner_id} • {formatDate(event.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(event.status)}
                        {event.processed && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No webhook events yet</h3>
                <p className="text-muted-foreground">
                  Webhook events will appear here when Strava activities are created or updated.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
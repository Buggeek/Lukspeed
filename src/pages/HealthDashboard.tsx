import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logger, LogLevel } from '@/services/Logger';
import { networkInterceptor } from '@/services/NetworkInterceptor';
import { supabase } from '@/lib/supabase';
import { 
  Activity, 
  Database, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Server
} from 'lucide-react';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  responseTime?: number;
  message?: string;
}

export default function HealthDashboard() {
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [logs, setLogs] = useState(logger.getLogs());
  const [networkLogs, setNetworkLogs] = useState(networkInterceptor.getNetworkLogs());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAllServices();
    const interval = setInterval(checkAllServices, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(logger.getLogs());
      setNetworkLogs(networkInterceptor.getNetworkLogs());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkAllServices = async () => {
    setLoading(true);
    const results: HealthStatus[] = [];

    // Check Supabase connection
    try {
      const start = performance.now();
      const { error } = await supabase.from('user_profiles').select('count').limit(1);
      const responseTime = performance.now() - start;
      
      results.push({
        service: 'Supabase Database',
        status: error ? 'error' : 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        message: error?.message
      });
    } catch (error) {
      results.push({
        service: 'Supabase Database',
        status: 'error',
        lastCheck: new Date().toISOString(),
        message: (error as Error).message
      });
    }

    // Check Strava API
    try {
      const start = performance.now();
      const response = await fetch('https://www.strava.com/api/v3/athlete', {
        method: 'HEAD'
      });
      const responseTime = performance.now() - start;
      
      results.push({
        service: 'Strava API',
        status: response.ok ? 'healthy' : 'warning',
        lastCheck: new Date().toISOString(),
        responseTime,
        message: response.ok ? undefined : `HTTP ${response.status}`
      });
    } catch (error) {
      results.push({
        service: 'Strava API',
        status: 'error',
        lastCheck: new Date().toISOString(),
        message: (error as Error).message
      });
    }

    // Check Edge Functions
    try {
      const start = performance.now();
      const response = await fetch('https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/strava_oauth', {
        method: 'OPTIONS'
      });
      const responseTime = performance.now() - start;
      
      results.push({
        service: 'Edge Functions',
        status: response.ok ? 'healthy' : 'warning',
        lastCheck: new Date().toISOString(),
        responseTime,
        message: response.ok ? undefined : `HTTP ${response.status}`
      });
    } catch (error) {
      results.push({
        service: 'Edge Functions',
        status: 'error',
        lastCheck: new Date().toISOString(),
        message: (error as Error).message
      });
    }

    // Network status
    results.push({
      service: 'Network Connection',
      status: navigator.onLine ? 'healthy' : 'error',
      lastCheck: new Date().toISOString(),
      message: navigator.onLine ? 'Online' : 'Offline'
    });

    setHealthStatuses(results);
    setLoading(false);

    // Log the health check
    logger.info('HEALTH_CHECK', 'Services health check completed', {
      results: results.map(r => ({ service: r.service, status: r.status }))
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const errorLogs = logs.filter(log => log.level >= LogLevel.ERROR);
  const recentLogs = logs.slice(0, 20);
  const failedRequests = networkLogs.responses.filter(r => r.status >= 400);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sistema de Salud</h1>
        <Button onClick={checkAllServices} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthStatuses.map((status) => (
          <Card key={status.service}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {getStatusIcon(status.status)}
                <Badge className={getStatusColor(status.status)}>
                  {status.status}
                </Badge>
              </div>
              <h3 className="font-medium text-sm">{status.service}</h3>
              {status.responseTime && (
                <p className="text-xs text-gray-500">
                  {status.responseTime.toFixed(0)}ms
                </p>
              )}
              {status.message && (
                <p className="text-xs text-red-600 mt-1">{status.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(status.lastCheck).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <div className="text-xs text-red-600">
              {errorLogs.length} errores
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Requests HTTP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkLogs.responses.length}</div>
            <div className="text-xs text-red-600">
              {failedRequests.length} fallidas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Estado de Red</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {navigator.onLine ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <span className="text-red-600">Offline</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Logs */}
      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Errores ({errorLogs.length})</TabsTrigger>
          <TabsTrigger value="recent">Logs Recientes</TabsTrigger>
          <TabsTrigger value="network">Red ({failedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Errores del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {errorLogs.map(log => (
                    <div key={log.id} className="border rounded p-3 bg-red-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive" className="text-xs">
                          {LogLevel[log.level]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {log.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.message}</p>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer">Datos</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.stack && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer">Stack</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Logs Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {recentLogs.map(log => (
                    <div key={log.id} className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {LogLevel[log.level]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {log.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requests Fallidas</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {failedRequests.map(req => (
                    <div key={req.requestId} className="border rounded p-3 bg-red-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive" className="text-xs">
                          {req.status}
                        </Badge>
                        <span className="text-sm font-medium">{req.statusText}</span>
                        <span className="text-xs text-gray-500">
                          {req.duration.toFixed(0)}ms
                        </span>
                      </div>
                      {req.body && (
                        <details>
                          <summary className="text-xs cursor-pointer">Response</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(req.body, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
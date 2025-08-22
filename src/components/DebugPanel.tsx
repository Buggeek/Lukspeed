import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { logger, LogLevel } from '@/services/Logger';
import { networkInterceptor } from '@/services/NetworkInterceptor';
import { 
  Bug, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Network,
  Activity,
  AlertTriangle,
  Info,
  XCircle
} from 'lucide-react';

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState(logger.getLogs());
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLogs(logger.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => {
    if (selectedLevel !== 'all' && log.level !== parseInt(selectedLevel)) {
      return false;
    }
    if (selectedCategory !== 'all' && log.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const categories = Array.from(new Set(logs.map(log => log.category)));

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG: return <Bug className="h-3 w-3 text-gray-500" />;
      case LogLevel.INFO: return <Info className="h-3 w-3 text-blue-500" />;
      case LogLevel.WARN: return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case LogLevel.ERROR: return <XCircle className="h-3 w-3 text-red-500" />;
      case LogLevel.FATAL: return <XCircle className="h-3 w-3 text-red-700" />;
      default: return null;
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG: return 'text-gray-600 bg-gray-100';
      case LogLevel.INFO: return 'text-blue-600 bg-blue-100';
      case LogLevel.WARN: return 'text-yellow-600 bg-yellow-100';
      case LogLevel.ERROR: return 'text-red-600 bg-red-100';
      case LogLevel.FATAL: return 'text-red-700 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportLogs = () => {
    const logs = logger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lukspeed-debug-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    logger.clearLogs();
    networkInterceptor.clearNetworkLogs();
    setLogs([]);
  };

  const refreshLogs = () => {
    setLogs(logger.getLogs());
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(!isVisible)}
          size="sm"
          variant={isVisible ? "default" : "outline"}
          className="shadow-lg"
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          Debug
        </Button>
      </div>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 w-96 h-96 z-50 shadow-2xl">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Debug Panel
                </CardTitle>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={refreshLogs}
                    className="h-6 w-6 p-0"
                  >
                    <Activity className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={exportLogs}
                    className="h-6 w-6 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={clearLogs}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsVisible(false)}
                    className="h-6 w-6 p-0"
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 h-full">
              <Tabs defaultValue="logs" className="h-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="logs" className="text-xs">Logs ({filteredLogs.length})</TabsTrigger>
                  <TabsTrigger value="network" className="text-xs">Network</TabsTrigger>
                </TabsList>
                
                <TabsContent value="logs" className="mt-2 h-5/6">
                  <div className="space-y-2 mb-2">
                    <div className="flex gap-2">
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value={LogLevel.DEBUG.toString()}>Debug</SelectItem>
                          <SelectItem value={LogLevel.INFO.toString()}>Info</SelectItem>
                          <SelectItem value={LogLevel.WARN.toString()}>Warn</SelectItem>
                          <SelectItem value={LogLevel.ERROR.toString()}>Error</SelectItem>
                          <SelectItem value={LogLevel.FATAL.toString()}>Fatal</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <ScrollArea className="h-64">
                    <div className="space-y-1">
                      {filteredLogs.map(log => (
                        <div key={log.id} className="text-xs border rounded p-2 space-y-1">
                          <div className="flex items-center gap-2">
                            {getLevelIcon(log.level)}
                            <Badge variant="secondary" className={`text-xs px-1 py-0 ${getLevelColor(log.level)}`}>
                              {LogLevel[log.level]}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {log.category}
                            </Badge>
                            <span className="text-gray-500 text-xs">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                          <div className="font-medium">{log.message}</div>
                          {log.data && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-gray-600">Data</summary>
                              <pre className="mt-1 bg-gray-50 p-1 rounded overflow-auto max-h-20">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                          {log.stack && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-red-600">Stack Trace</summary>
                              <pre className="mt-1 bg-red-50 p-1 rounded overflow-auto max-h-20 text-xs">
                                {log.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="network" className="mt-2 h-5/6">
                  <ScrollArea className="h-80">
                    <div className="space-y-1">
                      {networkInterceptor.getNetworkLogs().responses.map(response => (
                        <div key={response.requestId} className="text-xs border rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={response.status >= 400 ? "destructive" : "secondary"}
                              className="text-xs px-1 py-0"
                            >
                              {response.status}
                            </Badge>
                            <span className="text-gray-500">
                              {response.duration.toFixed(0)}ms
                            </span>
                            <span className="text-gray-500">
                              {formatTimestamp(response.timestamp)}
                            </span>
                          </div>
                          {response.body && (
                            <details className="text-xs">
                              <summary className="cursor-pointer">Response</summary>
                              <pre className="mt-1 bg-gray-50 p-1 rounded overflow-auto max-h-20">
                                {JSON.stringify(response.body, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
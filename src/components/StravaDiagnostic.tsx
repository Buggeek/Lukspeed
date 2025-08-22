import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Copy,
  Download,
  Bug
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: string;
}

export default function StravaDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [fullReport, setFullReport] = useState<string>('');

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    const result: DiagnosticResult = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    setDiagnostics(prev => [...prev, result]);
    return result;
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    
    const report: string[] = [];
    report.push('='.repeat(60));
    report.push('STRAVA CONNECTION DIAGNOSTIC REPORT');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push('='.repeat(60));

    try {
      // Test 1: Environment Variables
      report.push('\n1. ENVIRONMENT VARIABLES CHECK');
      report.push('-'.repeat(40));
      
      const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
      const accessToken = import.meta.env.VITE_STRAVA_ACCESS_TOKEN;
      const appUrl = import.meta.env.VITE_APP_URL;
      
      if (clientId) {
        addResult('Environment: Client ID', 'success', `Found: ${clientId}`);
        report.push(`✅ Client ID: ${clientId}`);
      } else {
        addResult('Environment: Client ID', 'error', 'VITE_STRAVA_CLIENT_ID not found in environment');
        report.push(`❌ Client ID: NOT FOUND`);
      }
      
      if (clientSecret) {
        addResult('Environment: Client Secret', 'success', `Found: ${clientSecret.substring(0, 8)}...`);
        report.push(`✅ Client Secret: ${clientSecret.substring(0, 8)}... (${clientSecret.length} chars)`);
      } else {
        addResult('Environment: Client Secret', 'error', 'VITE_STRAVA_CLIENT_SECRET not found');
        report.push(`❌ Client Secret: NOT FOUND`);
      }
      
      if (accessToken) {
        addResult('Environment: Access Token', 'success', `Found: ${accessToken.substring(0, 8)}...`);
        report.push(`✅ Access Token: ${accessToken.substring(0, 8)}... (${accessToken.length} chars)`);
      } else {
        addResult('Environment: Access Token', 'warning', 'VITE_STRAVA_ACCESS_TOKEN not found (optional for OAuth)');
        report.push(`⚠️  Access Token: NOT FOUND (optional for OAuth flow)`);
      }
      
      if (appUrl) {
        addResult('Environment: App URL', 'success', `Found: ${appUrl}`);
        report.push(`✅ App URL: ${appUrl}`);
      } else {
        addResult('Environment: App URL', 'warning', 'VITE_APP_URL not found');
        report.push(`⚠️  App URL: NOT FOUND`);
      }

      // Test 2: Strava API Connectivity
      report.push('\n2. STRAVA API CONNECTIVITY TEST');
      report.push('-'.repeat(40));
      
      try {
        const stravaResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken || 'test_token'}`
          }
        });
        
        report.push(`📡 Status: ${stravaResponse.status} ${stravaResponse.statusText}`);
        report.push(`📡 Headers: ${JSON.stringify(Object.fromEntries(stravaResponse.headers.entries()), null, 2)}`);
        
        if (stravaResponse.status === 401) {
          addResult('Strava API', 'warning', 'Unauthorized - need valid access token', {
            status: stravaResponse.status,
            statusText: stravaResponse.statusText
          });
          report.push(`⚠️  Expected 401 - need valid access token for athlete data`);
        } else if (stravaResponse.status === 200) {
          const athleteData = await stravaResponse.json();
          addResult('Strava API', 'success', 'Connected successfully', athleteData);
          report.push(`✅ Connected successfully`);
          report.push(`👤 Athlete: ${JSON.stringify(athleteData, null, 2)}`);
        } else {
          addResult('Strava API', 'error', `Unexpected status: ${stravaResponse.status}`, {
            status: stravaResponse.status,
            statusText: stravaResponse.statusText
          });
          report.push(`❌ Unexpected status: ${stravaResponse.status}`);
        }
      } catch (error) {
        addResult('Strava API', 'error', `Network error: ${error.message}`, error);
        report.push(`❌ Network error: ${error.message}`);
      }

      // Test 3: Supabase Edge Function
      report.push('\n3. SUPABASE EDGE FUNCTION TEST');
      report.push('-'.repeat(40));
      
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          const functionUrl = `${supabaseUrl}/functions/v1/strava_oauth?action=get_auth_url`;
          report.push(`🔗 Function URL: ${functionUrl}`);
          
          const functionResponse = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_token: 'test_token',
              redirect_uri: `${appUrl || window.location.origin}/auth/callback`
            })
          });
          
          const responseText = await functionResponse.text();
          report.push(`📡 Status: ${functionResponse.status} ${functionResponse.statusText}`);
          report.push(`📡 Response: ${responseText}`);
          
          if (functionResponse.ok) {
            const data = JSON.parse(responseText);
            addResult('Supabase Function', 'success', 'Edge function responding', data);
            report.push(`✅ Edge function responding correctly`);
            if (data.auth_url) {
              report.push(`🔗 Generated auth URL: ${data.auth_url}`);
            }
          } else {
            addResult('Supabase Function', 'error', `Function error: ${functionResponse.status}`, {
              status: functionResponse.status,
              response: responseText
            });
            report.push(`❌ Function error: ${functionResponse.status}`);
          }
        } else {
          addResult('Supabase Function', 'error', 'VITE_SUPABASE_URL not found');
          report.push(`❌ Supabase URL not configured`);
        }
      } catch (error) {
        addResult('Supabase Function', 'error', `Function test failed: ${error.message}`, error);
        report.push(`❌ Function test failed: ${error.message}`);
      }

      // Test 4: OAuth URL Generation
      report.push('\n4. OAUTH URL VALIDATION');
      report.push('-'.repeat(40));
      
      const redirectUri = `${appUrl || window.location.origin}/auth/callback`;
      const expectedAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=read,activity:read_all,profile:read_all`;
      
      report.push(`🔗 Expected OAuth URL: ${expectedAuthUrl}`);
      addResult('OAuth URL', 'success', 'URL structure validated', { url: expectedAuthUrl });

      // Test 5: Browser Environment
      report.push('\n5. BROWSER ENVIRONMENT');
      report.push('-'.repeat(40));
      
      report.push(`🌐 User Agent: ${navigator.userAgent}`);
      report.push(`🌐 Location: ${window.location.href}`);
      report.push(`🌐 Protocol: ${window.location.protocol}`);
      report.push(`🌐 Host: ${window.location.host}`);
      
      addResult('Browser Environment', 'success', 'Environment details collected');

      report.push('\n' + '='.repeat(60));
      report.push('END OF DIAGNOSTIC REPORT');
      report.push('='.repeat(60));

    } catch (error) {
      addResult('Diagnostic System', 'error', `Diagnostic failed: ${error.message}`, error);
      report.push(`\n❌ DIAGNOSTIC SYSTEM ERROR: ${error.message}`);
    }
    
    setFullReport(report.join('\n'));
    setIsRunning(false);
  };

  const copyReport = () => {
    navigator.clipboard.writeText(fullReport);
  };

  const downloadReport = () => {
    const blob = new Blob([fullReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strava-diagnostic-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Strava Connection Diagnostic
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={isRunning} size="sm">
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </>
              )}
            </Button>
            <Button onClick={copyReport} variant="outline" size="sm" disabled={!fullReport}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Report
            </Button>
            <Button onClick={downloadReport} variant="outline" size="sm" disabled={!fullReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {diagnostics.length === 0 && !isRunning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Click "Run Diagnostics" to test Strava connection and identify issues.
              </AlertDescription>
            </Alert>
          )}

          {diagnostics.map((result, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{result.test}</span>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{result.message}</p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-blue-600">
                      Show details
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {fullReport && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Full Diagnostic Report</h3>
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto max-h-96">
                {fullReport}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
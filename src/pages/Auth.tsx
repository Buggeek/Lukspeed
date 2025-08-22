import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Mail, Lock, Loader2 } from 'lucide-react';

export default function Auth() {
  const { signInWithEmail, signUpWithEmail, connectStrava } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (error) throw error;

      if (isSignUp && data.user && !data.session) {
        setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
      }
    } catch (error: any) {
      setError(error.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleStravaConnect = async () => {
    setLoading(true);
    setError('');

    try {
      await connectStrava();
    } catch (error: any) {
      setError(error.message || 'Error conectando con Strava');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">LukSpeed</h1>
          </div>
          <p className="text-gray-600">Análisis avanzado de rendimiento ciclista</p>
        </div>

        {/* Strava Connect - Primary Option */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg">Conectar con Strava</CardTitle>
            <p className="text-sm text-gray-600">Accede con tu cuenta de Strava para sincronizar tus datos</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleStravaConnect}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Conectar con Strava
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Email Auth - Alternative Option */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg">O crear cuenta con email</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleEmailAuth(false)}
                  disabled={loading || !email || !password}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="Crea una contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleEmailAuth(true)}
                  disabled={loading || !email || !password}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad.
        </div>
      </div>
    </div>
  );
}
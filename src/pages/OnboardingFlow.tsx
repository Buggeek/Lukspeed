import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Activity, 
  Bike, 
  Target, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Weight,
  Ruler
} from 'lucide-react';

interface PersonalProfile {
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  wingspan: number; // cm
  current_weight: number; // kg
}

interface CyclingProfile {
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  ftp: number;
  max_hr: number;
  resting_hr: number;
  cycling_goals: string[];
  units: 'metric' | 'imperial';
}

const CYCLING_GOALS = [
  'Mejorar resistencia',
  'Aumentar potencia',
  'Perder peso',
  'Competir en carreras',
  'Ciclismo recreativo',
  'Mejorar técnica',
  'Entrenamientos específicos',
  'Análisis de rendimiento'
];

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [personalProfile, setPersonalProfile] = useState<PersonalProfile>({
    birth_date: '',
    gender: 'male',
    height: 175,
    wingspan: 175,
    current_weight: 70
  });

  const [cyclingProfile, setCyclingProfile] = useState<CyclingProfile>({
    experience_level: 'intermediate',
    ftp: 250,
    max_hr: 180,
    resting_hr: 60,
    cycling_goals: [],
    units: 'metric'
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handlePersonalProfileChange = (field: keyof PersonalProfile, value: any) => {
    setPersonalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleCyclingProfileChange = (field: keyof CyclingProfile, value: any) => {
    setCyclingProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setCyclingProfile(prev => ({
      ...prev,
      cycling_goals: prev.cycling_goals.includes(goal)
        ? prev.cycling_goals.filter(g => g !== goal)
        : [...prev.cycling_goals, goal]
    }));
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          ...personalProfile,
          ...cyclingProfile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Add current weight to history
      const { error: weightError } = await supabase
        .from('weight_history')
        .insert({
          user_id: user.id,
          weight: personalProfile.current_weight,
          recorded_date: new Date().toISOString().split('T')[0],
          notes: 'Peso inicial del onboarding'
        });

      if (weightError) throw weightError;

      await refreshProfile();
      
      // Start Strava sync
      setCurrentStep(3);
      await startStravaSync();

    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Error guardando el perfil');
      setLoading(false);
    }
  };

  const startStravaSync = async () => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No hay sesión activa');
      }

      // Import bikes first
      const bikesResponse = await fetch('https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/strava_sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          action: 'import_bikes'
        })
      });

      if (!bikesResponse.ok) {
        throw new Error('Error importando bicicletas');
      }

      // Import activities
      const activitiesResponse = await fetch('https://tebrbispkzjtlilpquaz.supabase.co/functions/v1/strava_sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          action: 'import_activities'
        })
      });

      if (!activitiesResponse.ok) {
        throw new Error('Error importando actividades');
      }

      // Complete onboarding
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('Error in Strava sync:', error);
      setError(error.message || 'Error sincronizando con Strava');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderPersonalProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <User className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold">Perfil Personal</h2>
        <p className="text-gray-600">Información básica para calcular métricas personalizadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
          <Input
            id="birth_date"
            type="date"
            value={personalProfile.birth_date}
            onChange={(e) => handlePersonalProfileChange('birth_date', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Género</Label>
          <Select value={personalProfile.gender} onValueChange={(value) => handlePersonalProfileChange('gender', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Femenino</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Altura (cm)</Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={personalProfile.height}
              onChange={(e) => handlePersonalProfileChange('height', parseInt(e.target.value) || 0)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wingspan">Envergadura (cm)</Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="wingspan"
              type="number"
              placeholder="175"
              value={personalProfile.wingspan}
              onChange={(e) => handlePersonalProfileChange('wingspan', parseInt(e.target.value) || 0)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="current_weight">Peso Actual (kg)</Label>
          <div className="relative">
            <Weight className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="current_weight"
              type="number"
              step="0.1"
              placeholder="70.0"
              value={personalProfile.current_weight}
              onChange={(e) => handlePersonalProfileChange('current_weight', parseFloat(e.target.value) || 0)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCyclingProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Activity className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold">Perfil Ciclista</h2>
        <p className="text-gray-600">Datos específicos para análisis de rendimiento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experience_level">Nivel de Experiencia</Label>
          <Select value={cyclingProfile.experience_level} onValueChange={(value) => handleCyclingProfileChange('experience_level', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Principiante</SelectItem>
              <SelectItem value="intermediate">Intermedio</SelectItem>
              <SelectItem value="advanced">Avanzado</SelectItem>
              <SelectItem value="pro">Profesional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="units">Sistema de Unidades</Label>
          <Select value={cyclingProfile.units} onValueChange={(value) => handleCyclingProfileChange('units', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Métrico (km, kg)</SelectItem>
              <SelectItem value="imperial">Imperial (mi, lb)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ftp">FTP (Watts)</Label>
          <Input
            id="ftp"
            type="number"
            placeholder="250"
            value={cyclingProfile.ftp}
            onChange={(e) => handleCyclingProfileChange('ftp', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_hr">FC Máxima (bpm)</Label>
          <Input
            id="max_hr"
            type="number"
            placeholder="180"
            value={cyclingProfile.max_hr}
            onChange={(e) => handleCyclingProfileChange('max_hr', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="resting_hr">FC en Reposo (bpm)</Label>
          <Input
            id="resting_hr"
            type="number"
            placeholder="60"
            value={cyclingProfile.resting_hr}
            onChange={(e) => handleCyclingProfileChange('resting_hr', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Objetivos de Ciclismo</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CYCLING_GOALS.map((goal) => (
            <Badge
              key={goal}
              variant={cyclingProfile.cycling_goals.includes(goal) ? "default" : "outline"}
              className="cursor-pointer justify-center p-2 text-center"
              onClick={() => toggleGoal(goal)}
            >
              {goal}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSyncStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Bike className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold">Sincronizando con Strava</h2>
        <p className="text-gray-600">Importando tus bicicletas y actividades</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso de sincronización</span>
            <span>En proceso...</span>
          </div>
          <Progress value={60} className="w-full" />
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>✅ Bicicletas importadas</p>
          <p>🔄 Importando actividades...</p>
          <p>⏳ Calculando métricas avanzadas</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">LukSpeed</h1>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Paso {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        {/* Content */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {currentStep === 1 && renderPersonalProfileStep()}
            {currentStep === 2 && renderCyclingProfileStep()}
            {currentStep === 3 && renderSyncStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 3 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <Button
              onClick={currentStep === 2 ? saveProfile : nextStep}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : currentStep === 2 ? (
                <>
                  Completar Configuración
                  <Target className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
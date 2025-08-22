import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Share, 
  Copy,
  Trash2,
  Calculator,
  History,
  FileText
} from 'lucide-react';
import { BikeFitting } from '@/types/fitting';
import { AnthropometricProfile } from '@/types/profile';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import useBikeFitting from '@/hooks/useBikeFitting';
import FittingVisualization from '@/components/FittingVisualization';
import BikeFittingForm from '@/components/BikeFittingForm';

export default function FittingResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    fittings, 
    loadFittings, 
    deleteFitting, 
    compareFittings, 
    loading 
  } = useBikeFitting();

  const [currentFitting, setCurrentFitting] = useState<BikeFitting | null>(null);
  const [profile, setProfile] = useState<AnthropometricProfile | null>(null);
  const [previousFittings, setPreviousFittings] = useState<BikeFitting[]>([]);
  const [activeTab, setActiveTab] = useState('view');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      loadFittingData();
    }
  }, [id]);

  useEffect(() => {
    loadFittings();
  }, [loadFittings]);

  useEffect(() => {
    if (fittings.length > 0 && id) {
      const fitting = fittings.find(f => f.id === id);
      if (fitting) {
        setCurrentFitting(fitting);
        
        // Get previous fittings for comparison
        const otherFittings = fittings
          .filter(f => f.id !== id)
          .sort((a, b) => new Date(b.fitting_date || '').getTime() - new Date(a.fitting_date || '').getTime());
        setPreviousFittings(otherFittings);
      }
    }
  }, [fittings, id]);

  const loadFittingData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading fitting data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos del fitting",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab('edit');
  };

  const handleSave = (updatedFitting: BikeFitting) => {
    setCurrentFitting(updatedFitting);
    setIsEditing(false);
    setActiveTab('view');
    toast({
      title: "Fitting Actualizado",
      description: "Los cambios han sido guardados exitosamente.",
    });
  };

  const handleDelete = async () => {
    if (!currentFitting?.id) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este fitting?')) {
      const success = await deleteFitting(currentFitting.id);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  const handleDuplicate = async () => {
    if (!currentFitting) return;

    const duplicatedFitting = {
      ...currentFitting,
      id: undefined,
      fitting_name: `${currentFitting.fitting_name} (Copia)`,
      fitting_date: new Date().toISOString(),
      notes: `${currentFitting.notes ? currentFitting.notes + '\n\n' : ''}Duplicado de fitting anterior`
    };

    toast({
      title: "Fitting Duplicado",
      description: "Se ha creado una copia del fitting actual.",
    });
  };

  const handleExport = () => {
    if (!currentFitting) return;

    // Create a comprehensive report
    const reportData = {
      fitting: currentFitting,
      profile: profile,
      generated: new Date().toISOString(),
      comparison: previousFittings.length > 0 ? 
        compareFittings(currentFitting, previousFittings[0]) : null
    };

    // Convert to JSON and download
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `bike-fitting-${currentFitting.fitting_name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Fitting Exportado",
      description: "Los datos del fitting han sido descargados.",
    });
  };

  const handleShare = async () => {
    if (!currentFitting) return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace Copiado",
        description: "El enlace del fitting ha sido copiado al portapapeles.",
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderComparisonTab = () => {
    if (previousFittings.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay fittings previos</h3>
            <p className="text-gray-600">
              Este es tu primer fitting registrado. Los futuros fittings se compararán con este.
            </p>
          </CardContent>
        </Card>
      );
    }

    const comparison = compareFittings(currentFitting!, previousFittings[0]);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparación con Fitting Anterior</CardTitle>
            <p className="text-gray-600">
              Comparando con: {previousFittings[0].fitting_name} 
              ({new Date(previousFittings[0].fitting_date || '').toLocaleDateString()})
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-900 mb-3">
                {comparison.summary}
              </div>
              
              {comparison.changes.length > 0 ? (
                <div className="space-y-2">
                  {comparison.changes.map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {change.field.replace(/_/g, ' ').replace(/mm|deg/g, '').trim()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {change.old} → {change.new}
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        change.difference > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change.difference > 0 ? '+' : ''}{change.difference}
                        {change.field.includes('_mm') ? 'mm' : 
                         change.field.includes('_deg') ? '°' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No se detectaron cambios significativos
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Previous Fittings List */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Fittings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {previousFittings.slice(0, 5).map((fitting, index) => (
                <div key={fitting.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{fitting.fitting_name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(fitting.fitting_date || '').toLocaleDateString()} • {fitting.fitted_by}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/fitting/${fitting.id}`)}
                  >
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando fitting...</p>
        </div>
      </div>
    );
  }

  if (!currentFitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fitting no encontrado</h3>
            <p className="text-gray-600 mb-4">
              El fitting que buscas no existe o no tienes permisos para verlo.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentFitting.fitting_name}
                </h1>
                <p className="text-sm text-gray-600">
                  {new Date(currentFitting.fitting_date || '').toLocaleDateString()} • {currentFitting.fitted_by}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Compartir
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="view">Visualización</TabsTrigger>
            <TabsTrigger value="comparison">Comparación</TabsTrigger>
            {isEditing && <TabsTrigger value="edit">Editar</TabsTrigger>}
          </TabsList>

          <TabsContent value="view" className="mt-6">
            {profile ? (
              <FittingVisualization 
                fitting={currentFitting}
                profile={profile}
                previousFitting={previousFittings[0]}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">Cargando datos del perfil...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            {renderComparisonTab()}
          </TabsContent>

          {isEditing && (
            <TabsContent value="edit" className="mt-6">
              {profile ? (
                <BikeFittingForm
                  fitting={currentFitting}
                  profile={profile}
                  onSave={handleSave}
                  onCancel={() => {
                    setIsEditing(false);
                    setActiveTab('view');
                  }}
                  mode="edit"
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">Cargando datos del perfil para edición...</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
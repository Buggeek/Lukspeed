import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Search, Settings, User, Bike, Wrench } from 'lucide-react';
import { configResolver, ConfigValue, ConfigWithSource } from '@/services/ConfigResolver';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ConfigurationPanelProps {
  context?: {
    user_id?: string;
    bicycle_id?: string;
    fitting_id?: string;
  };
}

export function ConfigurationPanel({ context }: ConfigurationPanelProps) {
  const [categories, setCategories] = useState<{ [category: string]: string[] }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [configs, setConfigs] = useState<ConfigValue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<{
    key: string;
    resolved_value: string;
    active_source?: { scope: string; scope_id?: string; description?: string; unit?: string; data_type: string };
    explanation: string;
    precedence_order: string[];
  } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryConfigs(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await configResolver.getCategories();
      setCategories(categoriesData);
      
      // Select first category by default
      const firstCategory = Object.keys(categoriesData)[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load configuration categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryConfigs = async (category: string) => {
    try {
      setLoading(true);
      const configData = await configResolver.getConfigByCategory(category);
      setConfigs(configData);
    } catch (error) {
      console.error('Error loading configs:', error);
      toast({
        title: "Error", 
        description: "Failed to load configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const explainConfig = async (key: string) => {
    try {
      const params = new URLSearchParams({
        key,
        ...(context?.user_id && { user_id: context.user_id }),
        ...(context?.bicycle_id && { bicycle_id: context.bicycle_id }),
        ...(context?.fitting_id && { fitting_id: context.fitting_id })
      });

      const { data, error } = await supabase.functions.invoke('app_dbd0941867_config_explain', {
        method: 'GET'
      });

      if (error) {
        throw error;
      }

      setExplanation(data);
      setShowExplanation(true);
    } catch (error) {
      console.error('Error explaining config:', error);
      toast({
        title: "Error",
        description: "Failed to explain configuration",
        variant: "destructive"
      });
    }
  };

  const updateUserConfig = async (key: string, value: string, dataType: string) => {
    if (!context?.user_id) {
      toast({
        title: "Error",
        description: "User context required to update configuration",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await configResolver.setUserConfig(key, value, context.user_id, dataType as 'string' | 'number' | 'boolean' | 'array');
      
      if (success) {
        toast({
          title: "Success",
          description: `Configuration ${key} updated successfully`
        });
        
        // Reload configs to show updated values
        loadCategoryConfigs(selectedCategory);
      } else {
        throw new Error('Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive"
      });
    }
  };

  const filteredConfigs = configs.filter(config =>
    config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (config.description && config.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'global': return <Settings className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'bicycle': return <Bike className="w-4 h-4" />;
      case 'fitting': return <Wrench className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'global': return 'default';
      case 'user': return 'secondary';
      case 'bicycle': return 'outline';
      case 'fitting': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Sistema de Configuración
          </CardTitle>
          <CardDescription>
            Gestión de parámetros del sistema con precedencia jerárquica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Buscar configuraciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Categories */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                {Object.keys(categories).map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.keys(categories).map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">Cargando configuraciones...</div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredConfigs.map((config) => (
                          <Card key={config.key} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                      {config.key}
                                    </code>
                                    <Badge 
                                      variant={getScopeColor(config.scope) as "default" | "secondary" | "outline" | "destructive"}
                                      className="flex items-center gap-1"
                                    >
                                      {getScopeIcon(config.scope)}
                                      {config.scope}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Valor Actual</Label>
                                      <div className="flex items-center gap-2">
                                        <code className="text-sm font-mono">
                                          {config.value}
                                        </code>
                                        {config.unit && (
                                          <span className="text-xs text-muted-foreground">
                                            {config.unit}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Descripción</Label>
                                      <p className="text-sm">
                                        {config.description || 'Sin descripción'}
                                      </p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => explainConfig(config.key)}
                                      >
                                        <Info className="w-4 h-4 mr-1" />
                                        Explicar
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Explanation Modal */}
      {showExplanation && explanation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Explicación de Configuración</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExplanation(false)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Clave:</strong> {explanation.key}
                  <br />
                  <strong>Valor Resuelto:</strong> {explanation.resolved_value}
                  <br />
                  <strong>Fuente Activa:</strong> {explanation.active_source?.scope} scope
                </AlertDescription>
              </Alert>
              
              <div>
                <h4 className="font-semibold mb-2">Explicación Detallada</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {explanation.explanation}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Orden de Precedencia</h4>
                <div className="flex gap-2">
                  {explanation.precedence_order.map((scope, index) => (
                    <React.Fragment key={scope}>
                      <Badge 
                        variant={getScopeColor(scope) as "default" | "secondary" | "outline" | "destructive"}
                        className="flex items-center gap-1"
                      >
                        {getScopeIcon(scope)}
                        {scope}
                      </Badge>
                      {index < explanation.precedence_order.length - 1 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ConfigurationPanel;
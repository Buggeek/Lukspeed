import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bike, 
  Plus, 
  Settings, 
  Wrench, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  TrendingUp,
  Zap,
  Wind
} from 'lucide-react';

interface BikeData {
  id: string;
  name: string;
  type: 'road' | 'tt' | 'gravel' | 'mountain';
  brand: string;
  model: string;
  year: number;
  weight: number; // kg
  activities: number;
  total_distance: number; // km
  avg_power: number;
  avg_speed: number;
  efficiency_score: number;
  cda: number; // m²
  crr: number;
  maintenance: {
    chain_wear: number; // %
    brake_pad_wear: number; // %
    tire_wear: number; // %
  };
}

const mockBikes: BikeData[] = [
  {
    id: '1',
    name: 'Canyon Aeroad',
    type: 'road',
    brand: 'Canyon',
    model: 'Aeroad CF SLX',
    year: 2023,
    weight: 7.2,
    activities: 145,
    total_distance: 4850,
    avg_power: 285,
    avg_speed: 42.3,
    efficiency_score: 87,
    cda: 0.235,
    crr: 0.0035,
    maintenance: {
      chain_wear: 0.3,
      brake_pad_wear: 35,
      tire_wear: 60
    }
  },
  {
    id: '2',
    name: 'Specialized Tarmac',
    type: 'road',
    brand: 'Specialized',
    model: 'Tarmac SL7',
    year: 2022,
    weight: 7.8,
    activities: 89,
    total_distance: 2340,
    avg_power: 275,
    avg_speed: 39.8,
    efficiency_score: 82,
    cda: 0.248,
    crr: 0.0038,
    maintenance: {
      chain_wear: 0.8,
      brake_pad_wear: 45,
      tire_wear: 25
    }
  }
];

export default function BikesManagement() {
  const [selectedBike, setSelectedBike] = useState('1');
  const [viewMode, setViewMode] = useState<'overview' | 'performance' | 'components' | 'maintenance'>('overview');
  const [showAddBike, setShowAddBike] = useState(false);

  const currentBike = mockBikes.find(bike => bike.id === selectedBike) || mockBikes[0];

  const getBikeTypeColor = (type: string) => {
    switch (type) {
      case 'road': return 'bg-blue-100 text-blue-800';
      case 'tt': return 'bg-red-100 text-red-800';
      case 'gravel': return 'bg-orange-100 text-orange-800';
      case 'mountain': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBikeCard = (bike: BikeData) => (
    <Card 
      key={bike.id} 
      className={`cursor-pointer transition-all ${selectedBike === bike.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
      onClick={() => setSelectedBike(bike.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bike className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{bike.name}</h3>
              <p className="text-sm text-gray-600">{bike.brand} {bike.model}</p>
            </div>
          </div>
          <Badge className={getBikeTypeColor(bike.type)}>
            {bike.type.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{bike.activities}</div>
            <div className="text-xs text-gray-600">Actividades</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{bike.total_distance.toLocaleString()}km</div>
            <div className="text-xs text-gray-600">Distancia</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">CdA</span>
            <span className="font-medium">{bike.cda} m²</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Potencia Media</span>
            <span className="font-medium">{bike.avg_power}W</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Velocidad Media</span>
            <span className="font-medium">{bike.avg_speed} km/h</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Score Eficiencia</span>
            <div className="flex items-center gap-2">
              <Progress value={bike.efficiency_score} className="w-16 h-2" />
              <span className="text-sm font-medium">{bike.efficiency_score}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bike className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentBike.weight}kg</div>
                <div className="text-sm text-gray-600">Peso Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Wind className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentBike.cda}</div>
                <div className="text-sm text-gray-600">CdA (m²)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentBike.crr}</div>
                <div className="text-sm text-gray-600">Crr</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentBike.efficiency_score}%</div>
                <div className="text-sm text-gray-600">Eficiencia</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{currentBike.avg_power}W</div>
                <div className="text-sm text-blue-600">Potencia Promedio</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{currentBike.avg_speed} km/h</div>
                <div className="text-sm text-green-600">Velocidad Promedio</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{currentBike.total_distance.toLocaleString()}km</div>
                <div className="text-sm text-purple-600">Distancia Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Bicicletas</h1>
            <p className="text-gray-600">Análisis completo de rendimiento por bicicleta</p>
          </div>
          
          <Button onClick={() => setShowAddBike(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Bicicleta
          </Button>
        </div>
      </div>

      {/* Bikes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {mockBikes.map(renderBikeCard)}
      </div>

      {/* Detailed Analysis */}
      <Tabs value={viewMode} onValueChange={(value: 'overview' | 'performance' | 'components' | 'maintenance') => setViewMode(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Análisis de rendimiento en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>Componentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Gestión de componentes en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Sistema de mantenimiento en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Bike Dialog */}
      <Dialog open={showAddBike} onOpenChange={setShowAddBike}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Bicicleta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bikeName">Nombre de la Bicicleta</Label>
              <Input id="bikeName" placeholder="Ej: Canyon Aeroad" />
            </div>
            <div>
              <Label htmlFor="bikeType">Tipo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Carretera</SelectItem>
                  <SelectItem value="tt">Contrarreloj</SelectItem>
                  <SelectItem value="gravel">Gravel</SelectItem>
                  <SelectItem value="mountain">Montaña</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" placeholder="Canyon" />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" placeholder="Aeroad CF SLX" />
              </div>
            </div>
            <div>
              <Label htmlFor="year">Año</Label>
              <Input id="year" type="number" placeholder="2023" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddBike(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowAddBike(false)}>
                Crear Bicicleta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
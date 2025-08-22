import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bicycle } from '@/types';
import { mockBicycles } from '@/lib/mock-data';
import { Bike, Plus, Edit, Trash2 } from 'lucide-react';

export default function Bicycles() {
  const [bicycles, setBicycles] = useState<Bicycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBicycle, setEditingBicycle] = useState<Bicycle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    type: 'Road',
  });

  useEffect(() => {
    // Simulate loading bicycles
    setTimeout(() => {
      setBicycles(mockBicycles);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBicycle) {
      // Update existing bicycle
      setBicycles(prev => prev.map(bike => 
        bike.id === editingBicycle.id 
          ? { ...bike, ...formData, year: parseInt(formData.year) || undefined }
          : bike
      ));
    } else {
      // Add new bicycle
      const newBicycle: Bicycle = {
        id: Date.now().toString(),
        user_id: 'user1',
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year) || undefined,
        type: formData.type,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setBicycles(prev => [newBicycle, ...prev]);
    }

    setIsDialogOpen(false);
    setEditingBicycle(null);
    setFormData({ name: '', brand: '', model: '', year: '', type: 'Road' });
  };

  const handleEdit = (bicycle: Bicycle) => {
    setEditingBicycle(bicycle);
    setFormData({
      name: bicycle.name,
      brand: bicycle.brand || '',
      model: bicycle.model || '',
      year: bicycle.year?.toString() || '',
      type: bicycle.type || 'Road',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBicycles(prev => prev.filter(bike => bike.id !== id));
  };

  const toggleActive = (id: string) => {
    setBicycles(prev => prev.map(bike => 
      bike.id === id ? { ...bike, is_active: !bike.is_active } : bike
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading bicycles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Bicycles</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bicycle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingBicycle ? 'Edit Bicycle' : 'Add New Bicycle'}
                </DialogTitle>
                <DialogDescription>
                  {editingBicycle 
                    ? 'Update your bicycle information.' 
                    : 'Add a new bicycle to your collection.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., My Road Bike"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="e.g., Canyon, Specialized"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g., Aeroad CF SLX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2023"
                      min="1990"
                      max="2025"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Road">Road</SelectItem>
                        <SelectItem value="Mountain">Mountain</SelectItem>
                        <SelectItem value="Gravel">Gravel</SelectItem>
                        <SelectItem value="TT">Time Trial</SelectItem>
                        <SelectItem value="Track">Track</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingBicycle ? 'Update' : 'Add'} Bicycle
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bicycles.map((bicycle) => (
          <Card key={bicycle.id} className={`hover:shadow-md transition-shadow ${!bicycle.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bike className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{bicycle.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(bicycle)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(bicycle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{bicycle.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{bicycle.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-medium">{bicycle.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline">{bicycle.type}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-gray-600">Status:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(bicycle.id)}
                  >
                    <Badge variant={bicycle.is_active ? 'default' : 'secondary'}>
                      {bicycle.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bicycles.length === 0 && (
        <div className="text-center py-12">
          <Bike className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No bicycles found.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Bicycle
          </Button>
        </div>
      )}
    </div>
  );
}
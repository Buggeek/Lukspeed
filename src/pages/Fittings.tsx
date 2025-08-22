import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Fitting, Bicycle } from '@/types';
import { mockBicycles } from '@/lib/mock-data';
import { Settings, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

export default function Fittings() {
  const [fittings, setFittings] = useState<Fitting[]>([]);
  const [bicycles, setBicycles] = useState<Bicycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFitting, setEditingFitting] = useState<Fitting | null>(null);
  const [formData, setFormData] = useState({
    bicycle_id: '',
    saddle_height_mm: '',
    saddle_setback_mm: '',
    saddle_angle_deg: '',
    handlebar_reach_mm: '',
    handlebar_drop_mm: '',
    crank_length_mm: '',
    frame_stack_mm: '',
    frame_reach_mm: '',
    saddle_model: '',
    handlebar_model: '',
    notes: '',
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setBicycles(mockBicycles);
      setFittings([
        {
          id: '1',
          bicycle_id: '1',
          saddle_height_mm: 745,
          saddle_setback_mm: 70,
          saddle_angle_deg: 0,
          handlebar_reach_mm: 380,
          handlebar_drop_mm: 130,
          crank_length_mm: 175,
          frame_stack_mm: 563,
          frame_reach_mm: 398,
          saddle_model: 'Fizik Arione',
          handlebar_model: 'Deda Superzero',
          is_active: true,
          notes: 'Comfortable position for long rides',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fittingData = {
      ...formData,
      saddle_height_mm: parseFloat(formData.saddle_height_mm) || undefined,
      saddle_setback_mm: parseFloat(formData.saddle_setback_mm) || undefined,
      saddle_angle_deg: parseFloat(formData.saddle_angle_deg) || undefined,
      handlebar_reach_mm: parseFloat(formData.handlebar_reach_mm) || undefined,
      handlebar_drop_mm: parseFloat(formData.handlebar_drop_mm) || undefined,
      crank_length_mm: parseFloat(formData.crank_length_mm) || undefined,
      frame_stack_mm: parseFloat(formData.frame_stack_mm) || undefined,
      frame_reach_mm: parseFloat(formData.frame_reach_mm) || undefined,
    };

    if (editingFitting) {
      setFittings(prev => prev.map(fitting => 
        fitting.id === editingFitting.id 
          ? { ...fitting, ...fittingData, updated_at: new Date().toISOString() }
          : fitting
      ));
    } else {
      const newFitting: Fitting = {
        id: Date.now().toString(),
        ...fittingData,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setFittings(prev => [newFitting, ...prev]);
    }

    setIsDialogOpen(false);
    setEditingFitting(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      bicycle_id: '',
      saddle_height_mm: '',
      saddle_setback_mm: '',
      saddle_angle_deg: '',
      handlebar_reach_mm: '',
      handlebar_drop_mm: '',
      crank_length_mm: '',
      frame_stack_mm: '',
      frame_reach_mm: '',
      saddle_model: '',
      handlebar_model: '',
      notes: '',
    });
  };

  const getBicycleName = (bicycleId: string) => {
    const bicycle = bicycles.find(b => b.id === bicycleId);
    return bicycle ? `${bicycle.brand || 'Unknown'} ${bicycle.model || 'Bicycle'}` : 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading fittings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bike Fittings</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fitting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingFitting ? 'Edit Fitting' : 'Add New Fitting'}
                </DialogTitle>
                <DialogDescription>
                  Configure the biomechanical measurements for your bicycle setup.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bicycle">Bicycle *</Label>
                  <Select 
                    value={formData.bicycle_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, bicycle_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bicycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {bicycles.map((bicycle) => (
                        <SelectItem key={bicycle.id} value={bicycle.id}>
                          {getBicycleName(bicycle.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="saddle_height">Saddle Height (mm)</Label>
                    <Input
                      id="saddle_height"
                      type="number"
                      value={formData.saddle_height_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, saddle_height_mm: e.target.value }))}
                      placeholder="745"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="saddle_setback">Saddle Setback (mm)</Label>
                    <Input
                      id="saddle_setback"
                      type="number"
                      value={formData.saddle_setback_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, saddle_setback_mm: e.target.value }))}
                      placeholder="70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="handlebar_reach">Handlebar Reach (mm)</Label>
                    <Input
                      id="handlebar_reach"
                      type="number"
                      value={formData.handlebar_reach_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, handlebar_reach_mm: e.target.value }))}
                      placeholder="380"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="handlebar_drop">Handlebar Drop (mm)</Label>
                    <Input
                      id="handlebar_drop"
                      type="number"
                      value={formData.handlebar_drop_mm}
                      onChange={(e) => setFormData(prev => ({ ...prev, handlebar_drop_mm: e.target.value }))}
                      placeholder="130"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this fitting..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  {editingFitting ? 'Update' : 'Add'} Fitting
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {fittings.map((fitting) => (
          <Card key={fitting.id} className={`${fitting.is_active ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {getBicycleName(fitting.bicycle_id)} Fitting
                </CardTitle>
                <div className="flex items-center gap-2">
                  {fitting.is_active && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Saddle Height:</span>
                  <p className="font-medium">{fitting.saddle_height_mm}mm</p>
                </div>
                <div>
                  <span className="text-gray-600">Saddle Setback:</span>
                  <p className="font-medium">{fitting.saddle_setback_mm}mm</p>
                </div>
                <div>
                  <span className="text-gray-600">Handlebar Reach:</span>
                  <p className="font-medium">{fitting.handlebar_reach_mm}mm</p>
                </div>
                <div>
                  <span className="text-gray-600">Handlebar Drop:</span>
                  <p className="font-medium">{fitting.handlebar_drop_mm}mm</p>
                </div>
              </div>
              {fitting.notes && (
                <div className="mt-4">
                  <span className="text-gray-600 text-sm">Notes:</span>
                  <p className="text-sm mt-1">{fitting.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {fittings.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No bike fittings configured yet.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Fitting
          </Button>
        </div>
      )}
    </div>
  );
}
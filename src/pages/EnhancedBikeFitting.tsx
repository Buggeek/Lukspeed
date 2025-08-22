import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnthropometricData, BikePosition, FitSession } from '@/types/enhanced';
import { 
  Settings, 
  Plus, 
  Edit, 
  Camera, 
  Ruler, 
  User, 
  Activity,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target
} from 'lucide-react';

export default function EnhancedBikeFitting() {
  const [anthropometricData, setAnthropometricData] = useState<AnthropometricData | null>(null);
  const [bikePositions, setBikePositions] = useState<BikePosition[]>([]);
  const [fitSessions, setFitSessions] = useState<FitSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('measurements');
  const [newMeasurements, setNewMeasurements] = useState<Partial<AnthropometricData>>({});
  const [newPosition, setNewPosition] = useState<Partial<BikePosition>>({});

  useEffect(() => {
    // Simulate loading comprehensive bike fitting data
    setTimeout(() => {
      // Mock anthropometric data with all 25+ measurements
      setAnthropometricData({
        id: '1',
        user_id: 'user1',
        height: 178.5,
        weight: 72.5,
        age: 28,
        gender: 'male',
        inseam: 84.2,
        torso_length: 59.8,
        arm_length: 65.4,
        shoulder_width: 42.3,
        shoulder_height: 146.7,
        elbow_height: 107.2,
        hand_length: 18.9,
        foot_length: 26.8,
        knee_height: 52.1,
        hip_width: 32.1,
        sit_bone_width: 11.2,
        flexibility_score: 7,
        injury_history: 'Previous left knee issues in 2022, fully recovered',
        dominant_leg: 'right',
        riding_experience: 'advanced',
        primary_discipline: 'road',
        flexibility_notes: 'Good hip flexibility, limited hamstring range',
        measurement_date: '2025-08-01T10:00:00Z',
        measured_by: 'Professional Bike Fitter - John Smith'
      });

      // Mock detailed bike positions
      setBikePositions([
        {
          id: '1',
          bicycle_id: 'bike1',
          user_id: 'user1',
          saddle_height: 745,
          saddle_setback: 72,
          saddle_angle: -0.5,
          handlebar_drop: 130,
          handlebar_reach: 385,
          stem_length: 110,
          stem_angle: -6,
          handlebar_width: 420,
          hood_position: 80,
          brake_reach: 75,
          crank_length: 172.5,
          cleat_fore_aft: 15,
          cleat_angle: 2,
          q_factor: 146,
          knee_angle_max: 143,
          knee_angle_min: 35,
          hip_angle: 42,
          back_angle: 45,
          shoulder_angle: 88,
          elbow_angle: 155,
          wrist_angle: 168,
          fit_date: '2025-08-01T14:00:00Z',
          fitter_name: 'John Smith - Certified Bike Fitter',
          fit_notes: 'Optimized for aerodynamic position while maintaining comfort for long rides',
          comfort_rating: 9,
          power_rating: 8,
          is_active: true
        },
        {
          id: '2',
          bicycle_id: 'bike2',
          user_id: 'user1',
          saddle_height: 740,
          saddle_setback: 68,
          saddle_angle: 0,
          handlebar_drop: 120,
          handlebar_reach: 375,
          stem_length: 100,
          stem_angle: -6,
          handlebar_width: 400,
          hood_position: 85,
          brake_reach: 75,
          crank_length: 172.5,
          cleat_fore_aft: 12,
          cleat_angle: 1,
          q_factor: 150,
          knee_angle_max: 145,
          knee_angle_min: 38,
          hip_angle: 45,
          back_angle: 48,
          shoulder_angle: 90,
          elbow_angle: 158,
          wrist_angle: 170,
          fit_date: '2025-07-15T10:00:00Z',
          fitter_name: 'John Smith - Certified Bike Fitter',
          fit_notes: 'Training bike setup focused on comfort for long endurance rides',
          comfort_rating: 10,
          power_rating: 7,
          is_active: false
        }
      ]);

      // Mock fit sessions
      setFitSessions([
        {
          id: '1',
          user_id: 'user1',
          bicycle_id: 'bike1',
          session_date: '2025-08-01T14:00:00Z',
          fitter_id: 'fitter1',
          session_type: 'initial',
          goals: ['Improve aerodynamics', 'Maintain comfort for 4+ hour rides', 'Optimize power transfer'],
          issues_addressed: ['Knee tracking', 'Lower back tension', 'Neck strain'],
          measurements_taken: ['All anthropometric measurements', 'Dynamic joint angles', 'Pressure mapping'],
          adjustments_made: ['Saddle height +5mm', 'Saddle setback +2mm', 'Stem length -10mm'],
          comfort_improvement: 8,
          power_improvement: 5,
          follow_up_required: true,
          session_notes: 'Excellent progress. Client adapted well to new position. Recommend follow-up in 2-3 weeks after adaptation period.',
          photos: ['before_side.jpg', '/images/Progress.jpg', 'pressure_map.jpg'],
          video_analysis: 'pedal_stroke_analysis.mp4',
          cost: 350
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const measurementFields = [
    { key: 'height', label: 'Height', unit: 'cm', category: 'basic' },
    { key: 'weight', label: 'Weight', unit: 'kg', category: 'basic' },
    { key: 'inseam', label: 'Inseam', unit: 'cm', category: 'basic' },
    { key: 'torso_length', label: 'Torso Length', unit: 'cm', category: 'advanced' },
    { key: 'arm_length', label: 'Arm Length', unit: 'cm', category: 'advanced' },
    { key: 'shoulder_width', label: 'Shoulder Width', unit: 'cm', category: 'advanced' },
    { key: 'shoulder_height', label: 'Shoulder Height', unit: 'cm', category: 'advanced' },
    { key: 'elbow_height', label: 'Elbow Height', unit: 'cm', category: 'advanced' },
    { key: 'hand_length', label: 'Hand Length', unit: 'cm', category: 'advanced' },
    { key: 'foot_length', label: 'Foot Length', unit: 'cm', category: 'advanced' },
    { key: 'knee_height', label: 'Knee Height', unit: 'cm', category: 'advanced' },
    { key: 'hip_width', label: 'Hip Width', unit: 'cm', category: 'advanced' },
    { key: 'sit_bone_width', label: 'Sit Bone Width', unit: 'cm', category: 'advanced' }
  ];

  const positionFields = [
    { key: 'saddle_height', label: 'Saddle Height', unit: 'mm', category: 'saddle' },
    { key: 'saddle_setback', label: 'Saddle Setback', unit: 'mm', category: 'saddle' },
    { key: 'saddle_angle', label: 'Saddle Angle', unit: '°', category: 'saddle' },
    { key: 'handlebar_reach', label: 'Handlebar Reach', unit: 'mm', category: 'handlebar' },
    { key: 'handlebar_drop', label: 'Handlebar Drop', unit: 'mm', category: 'handlebar' },
    { key: 'stem_length', label: 'Stem Length', unit: 'mm', category: 'handlebar' },
    { key: 'stem_angle', label: 'Stem Angle', unit: '°', category: 'handlebar' },
    { key: 'handlebar_width', label: 'Handlebar Width', unit: 'mm', category: 'handlebar' },
    { key: 'hood_position', label: 'Hood Position', unit: 'mm', category: 'handlebar' },
    { key: 'brake_reach', label: 'Brake Reach', unit: 'mm', category: 'handlebar' },
    { key: 'crank_length', label: 'Crank Length', unit: 'mm', category: 'drivetrain' },
    { key: 'cleat_fore_aft', label: 'Cleat Fore/Aft', unit: 'mm', category: 'foot' },
    { key: 'cleat_angle', label: 'Cleat Angle', unit: '°', category: 'foot' },
    { key: 'q_factor', label: 'Q-Factor', unit: 'mm', category: 'drivetrain' }
  ];

  const handleMeasurementChange = (field: string, value: string) => {
    setNewMeasurements(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handlePositionChange = (field: string, value: string) => {
    setNewPosition(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const saveMeasurements = () => {
    // Simulate saving measurements
    console.log('Saving measurements:', newMeasurements);
    setIsDialogOpen(false);
  };

  const getPositionAnalysis = (position: BikePosition) => {
    const analysis = [];
    
    if (position.knee_angle_min && position.knee_angle_min < 30) {
      analysis.push({ type: 'warning', message: 'Minimum knee angle may be too acute' });
    }
    if (position.comfort_rating && position.comfort_rating < 7) {
      analysis.push({ type: 'critical', message: 'Comfort rating indicates position needs adjustment' });
    }
    if (position.back_angle && position.back_angle < 40) {
      analysis.push({ type: 'info', message: 'Very aggressive position - ensure adequate flexibility' });
    }
    
    return analysis;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading bike fitting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Bike Fitting</h1>
          <p className="text-gray-600">Comprehensive biomechanical analysis and position optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Photo Analysis
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Fitting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Bike Fitting Data</DialogTitle>
                <DialogDescription>
                  Enter comprehensive measurements and position data for optimal bike fitting analysis.
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="measurements">Measurements</TabsTrigger>
                  <TabsTrigger value="position">Position</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="measurements" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {measurementFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label} ({field.unit})
                        </Label>
                        <Input
                          id={field.key}
                          type="number"
                          step="0.1"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="flexibility_notes">Flexibility Assessment</Label>
                    <Textarea
                      id="flexibility_notes"
                      placeholder="Notes on flexibility, range of motion, and any limitations..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="position" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {positionFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                          {field.label} ({field.unit})
                        </Label>
                        <Input
                          id={field.key}
                          type="number"
                          step={field.unit === '°' ? '0.1' : '1'}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          onChange={(e) => handlePositionChange(field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Analysis will be generated after measurements and position data are entered.</p>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveMeasurements}>
                  Save Fitting Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Anthropometric Overview */}
      {anthropometricData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Body Measurements & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-900">{anthropometricData.height}cm</div>
                <div className="text-sm text-blue-600">Height</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-900">{anthropometricData.inseam}cm</div>
                <div className="text-sm text-green-600">Inseam</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-900">{anthropometricData.torso_length}cm</div>
                <div className="text-sm text-purple-600">Torso</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-900">{anthropometricData.arm_length}cm</div>
                <div className="text-sm text-orange-600">Arm Length</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-900">{anthropometricData.sit_bone_width}cm</div>
                <div className="text-sm text-red-600">Sit Bone</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{anthropometricData.flexibility_score}/10</div>
                <div className="text-sm text-gray-600">Flexibility</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Assessment Notes</h4>
              <p className="text-sm text-gray-700">{anthropometricData.flexibility_notes}</p>
              {anthropometricData.injury_history && (
                <p className="text-sm text-red-600 mt-2">
                  <strong>Injury History:</strong> {anthropometricData.injury_history}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bike Positions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Bike Positions</h2>
        
        {bikePositions.map((position) => {
          const analysis = getPositionAnalysis(position);
          
          return (
            <Card key={position.id} className={position.is_active ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Bike Position #{position.id}
                    {position.is_active && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Comfort: {position.comfort_rating}/10
                    </Badge>
                    <Badge variant="outline">
                      Power: {position.power_rating}/10
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Position Measurements Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{position.saddle_height}mm</div>
                      <div className="text-sm text-gray-600">Saddle Height</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{position.saddle_setback}mm</div>
                      <div className="text-sm text-gray-600">Saddle Setback</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{position.handlebar_reach}mm</div>
                      <div className="text-sm text-gray-600">Reach</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{position.handlebar_drop}mm</div>
                      <div className="text-sm text-gray-600">Drop</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{position.stem_length}mm</div>
                      <div className="text-sm text-gray-600">Stem Length</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold">{position.crank_length}mm</div>
                      <div className="text-sm text-gray-600">Crank Length</div>
                    </div>
                  </div>

                  {/* Joint Angles */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Joint Angles Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-900">{position.knee_angle_max}°</div>
                        <div className="text-sm text-blue-600">Max Knee Angle</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-900">{position.hip_angle}°</div>
                        <div className="text-sm text-green-600">Hip Angle</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-900">{position.back_angle}°</div>
                        <div className="text-sm text-purple-600">Back Angle</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-lg font-bold text-orange-900">{position.elbow_angle}°</div>
                        <div className="text-sm text-orange-600">Elbow Angle</div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis & Recommendations */}
                  {analysis.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Position Analysis</h4>
                      {analysis.map((item, index) => (
                        <div 
                          key={index} 
                          className={`flex items-start gap-2 p-3 rounded-lg ${
                            item.type === 'critical' ? 'bg-red-50 border border-red-200' :
                            item.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                            'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          {item.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
                          {item.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                          {item.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />}
                          <span className="text-sm">{item.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fit Notes */}
                  {position.fit_notes && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Fitting Notes</h4>
                      <p className="text-sm text-gray-700">{position.fit_notes}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Fitted by: {position.fitter_name} on {new Date(position.fit_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fit Sessions History */}
      {fitSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Fitting Sessions History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fitSessions.map((session) => (
                <div key={session.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Fitting Session
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(session.session_date).toLocaleDateString()} • ${session.cost}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.comfort_improvement && (
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Comfort +{session.comfort_improvement}
                        </Badge>
                      )}
                      {session.power_improvement && (
                        <Badge variant="outline">
                          <Target className="h-3 w-3 mr-1" />
                          Power +{session.power_improvement}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Goals</h5>
                      <ul className="text-sm text-gray-600">
                        {session.goals.map((goal, index) => (
                          <li key={index}>• {goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Adjustments Made</h5>
                      <ul className="text-sm text-gray-600">
                        {session.adjustments_made.map((adjustment, index) => (
                          <li key={index}>• {adjustment}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {session.session_notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{session.session_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
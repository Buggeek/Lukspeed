import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrainingLoad } from '@/types/enhanced';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface TrainingLoadChartProps {
  data: TrainingLoad[];
  className?: string;
}

export function TrainingLoadChart({ data, className }: TrainingLoadChartProps) {
  const getCurrentTrainingBalance = () => {
    const latest = data[data.length - 1];
    if (!latest) return { balance: 0, status: 'neutral' };
    
    const balance = latest.training_balance;
    let status: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    
    if (balance > 25) status = 'critical'; // Overreaching
    else if (balance < -30) status = 'critical'; // Detraining
    else if (balance > 15) status = 'warning'; // High fatigue
    else if (balance < -15) status = 'warning'; // Losing fitness
    else if (balance >= -5 && balance <= 5) status = 'excellent'; // Optimal
    
    return { balance, status };
  };

  const getFormStatus = () => {
    const latest = data[data.length - 1];
    if (!latest) return { form: 0, status: 'neutral' };
    
    const form = latest.form;
    let status: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    
    if (form > 15) status = 'excellent'; // Fresh and ready
    else if (form > 5) status = 'good'; // Good form
    else if (form > -10) status = 'warning'; // Fatigued
    else status = 'critical'; // Very fatigued
    
    return { form, status };
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Date: ${new Date(data.date).toLocaleDateString()}`}</p>
          <p className="text-blue-600">{`Daily TSS: ${data.daily_tss}`}</p>
          <p className="text-green-600">{`Fitness: ${data.fitness.toFixed(1)}`}</p>
          <p className="text-red-600">{`Fatigue: ${data.fatigue.toFixed(1)}`}</p>
          <p className="text-purple-600">{`Form: ${data.form.toFixed(1)}`}</p>
          <p className="text-orange-600">{`Training Balance: ${data.training_balance.toFixed(1)}`}</p>
        </div>
      );
    }
    return null;
  };

  const currentBalance = getCurrentTrainingBalance();
  const currentForm = getFormStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Training Load Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={currentBalance.status === 'excellent' ? 'default' : 'secondary'}
              className={
                currentBalance.status === 'critical' ? 'bg-red-100 text-red-800' :
                currentBalance.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                currentBalance.status === 'excellent' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }
            >
              Balance: {currentBalance.balance.toFixed(1)}
            </Badge>
            <Badge 
              variant={currentForm.status === 'excellent' ? 'default' : 'secondary'}
              className={
                currentForm.status === 'critical' ? 'bg-red-100 text-red-800' :
                currentForm.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                currentForm.status === 'excellent' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }
            >
              Form: {currentForm.form.toFixed(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Fitness/Fatigue Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Fitness & Fatigue Trends</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fitness"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Fitness (CTL)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Fatigue (ATL)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="form"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Form (TSB)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily TSS Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Daily Training Stress</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="daily_tss"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Daily TSS"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data[data.length - 1]?.fitness.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-600">Chronic Training Load</div>
              <div className="text-xs text-gray-500 mt-1">42-day average</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {data[data.length - 1]?.fatigue.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-600">Acute Training Load</div>
              <div className="text-xs text-gray-500 mt-1">7-day average</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                currentForm.status === 'excellent' ? 'text-green-600' :
                currentForm.status === 'critical' ? 'text-red-600' :
                currentForm.status === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`}>
                {currentForm.form.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Training Stress Balance</div>
              <div className="text-xs text-gray-500 mt-1">Fitness - Fatigue</div>
            </div>
          </div>

          {/* Recommendations */}
          {(currentBalance.status === 'warning' || currentBalance.status === 'critical') && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">Training Recommendation</div>
                <div className="text-yellow-700">
                  {currentBalance.status === 'critical' && currentBalance.balance > 20 && 
                    "High training stress detected. Consider reducing training intensity or adding rest days."}
                  {currentBalance.status === 'critical' && currentBalance.balance < -25 && 
                    "Training load is low. Consider increasing training volume to maintain fitness."}
                  {currentBalance.status === 'warning' && 
                    "Training stress is elevated. Monitor recovery and adjust intensity as needed."}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
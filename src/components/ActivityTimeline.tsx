import React from 'react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, TrendingUp, Heart, Mountain, Wind, Gauge } from 'lucide-react';
import { TimelineDataPoint, TimelineSegment, ChannelVisibility, TimelineAlert } from '@/types/timeline';
import { MetricsCalculator } from '@/services/MetricsCalculator';

interface ActivityTimelineProps {
  data: TimelineDataPoint[];
  segments: TimelineSegment[];
  loading?: boolean;
  error?: string;
  className?: string;
}

export function ActivityTimeline({
  data,
  segments,
  loading = false,
  error = null,
  className = ''
}: ActivityTimelineProps) {
  
  // State for interactive controls
  const [channelVisibility, setChannelVisibility] = React.useState<ChannelVisibility>({
    power: true,
    speed: true,
    cadence: false,
    heartrate: false,
    altitude: true,
    acceleration: false,
    torque: false,
    efficiency: false
  });
  
  const [smoothingWindow, setSmoothingWindow] = React.useState([5]);
  const [showSegments, setShowSegments] = React.useState(true);
  const [showAlerts, setShowAlerts] = React.useState(true);
  const [alerts, setAlerts] = React.useState<TimelineAlert[]>([]);
  
  // Configuration colors
  const colors = {
    power: '#ff6b35',
    speed: '#004e89',
    cadence: '#009639',
    heartrate: '#ff0040',
    altitude: '#6a994e'
  };

  // Process data with smoothing
  const processedData = React.useMemo(() => {
    if (data.length === 0) return [];
    
    // Convert to chart format
    return data.map(point => ({
      time: point.timestamp,
      timeFormatted: formatTime(point.timestamp),
      power: channelVisibility.power ? point.power : null,
      speed: channelVisibility.speed ? point.speed : null,
      cadence: channelVisibility.cadence ? point.cadence : null,
      heartrate: channelVisibility.heartrate ? point.heartrate : null,
      altitude: channelVisibility.altitude ? point.altitude : null,
      acceleration: channelVisibility.acceleration ? point.acceleration : null,
      torque: channelVisibility.torque ? point.torque : null,
      efficiency: channelVisibility.efficiency ? (point.efficiency * 1000) : null, // Scale for visibility
    }));
  }, [data, channelVisibility]);

  // Calculate alerts
  React.useEffect(() => {
    if (data.length === 0) return;
    
    const detectedAlerts = MetricsCalculator.detectAlerts(data, 2.0, 0.05, 0.3);
    setAlerts(detectedAlerts);
  }, [data]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle channel visibility
  const toggleChannel = (channel: keyof ChannelVisibility) => {
    setChannelVisibility(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    
    return (
      <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
        <div className="font-semibold mb-2">
          Tiempo: {formatTime(Number(label))}
        </div>
        {payload.map((entry: any, index: number) => {
          if (entry.value === null || entry.value === undefined) return null;
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {entry.name}: {entry.value.toFixed(1)} {getUnit(entry.dataKey)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Get unit for metric
  const getUnit = (metric: string) => {
    switch (metric) {
      case 'power': return 'W';
      case 'speed': return 'km/h';
      case 'cadence': return 'rpm';
      case 'heartrate': return 'bpm';
      case 'altitude': return 'm';
      case 'acceleration': return 'm/s²';
      case 'torque': return 'Nm';
      case 'efficiency': return '×10³ m/s/W';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando timeline de actividad...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Mountain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay datos de timeline disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Timeline Multieje
          <Badge variant="secondary">{data.length} puntos</Badge>
          {alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length} alertas</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="main" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="main">Principal</TabsTrigger>
            <TabsTrigger value="derived">Métricas Derivadas</TabsTrigger>
            <TabsTrigger value="segments">Análisis Segmentos</TabsTrigger>
          </TabsList>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <label className="text-sm font-medium">Suavizado: {smoothingWindow[0]}s</label>
              <Slider
                value={smoothingWindow}
                onValueChange={setSmoothingWindow}
                max={30}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Canales Principales</label>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={channelVisibility.power}
                    onCheckedChange={() => toggleChannel('power')}
                  />
                  <Zap className="h-4 w-4" style={{ color: colors.power }} />
                  <span className="text-sm">Potencia</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={channelVisibility.speed}
                    onCheckedChange={() => toggleChannel('speed')}
                  />
                  <Wind className="h-4 w-4" style={{ color: colors.speed }} />
                  <span className="text-sm">Velocidad</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={channelVisibility.altitude}
                    onCheckedChange={() => toggleChannel('altitude')}
                  />
                  <Mountain className="h-4 w-4" style={{ color: colors.altitude }} />
                  <span className="text-sm">Altitud</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Canales Adicionales</label>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={channelVisibility.heartrate}
                    onCheckedChange={() => toggleChannel('heartrate')}
                  />
                  <Heart className="h-4 w-4" style={{ color: colors.heartrate }} />
                  <span className="text-sm">FC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={channelVisibility.cadence}
                    onCheckedChange={() => toggleChannel('cadence')}
                  />
                  <Gauge className="h-4 w-4" style={{ color: colors.cadence }} />
                  <span className="text-sm">Cadencia</span>
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="main" className="space-y-4">
            {/* Main Timeline Chart */}
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    type="number"
                    scale="linear"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={formatTime}
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Altitude as background area */}
                  {channelVisibility.altitude && (
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="altitude"
                      stroke={colors.altitude}
                      fill={colors.altitude}
                      fillOpacity={0.1}
                      name="Altitud"
                    />
                  )}

                  {/* Power line */}
                  {channelVisibility.power && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="power"
                      stroke={colors.power}
                      strokeWidth={2}
                      dot={false}
                      name="Potencia"
                    />
                  )}

                  {/* Speed line */}
                  {channelVisibility.speed && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="speed"
                      stroke={colors.speed}
                      strokeWidth={2}
                      dot={false}
                      name="Velocidad"
                    />
                  )}

                  {/* Heart rate line */}
                  {channelVisibility.heartrate && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="heartrate"
                      stroke={colors.heartrate}
                      strokeWidth={1}
                      dot={false}
                      name="FC"
                    />
                  )}

                  {/* Cadence line */}
                  {channelVisibility.cadence && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cadence"
                      stroke={colors.cadence}
                      strokeWidth={1}
                      dot={false}
                      name="Cadencia"
                    />
                  )}

                  {/* Segments as reference lines */}
                  {showSegments && segments.map(segment => (
                    <ReferenceLine
                      key={segment.id}
                      x={segment.startTime}
                      stroke={segment.color}
                      strokeDasharray="5 5"
                      label={segment.type}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Brush for zooming */}
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={processedData}>
                  <XAxis dataKey="time" tickFormatter={formatTime} />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke={colors.power} 
                    strokeWidth={1}
                    dot={false}
                  />
                  <Brush 
                    dataKey="time" 
                    height={50}
                    tickFormatter={formatTime}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="derived" className="space-y-4">
            {/* Derived Metrics Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={channelVisibility.acceleration}
                  onCheckedChange={() => toggleChannel('acceleration')}
                />
                <span className="text-sm">Aceleración</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={channelVisibility.torque}
                  onCheckedChange={() => toggleChannel('torque')}
                />
                <span className="text-sm">Torque</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={channelVisibility.efficiency}
                  onCheckedChange={() => toggleChannel('efficiency')}
                />
                <span className="text-sm">Eficiencia</span>
              </div>
            </div>

            {/* Derived Metrics Chart */}
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={formatTime}
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {channelVisibility.acceleration && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="acceleration"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      name="Aceleración"
                    />
                  )}

                  {channelVisibility.torque && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="torque"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                      name="Torque"
                    />
                  )}

                  {channelVisibility.efficiency && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      name="Eficiencia (×10³)"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="segments" className="space-y-4">
            {/* Segments List */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Segmentos Detectados</h3>
              
              {segments.length === 0 ? (
                <p className="text-muted-foreground">No se detectaron segmentos significativos</p>
              ) : (
                <div className="grid gap-2">
                  {segments.map(segment => (
                    <div 
                      key={segment.id} 
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: segment.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{segment.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)} 
                          ({segment.endTime - segment.startTime}s)
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{segment.avgPower.toFixed(0)}W</div>
                        <div>{segment.avgSpeed.toFixed(1)} km/h</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Alertas Detectadas</h3>
                <div className="space-y-2">
                  {alerts.slice(0, 10).map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertDescription>
                        <span className="font-medium">{formatTime(alert.timestamp)}:</span> {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {alerts.length > 10 && (
                    <p className="text-sm text-muted-foreground">
                      Y {alerts.length - 10} alertas más...
                    </p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
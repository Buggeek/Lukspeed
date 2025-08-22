import React, { useState } from 'react';
import { ResponsiveContainer, ResponsiveGrid, AdaptiveCard } from '@/components/ui/responsive-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bike,
  TrendingUp,
  Zap,
  Mountain,
  Target,
  Award,
  BarChart3,
  Activity,
  Timer,
  Heart,
  ArrowRight,
  CheckCircle,
  Play,
  Users,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const handleStravaConnect = async () => {
    setIsConnecting(true);
    // Simulate Strava connection process
    setTimeout(() => {
      localStorage.setItem('strava_connected', 'true');
      navigate('/dashboard');
    }, 2000);
  };

  const features = [
    {
      icon: Zap,
      title: "Advanced Power Analysis",
      description: "Complete power breakdown: aerodynamic, rolling resistance, and gravitational power analysis",
      metrics: ["Normalized Power", "Intensity Factor", "Power Duration Curves", "FTP Detection"]
    },
    {
      icon: Mountain,
      title: "Climbing Performance",
      description: "VAM analysis, grade-based performance, and climbing efficiency optimization",
      metrics: ["VAM Calculation", "Power-to-Weight", "Climbing Efficiency", "Grade Analysis"]
    },
    {
      icon: Activity,
      title: "Biomechanical Analysis",
      description: "Pedaling efficiency, cadence variability, and left-right balance analysis",
      metrics: ["Pedaling Dynamics", "Cadence Stability", "Power Balance", "Efficiency Trends"]
    },
    {
      icon: BarChart3,
      title: "Training Load Management",
      description: "TSS tracking, fitness-fatigue balance, and performance predictions",
      metrics: ["Training Stress Score", "Form Analysis", "Performance Trends", "Recovery Tracking"]
    }
  ];

  const sampleMetrics = [
    { label: "Peak 5s Power", value: "1,247W", trend: "+12%" },
    { label: "FTP", value: "315W", trend: "+8W" },
    { label: "Best VAM", value: "1,856 m/h", trend: "+156" },
    { label: "Efficiency Factor", value: "1.82", trend: "+0.15" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <ResponsiveContainer>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bike className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LukSpeed</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Advanced Cycling Analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Hero Section */}
      <ResponsiveContainer className="py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
            <Award className="h-3 w-3 mr-1" />
            50+ Advanced Cycling Metrics
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Unlock Your
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Cycling Potential</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Professional-grade cycling analytics with advanced power analysis, climbing metrics, 
            and biomechanical insights. Transform your training with data-driven performance optimization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={handleStravaConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Connecting to Strava...
                </>
              ) : (
                <>
                  <img src="/images/Strava.jpg" alt="Strava" className="h-5 w-5 mr-3" />
                  Connect with Strava
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>10,000+ Cyclists</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>Free Forever</span>
            </div>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Sample Metrics Preview */}
      <ResponsiveContainer className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            See Your Performance Data Like Never Before
          </h2>
          <p className="text-lg text-gray-600">
            Real examples of the insights you'll get with LukSpeed analytics
          </p>
        </div>

        <ResponsiveGrid cols={{ sm: 2, lg: 4 }} className="mb-12">
          {sampleMetrics.map((metric, index) => (
            <AdaptiveCard key={index} className="text-center bg-white/60 backdrop-blur-sm border-white/20">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.trend}
                  </Badge>
                </div>
              </div>
            </AdaptiveCard>
          ))}
        </ResponsiveGrid>

        {/* Demo Dashboard Preview */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Live Dashboard Preview</h3>
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live Data
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              { icon: Zap, label: "Power", value: "287W", color: "blue" },
              { icon: Heart, label: "HR", value: "156 bpm", color: "red" },
              { icon: Timer, label: "Cadence", value: "92 rpm", color: "green" },
              { icon: Activity, label: "Speed", value: "34.2 km/h", color: "purple" },
              { icon: Mountain, label: "VAM", value: "1,650 m/h", color: "orange" },
              { icon: Target, label: "TSS", value: "142", color: "indigo" }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className={`w-8 h-8 bg-${item.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className={`h-4 w-4 text-${item.color}-600`} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 h-32 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Interactive Power Curve Chart</p>
            </div>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Features Section */}
      <ResponsiveContainer className="py-16 bg-white/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Analytics for Serious Cyclists
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get professional-grade insights with our comprehensive suite of cycling performance metrics
          </p>
        </div>

        <ResponsiveGrid cols={{ sm: 1, lg: 2 }} gaps={{ sm: 6, lg: 8 }}>
          {features.map((feature, index) => (
            <AdaptiveCard key={index} className="bg-white border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.metrics.map((metric, metricIndex) => (
                      <Badge key={metricIndex} variant="secondary" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </AdaptiveCard>
          ))}
        </ResponsiveGrid>
      </ResponsiveContainer>

      {/* CTA Section */}
      <ResponsiveContainer className="py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Training?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of cyclists who are already using LukSpeed to optimize their performance 
            and achieve their cycling goals faster.
          </p>
          
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-50"
            onClick={handleStravaConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                Connecting...
              </>
            ) : (
              <>
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-sm opacity-75 mt-4">
            Connect with Strava in 30 seconds • No credit card required
          </p>
        </div>
      </ResponsiveContainer>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <ResponsiveContainer>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bike className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">LukSpeed</span>
            </div>
            <p className="text-gray-400 mb-6">
              Advanced cycling analytics for performance optimization
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Support</a>
            </div>
          </div>
        </ResponsiveContainer>
      </footer>
    </div>
  );
}
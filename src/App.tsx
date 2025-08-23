import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ResponsiveLayout from './components/layout/ResponsiveLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Index from './pages/Index';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import OnboardingFlow from './pages/OnboardingFlow';
import SyncDashboard from './pages/SyncDashboard';
import EnhancedDashboard from './pages/EnhancedDashboard';
import EnhancedActivities from './pages/EnhancedActivities';
import EnhancedBikeFitting from './pages/EnhancedBikeFitting';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import BikesManagement from './pages/BikesManagement';
import FittingResults from './pages/FittingResults';
import OnboardingPage from './pages/Onboarding';
import IngestMonitorPage from './pages/IngestMonitor';
import NotFound from './pages/NotFound';
import ActivityTimeline from './pages/ActivityTimeline';
import PhysicalAnalysis from './pages/PhysicalAnalysis';
import NarrativeDashboard from './pages/NarrativeDashboard';
import WebhookAdminPage from './pages/WebhookAdminPage';

const queryClient = new QueryClient();

// Auth Protected Route Component
const AuthProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route path="/onboarding" element={
            <AuthProtectedRoute>
              <OnboardingFlow />
            </AuthProtectedRoute>
          } />
          <Route path="/sync" element={
            <AuthProtectedRoute>
              <SyncDashboard />
            </AuthProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <EnhancedDashboard />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/enhanced-activities" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <EnhancedActivities />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/enhanced-bike-fitting" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <EnhancedBikeFitting />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/analytics" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <Analytics />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/profile" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <Profile />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/bikes" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <BikesManagement />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/fitting/:id" element={
            <AuthProtectedRoute>
              <FittingResults />
            </AuthProtectedRoute>
          } />
          <Route path="/onboarding-dashboard" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <OnboardingPage />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/ingest-monitor" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <IngestMonitorPage />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/activity-timeline/:activityId" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <ActivityTimeline />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/physical-analysis/:activityId" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <PhysicalAnalysis />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/narrative" element={
            <AuthProtectedRoute>
              <ResponsiveLayout>
                <NarrativeDashboard />
              </ResponsiveLayout>
            </AuthProtectedRoute>
          } />
          <Route path="/admin/webhooks" element={
            <AuthProtectedRoute>
              <WebhookAdminPage />
            </AuthProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
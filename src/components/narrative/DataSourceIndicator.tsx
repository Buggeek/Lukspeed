import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Wifi, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface DataSourceIndicatorProps {
  isReal: boolean;
  error?: string | null;
  syncStatus?: 'idle' | 'syncing' | 'completed';
  onRefresh?: () => void;
}

export function DataSourceIndicator({ 
  isReal, 
  error, 
  syncStatus = 'idle', 
  onRefresh 
}: DataSourceIndicatorProps) {
  
  // No mostrar nada si todo está bien con datos reales
  if (isReal && !error && syncStatus !== 'syncing') {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-16 z-40 mx-4 mb-4"
      >
        <div className={`rounded-xl p-4 shadow-lg border ${getStatusColors().bg} ${getStatusColors().border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getStatusColors().iconBg}`}>
                {getStatusIcon()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold ${getStatusColors().text}`}>
                    {getStatusTitle()}
                  </h3>
                  <Badge variant="outline" className={getStatusColors().badgeClass}>
                    {getStatusBadge()}
                  </Badge>
                </div>
                <p className={`text-sm ${getStatusColors().subtext}`}>
                  {getStatusDescription()}
                </p>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="flex space-x-2">
              {(error || !isReal) && onRefresh && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRefresh}
                  disabled={syncStatus === 'syncing'}
                  className="text-xs"
                >
                  {syncStatus === 'syncing' ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  function getStatusColors() {
    if (error) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        subtext: 'text-red-700',
        iconBg: 'bg-red-100',
        badgeClass: 'border-red-300 text-red-800'
      };
    } else if (syncStatus === 'syncing') {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        subtext: 'text-blue-700',
        iconBg: 'bg-blue-100',
        badgeClass: 'border-blue-300 text-blue-800'
      };
    } else if (!isReal) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        subtext: 'text-yellow-700',
        iconBg: 'bg-yellow-100',
        badgeClass: 'border-yellow-300 text-yellow-800'
      };
    } else {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        subtext: 'text-green-700',
        iconBg: 'bg-green-100',
        badgeClass: 'border-green-300 text-green-800'
      };
    }
  }

  function getStatusIcon() {
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else if (syncStatus === 'syncing') {
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    } else if (!isReal) {
      return <Database className="h-4 w-4 text-yellow-600" />;
    } else {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
  }

  function getStatusTitle() {
    if (error) {
      return 'Error de Conexión';
    } else if (syncStatus === 'syncing') {
      return 'Sincronizando con Strava';
    } else if (!isReal) {
      return 'Datos Demo';
    } else {
      return 'Datos Reales';
    }
  }

  function getStatusBadge() {
    if (error) {
      return 'Sin conexión';
    } else if (syncStatus === 'syncing') {
      return 'Sincronizando';
    } else if (!isReal) {
      return 'Demo';
    } else {
      return 'Conectado';
    }
  }

  function getStatusDescription() {
    if (error) {
      return 'No se pudo conectar con Strava. Mostrando datos de ejemplo mientras tanto.';
    } else if (syncStatus === 'syncing') {
      return 'Obteniendo tus actividades reales de Strava. Esto puede tomar un momento...';
    } else if (!isReal) {
      return 'Mostrando métricas de ejemplo. Conéctate a Strava para ver tus datos reales.';
    } else {
      return 'Mostrando métricas calculadas desde tus actividades reales de Strava.';
    }
  }
}
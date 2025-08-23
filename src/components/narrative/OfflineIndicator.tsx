import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw, Clock, Database } from 'lucide-react';
import { useOfflineCapability } from '@/hooks/narrative/useOfflineCapability';

export function OfflineIndicator() {
  const { isOnline, cacheStatus, getCacheInfo, clearCache } = useOfflineCapability();
  const cacheInfo = getCacheInfo();

  if (isOnline && cacheStatus === 'fresh') {
    return null; // Don't show anything when online with fresh data
  }

  return (
    <AnimatePresence>
      {(!isOnline || cacheStatus !== 'fresh') && (
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
                  {cacheInfo && (
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Actualizado: {formatTime(cacheInfo.lastUpdated)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Database className="h-3 w-3" />
                        <span>{cacheInfo.entriesCount} métricas</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Button */}
              <div className="flex space-x-2">
                {!isOnline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reintentar
                  </Button>
                )}
                {cacheStatus === 'stale' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearCache}
                    className="text-xs"
                  >
                    Limpiar Cache
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  function getStatusColors() {
    if (!isOnline) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        subtext: 'text-red-700',
        iconBg: 'bg-red-100',
        badgeClass: 'border-red-300 text-red-800'
      };
    } else if (cacheStatus === 'stale') {
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
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        subtext: 'text-blue-700',
        iconBg: 'bg-blue-100',
        badgeClass: 'border-blue-300 text-blue-800'
      };
    }
  }

  function getStatusIcon() {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-red-600" />;
    } else if (cacheStatus === 'stale') {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    } else {
      return <Wifi className="h-4 w-4 text-blue-600" />;
    }
  }

  function getStatusTitle() {
    if (!isOnline) {
      return 'Modo Offline';
    } else if (cacheStatus === 'stale') {
      return 'Datos Antiguos';
    } else {
      return 'Conexión Restaurada';
    }
  }

  function getStatusBadge() {
    if (!isOnline) {
      return 'Sin conexión';
    } else if (cacheStatus === 'stale') {
      return 'Desactualizado';
    } else {
      return 'Actualizado';
    }
  }

  function getStatusDescription() {
    if (!isOnline) {
      return 'Mostrando la última actividad sincronizada. Algunas funciones pueden estar limitadas.';
    } else if (cacheStatus === 'stale') {
      return 'Los datos pueden estar desactualizados. Considera actualizar para obtener la información más reciente.';
    } else {
      return 'Conexión restaurada. Los datos están actualizados.';
    }
  }

  function formatTime(timestamp: number) {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'hace menos de 1 min';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays}d`;
  }
}
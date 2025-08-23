import { useState, useEffect, useCallback } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
  version: string;
  expiresAt: number;
}

export function useOfflineCapability() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedData, setCachedData] = useState<any>(null);
  const [cacheStatus, setCacheStatus] = useState<'fresh' | 'stale' | 'expired' | 'none'>('none');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('📶 Connection restored');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📵 Connection lost - switching to offline mode');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker registration for advanced caching
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/narrative-sw.js')
        .then(registration => {
          console.log('📱 Narrative Service Worker registered');
          
          // Listen for SW messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'CACHE_UPDATED') {
              console.log('🔄 Cache updated by Service Worker');
            }
          });
        })
        .catch(error => {
          console.warn('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  // Cache narrative data with smart expiration
  const cacheNarrativeData = useCallback((data: any, ttl: number = 24 * 60 * 60 * 1000) => {
    try {
      const cacheEntry: CacheEntry = {
        data,
        timestamp: Date.now(),
        version: '2.0',
        expiresAt: Date.now() + ttl
      };
      
      localStorage.setItem('narrative_cache', JSON.stringify(cacheEntry));
      localStorage.setItem('narrative_cache_meta', JSON.stringify({
        lastUpdated: Date.now(),
        dataSize: JSON.stringify(data).length,
        entriesCount: Array.isArray(data) ? data.length : 1
      }));
      
      setCachedData(data);
      setCacheStatus('fresh');
      
      console.log('💾 Narrative data cached successfully');
    } catch (error) {
      console.warn('❌ Cache storage failed:', error);
      
      // Try to clear old cache if storage is full
      if (error instanceof DOMException && error.code === 22) {
        localStorage.removeItem('narrative_cache');
        localStorage.removeItem('narrative_cache_meta');
        console.log('🧹 Cleared old cache due to storage quota');
      }
    }
  }, []);

  // Get cached data with validation
  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem('narrative_cache');
      if (!cached) {
        setCacheStatus('none');
        return null;
      }

      const cacheEntry: CacheEntry = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is expired
      if (now > cacheEntry.expiresAt) {
        setCacheStatus('expired');
        localStorage.removeItem('narrative_cache');
        localStorage.removeItem('narrative_cache_meta');
        return null;
      }
      
      // Check if cache is stale (older than 6 hours but not expired)
      const sixHoursAgo = now - (6 * 60 * 60 * 1000);
      if (cacheEntry.timestamp < sixHoursAgo) {
        setCacheStatus('stale');
      } else {
        setCacheStatus('fresh');
      }
      
      setCachedData(cacheEntry.data);
      return cacheEntry.data;
    } catch (error) {
      console.warn('❌ Cache retrieval failed:', error);
      setCacheStatus('none');
      return null;
    }
  }, []);

  // Clear all cached data
  const clearCache = useCallback(() => {
    localStorage.removeItem('narrative_cache');
    localStorage.removeItem('narrative_cache_meta');
    setCachedData(null);
    setCacheStatus('none');
    console.log('🗑️ Cache cleared');
  }, []);

  // Get cache metadata
  const getCacheInfo = useCallback(() => {
    try {
      const meta = localStorage.getItem('narrative_cache_meta');
      if (meta) {
        return JSON.parse(meta);
      }
    } catch (error) {
      console.warn('❌ Cache metadata retrieval failed:', error);
    }
    return null;
  }, []);

  // Preload critical data for offline use
  const preloadForOffline = useCallback(async (dataLoader: () => Promise<any>) => {
    if (isOnline) {
      try {
        console.log('⬇️ Preloading data for offline use...');
        const data = await dataLoader();
        cacheNarrativeData(data, 48 * 60 * 60 * 1000); // 48 hours TTL
        return data;
      } catch (error) {
        console.warn('❌ Preload failed:', error);
        return getCachedData(); // Fallback to cached data
      }
    } else {
      return getCachedData();
    }
  }, [isOnline, cacheNarrativeData, getCachedData]);

  return {
    isOnline,
    cachedData,
    cacheStatus,
    cacheNarrativeData,
    getCachedData,
    clearCache,
    getCacheInfo,
    preloadForOffline
  };
}
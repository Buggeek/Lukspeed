import React from 'react';
import { IngestMonitor } from '@/components/IngestMonitor';

export default function IngestMonitorPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Monitor de Ingesta</h1>
        <p className="text-muted-foreground">
          Monitoreo de calidad y estado de procesamiento de archivos .fit
        </p>
      </div>

      <IngestMonitor />
    </div>
  );
}
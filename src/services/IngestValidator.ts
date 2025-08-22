import { configResolver } from './ConfigResolver';
import { supabase } from '@/lib/supabase';
import { Logger } from './Logger';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    fileSize: number;
    powerCoverage?: number;
    speedCoverage?: number;
    cadenceCoverage?: number;
    hrCoverage?: number;
    altitudeCoverage?: number;
    temperatureCoverage?: number;
    gapsCount: number;
    maxGapSeconds: number;
    checksum: string;
  };
}

interface FitFileData {
  size: number;
  data: ArrayBuffer;
  records: FitRecord[];
}

interface FitRecord {
  timestamp: Date;
  power?: number;
  speed?: number;
  cadence?: number;
  heartRate?: number;
  altitude?: number;
  temperature?: number;
}

export class IngestValidator {
  private logger = new Logger('IngestValidator');

  async validateFitFile(
    file: FitFileData, 
    userId: string, 
    activityId?: string
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      metrics: {
        fileSize: file.size,
        gapsCount: 0,
        maxGapSeconds: 0,
        checksum: await this.calculateChecksum(file.data)
      }
    };

    try {
      // Log inicio de validación
      await this.logOperation(userId, activityId, 'validation', 'started', 
        'Iniciando validación de archivo .fit');

      // 1. Validar tamaño de archivo
      await this.validateFileSize(file.size, userId, result);

      // 2. Calcular cobertura por canal
      await this.calculateCoverage(file.records, userId, result);

      // 3. Detectar gaps de datos
      await this.detectDataGaps(file.records, userId, result);

      // 4. Verificar integridad general
      this.validateIntegrity(file.records, result);

      // Log resultado
      const duration = Date.now() - startTime;
      const status = result.isValid ? 'completed' : 'failed';
      const message = result.isValid ? 
        'Validación completada exitosamente' : 
        `Validación fallida: ${result.errors.join(', ')}`;

      await this.logOperation(userId, activityId, 'validation', status, message, {
        metrics: result.metrics,
        errors: result.errors,
        warnings: result.warnings
      }, duration);

      this.logger.info('Validación completada', {
        userId,
        activityId,
        isValid: result.isValid,
        duration,
        metrics: result.metrics
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Error durante validación', { userId, activityId, error });
      
      await this.logOperation(userId, activityId, 'validation', 'failed', 
        `Error durante validación: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        duration
      );

      result.isValid = false;
      result.errors.push('Error interno durante validación');
      return result;
    }
  }

  private async validateFileSize(fileSize: number, userId: string, result: ValidationResult): Promise<void> {
    const minSizeKb = await configResolver.getValue('ingest.fit_min_file_size_kb', { user_id: userId }, 50);
    const maxSizeMb = await configResolver.getValue('ingest.fit_max_file_size_mb', { user_id: userId }, 25);

    const fileSizeKb = fileSize / 1024;
    const fileSizeMb = fileSize / (1024 * 1024);

    result.metrics.fileSize = Math.round(fileSizeKb);

    if (fileSizeKb < Number(minSizeKb)) {
      result.errors.push(`Archivo muy pequeño: ${Math.round(fileSizeKb)}KB < ${minSizeKb}KB mínimo`);
      result.isValid = false;
    }

    if (fileSizeMb > Number(maxSizeMb)) {
      result.errors.push(`Archivo muy grande: ${Math.round(fileSizeMb)}MB > ${maxSizeMb}MB máximo`);
      result.isValid = false;
    }
  }

  private async calculateCoverage(
    records: FitRecord[], 
    userId: string, 
    result: ValidationResult
  ): Promise<void> {
    if (records.length === 0) {
      result.errors.push('No hay registros de datos en el archivo');
      result.isValid = false;
      return;
    }

    const totalRecords = records.length;
    
    // Contar registros con datos por canal
    const powerCount = records.filter(r => r.power !== undefined && r.power > 0).length;
    const speedCount = records.filter(r => r.speed !== undefined && r.speed > 0).length;
    const cadenceCount = records.filter(r => r.cadence !== undefined && r.cadence > 0).length;
    const hrCount = records.filter(r => r.heartRate !== undefined && r.heartRate > 0).length;
    const altitudeCount = records.filter(r => r.altitude !== undefined).length;
    const temperatureCount = records.filter(r => r.temperature !== undefined).length;

    // Calcular porcentajes de cobertura
    result.metrics.powerCoverage = Math.round((powerCount / totalRecords) * 100 * 100) / 100;
    result.metrics.speedCoverage = Math.round((speedCount / totalRecords) * 100 * 100) / 100;
    result.metrics.cadenceCoverage = Math.round((cadenceCount / totalRecords) * 100 * 100) / 100;
    result.metrics.hrCoverage = Math.round((hrCount / totalRecords) * 100 * 100) / 100;
    result.metrics.altitudeCoverage = Math.round((altitudeCount / totalRecords) * 100 * 100) / 100;
    result.metrics.temperatureCoverage = Math.round((temperatureCount / totalRecords) * 100 * 100) / 100;

    // Obtener umbrales configurables
    const minPowerCoverage = await configResolver.getValue('quality.min_power_coverage_pct', { user_id: userId }, 70);
    const minSpeedCoverage = await configResolver.getValue('quality.min_speed_coverage_pct', { user_id: userId }, 90);
    const minCadenceCoverage = await configResolver.getValue('quality.min_cadence_coverage_pct', { user_id: userId }, 60);
    const minHrCoverage = await configResolver.getValue('quality.min_hr_coverage_pct', { user_id: userId }, 60);
    const minAltitudeCoverage = await configResolver.getValue('quality.min_altitude_coverage_pct', { user_id: userId }, 80);
    const minTemperatureCoverage = await configResolver.getValue('quality.min_temperature_coverage_pct', { user_id: userId }, 50);

    // Validar coberturas críticas
    const coverageChecks = [
      { name: 'potencia', coverage: result.metrics.powerCoverage, min: Number(minPowerCoverage), critical: true },
      { name: 'velocidad', coverage: result.metrics.speedCoverage, min: Number(minSpeedCoverage), critical: true },
      { name: 'cadencia', coverage: result.metrics.cadenceCoverage, min: Number(minCadenceCoverage), critical: false },
      { name: 'frecuencia cardíaca', coverage: result.metrics.hrCoverage, min: Number(minHrCoverage), critical: false },
      { name: 'altitud', coverage: result.metrics.altitudeCoverage, min: Number(minAltitudeCoverage), critical: false },
      { name: 'temperatura', coverage: result.metrics.temperatureCoverage, min: Number(minTemperatureCoverage), critical: false }
    ];

    for (const check of coverageChecks) {
      if (check.coverage < check.min) {
        const message = `Cobertura de ${check.name} insuficiente: ${check.coverage}% < ${check.min}% mínimo`;
        if (check.critical) {
          result.errors.push(message);
          result.isValid = false;
        } else {
          result.warnings.push(message);
        }
      } else if (check.coverage < check.min * 1.1) {
        // Warning si está muy cerca del umbral
        result.warnings.push(`Cobertura de ${check.name} cerca del umbral: ${check.coverage}%`);
      }
    }
  }

  private async detectDataGaps(
    records: FitRecord[], 
    userId: string, 
    result: ValidationResult
  ): Promise<void> {
    if (records.length < 2) return;

    const maxGapSeconds = await configResolver.getValue('ingest.data_gap_max_seconds', { user_id: userId }, 3);
    const maxGap = Number(maxGapSeconds);

    let gapsCount = 0;
    let maxGapFound = 0;

    // Ordenar records por timestamp
    const sortedRecords = [...records].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    for (let i = 1; i < sortedRecords.length; i++) {
      const prevRecord = sortedRecords[i - 1];
      const currentRecord = sortedRecords[i];
      
      const gapSeconds = (currentRecord.timestamp.getTime() - prevRecord.timestamp.getTime()) / 1000;
      
      if (gapSeconds > maxGap) {
        gapsCount++;
        maxGapFound = Math.max(maxGapFound, gapSeconds);
      }
    }

    result.metrics.gapsCount = gapsCount;
    result.metrics.maxGapSeconds = Math.round(maxGapFound * 100) / 100;

    if (gapsCount > 0) {
      const message = `${gapsCount} gaps de datos detectados (máximo: ${maxGapFound.toFixed(1)}s)`;
      if (maxGapFound > maxGap * 3) {
        // Gap muy grande - error crítico
        result.errors.push(message);
        result.isValid = false;
      } else {
        // Gap moderado - warning
        result.warnings.push(message);
      }
    }
  }

  private validateIntegrity(records: FitRecord[], result: ValidationResult): void {
    // Verificar que los timestamps sean válidos y monotónicos
    const timestamps = records.map(r => r.timestamp.getTime()).filter(t => !isNaN(t));
    
    if (timestamps.length !== records.length) {
      result.errors.push('Timestamps inválidos detectados');
      result.isValid = false;
      return;
    }

    // Verificar orden cronológico (permitir pequeñas variaciones)
    let outOfOrderCount = 0;
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] < timestamps[i - 1]) {
        outOfOrderCount++;
      }
    }

    if (outOfOrderCount > records.length * 0.01) { // Más del 1% fuera de orden
      result.errors.push(`Demasiados registros fuera de orden cronológico: ${outOfOrderCount}`);
      result.isValid = false;
    } else if (outOfOrderCount > 0) {
      result.warnings.push(`${outOfOrderCount} registros fuera de orden cronológico`);
    }
  }

  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async logOperation(
    userId: string,
    activityId: string | undefined,
    operation: string,
    status: 'started' | 'completed' | 'failed' | 'warning',
    message: string,
    metadata: Record<string, unknown> = {},
    durationMs?: number
  ): Promise<void> {
    try {
      await supabase.from('ingest_logs').insert({
        user_id: userId,
        activity_id: activityId,
        operation,
        status,
        message,
        metadata,
        duration_ms: durationMs
      });
    } catch (error) {
      this.logger.error('Error logging operation', { userId, activityId, operation, error });
    }
  }
}

// Singleton instance
export const ingestValidator = new IngestValidator();
import { supabase } from '@/lib/supabase';

interface LogContext {
  [key: string]: unknown;
}

class SimpleLogger {
  constructor(private context: string) {}
  
  info(message: string, data?: LogContext) {
    console.log(`[${this.context}] ${message}`, data);
  }
  
  error(message: string, data?: LogContext) {
    console.error(`[${this.context}] ${message}`, data);
  }
  
  warn(message: string, data?: LogContext) {
    console.warn(`[${this.context}] ${message}`, data);
  }
  
  debug(message: string, data?: LogContext) {
    console.debug(`[${this.context}] ${message}`, data);
  }
}

interface ConfigValue {
  key: string;
  value: string;
  scope: 'global' | 'user' | 'bicycle' | 'fitting';
  scope_id?: string;
  data_type: 'string' | 'number' | 'boolean' | 'array';
  description?: string;
  unit?: string;
}

interface ConfigContext {
  user_id?: string;
  bicycle_id?: string;  
  fitting_id?: string;
}

interface ConfigWithSource {
  resolved_value: string;
  active_scope: string;
  active_scope_id?: string;
  data_type: string;
  description?: string;
  unit?: string;
}

class ConfigResolver {
  private cache = new Map<string, unknown>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private logger = new SimpleLogger('ConfigResolver');
  
  /**
   * Get configuration value with precedence resolution
   */
  async getValue<T = unknown>(
    key: string, 
    context?: ConfigContext,
    defaultValue?: T
  ): Promise<T> {
    const cacheKey = `${key}:${JSON.stringify(context || {})}`;
    
    // Verificar cache
    if (this.isValidCache(cacheKey)) {
      this.logger.debug(`Cache hit for config key: ${key}`);
      return this.cache.get(cacheKey) as T;
    }
    
    try {
      this.logger.info(`Resolving config key: ${key}`, { context });
      
      const { data, error } = await supabase.rpc('resolve_config', {
        config_key: key,
        fitting_id_param: context?.fitting_id || null,
        bicycle_id_param: context?.bicycle_id || null,
        user_id_param: context?.user_id || null
      });
      
      if (error) {
        this.logger.error('Error calling resolve_config:', error);
        return defaultValue as T;
      }
      
      if (data) {
        // Obtener metadata para tipo de dato
        const { data: configMeta, error: metaError } = await supabase
          .from('system_config')
          .select('data_type')
          .eq('key', key)
          .single();
        
        if (metaError) {
          this.logger.warn('Could not get config metadata:', metaError);
        }
        
        const parsedValue = this.parseValue(data, configMeta?.data_type || 'string');
        this.setCache(cacheKey, parsedValue);
        
        this.logger.info(`Config resolved: ${key} = ${parsedValue}`, {
          data_type: configMeta?.data_type,
          context
        });
        
        return parsedValue as T;
      }
      
      this.logger.warn(`No config found for key: ${key}, using default: ${defaultValue}`);
      return defaultValue as T;
    } catch (error) {
      this.logger.error('Error resolving config:', error);
      return defaultValue as T;
    }
  }
  
  /**
   * Get configuration with source information
   */
  async getValueWithSource(
    key: string,
    context?: ConfigContext
  ): Promise<ConfigWithSource | null> {
    try {
      this.logger.info(`Getting config with source: ${key}`, { context });
      
      const { data, error } = await supabase.rpc('get_config_with_source', {
        config_key: key,
        fitting_id_param: context?.fitting_id || null,
        bicycle_id_param: context?.bicycle_id || null,
        user_id_param: context?.user_id || null
      });
      
      if (error) {
        this.logger.error('Error getting config with source:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        const config = data[0];
        this.logger.info(`Config source resolved: ${key}`, {
          active_scope: config.active_scope,
          resolved_value: config.resolved_value
        });
        return config;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error getting config with source:', error);
      return null;
    }
  }
  
  /**
   * Set user-specific configuration
   */
  async setUserConfig(
    key: string,
    value: unknown,
    userId: string,
    dataType: 'string' | 'number' | 'boolean' | 'array' = 'string'
  ): Promise<boolean> {
    try {
      this.logger.info(`Setting user config: ${key} = ${value}`, { userId });
      
      const stringValue = this.valueToString(value, dataType);
      
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key,
          value: stringValue,
          scope: 'user',
          scope_id: userId,
          data_type: dataType
        }, {
          onConflict: 'key,scope,scope_id'
        });
      
      if (error) {
        this.logger.error('Error setting user config:', error);
        return false;
      }
      
      // Clear cache for this key
      this.clearCache(key);
      
      this.logger.info(`User config set successfully: ${key}`);
      return true;
    } catch (error) {
      this.logger.error('Error setting user config:', error);
      return false;
    }
  }
  
  /**
   * Get all configuration keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('key')
        .eq('scope', 'global');
      
      if (error) {
        this.logger.error('Error getting all config keys:', error);
        return [];
      }
      
      return [...new Set(data?.map(item => item.key) || [])].sort();
    } catch (error) {
      this.logger.error('Error getting all config keys:', error);
      return [];
    }
  }
  
  /**
   * Get configuration by category
   */
  async getConfigByCategory(category: string): Promise<ConfigValue[]> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .like('key', `${category}.%`)
        .eq('scope', 'global');
      
      if (error) {
        this.logger.error('Error getting config by category:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      this.logger.error('Error getting config by category:', error);
      return [];
    }
  }
  
  private parseValue(value: string, dataType: string): unknown {
    try {
      switch (dataType) {
        case 'number': {
          const num = parseFloat(value);
          return isNaN(num) ? 0 : num;
        }
        case 'boolean':
          return value === 'true' || value === '1';
        case 'array':
          return JSON.parse(value);
        default:
          return value;
      }
    } catch (error) {
      this.logger.warn(`Error parsing value "${value}" as ${dataType}:`, error);
      return value; // Return as string if parsing fails
    }
  }
  
  private valueToString(value: unknown, dataType: string): string {
    switch (dataType) {
      case 'array':
        return JSON.stringify(value);
      case 'boolean':
        return value ? 'true' : 'false';
      default:
        return String(value);
    }
  }
  
  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry !== undefined && Date.now() < expiry;
  }
  
  private setCache(key: string, value: unknown): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }
  
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Get configuration categories with their keys
   */
  async getCategories(): Promise<{ [category: string]: string[] }> {
    try {
      const keys = await this.getAllKeys();
      const categories: { [category: string]: string[] } = {};
      
      keys.forEach(key => {
        const category = key.split('.')[0];
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(key);
      });
      
      return categories;
    } catch (error) {
      this.logger.error('Error getting categories:', error);
      return {};
    }
  }

  /**
   * Validate configuration value against constraints
   */
  validateValue(value: unknown, dataType: string, constraints?: { min?: number; max?: number }): boolean {
    try {
      switch (dataType) {
        case 'number': {
          const num = parseFloat(String(value));
          if (isNaN(num)) return false;
          if (constraints?.min !== undefined && num < constraints.min) return false;
          if (constraints?.max !== undefined && num > constraints.max) return false;
          break;
        }
        case 'array':
          if (!Array.isArray(value)) return false;
          break;
        case 'boolean':
          if (typeof value !== 'boolean') return false;
          break;
      }
      return true;
    } catch (error) {
      this.logger.error('Error validating value:', error);
      return false;
    }
  }
}

// Export singleton instance
export const configResolver = new ConfigResolver();
export type { ConfigContext, ConfigValue, ConfigWithSource };
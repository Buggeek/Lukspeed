import { configResolver } from '@/services/ConfigResolver';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      upsert: jest.fn()
    }))
  }
}));

describe('ConfigResolver', () => {
  beforeEach(() => {
    // Clear cache before each test
    configResolver.clearCache();
    jest.clearAllMocks();
  });

  describe('getValue', () => {
    it('should resolve global config value', async () => {
      // Mock the RPC call to return a value
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: '48',
        error: null
      });

      // Mock metadata fetch
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { data_type: 'number' },
              error: null
            })
          }))
        }))
      });

      const value = await configResolver.getValue('auth.token_expiry_warning_hours');
      
      expect(value).toBe(48);
      expect(supabase.rpc).toHaveBeenCalledWith('resolve_config', {
        config_key: 'auth.token_expiry_warning_hours',
        fitting_id_param: null,
        bicycle_id_param: null,
        user_id_param: null
      });
    });

    it('should return default value when config not found', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null
      });

      const defaultValue = 24;
      const value = await configResolver.getValue('non.existent.key', undefined, defaultValue);
      
      expect(value).toBe(defaultValue);
    });

    it('should respect precedence order', async () => {
      const context = {
        user_id: 'user123',
        bicycle_id: 'bike456',
        fitting_id: 'fit789'
      };

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: '25', // Fitting-specific value
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { data_type: 'number' },
              error: null
            })
          }))
        }))
      });

      const value = await configResolver.getValue('bio.knee_angle_min_deg', context);
      
      expect(value).toBe(25);
      expect(supabase.rpc).toHaveBeenCalledWith('resolve_config', {
        config_key: 'bio.knee_angle_min_deg',
        fitting_id_param: 'fit789',
        bicycle_id_param: 'bike456',
        user_id_param: 'user123'
      });
    });

    it('should cache values correctly', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: '30',
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { data_type: 'number' },
              error: null
            })
          }))
        }))
      });

      // First call should hit the API
      const value1 = await configResolver.getValue('agg.window_np_seconds');
      expect(value1).toBe(30);
      expect(supabase.rpc).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const value2 = await configResolver.getValue('agg.window_np_seconds');
      expect(value2).toBe(30);
      expect(supabase.rpc).toHaveBeenCalledTimes(1); // Still only 1 call
    });
  });

  describe('parseValue', () => {
    it('should parse array values correctly', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: '[10,100,1000]',
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { data_type: 'array' },
              error: null
            })
          }))
        }))
      });

      const arrayValue = await configResolver.getValue('agg.by_distance_bins');
      
      expect(Array.isArray(arrayValue)).toBe(true);
      expect(arrayValue).toEqual([10, 100, 1000]);
    });

    it('should parse boolean values correctly', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: 'true',
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { data_type: 'boolean' },
              error: null
            })
          }))
        }))
      });

      const boolValue = await configResolver.getValue('some.boolean.config');
      
      expect(typeof boolValue).toBe('boolean');
      expect(boolValue).toBe(true);
    });
  });

  describe('setUserConfig', () => {
    it('should set user configuration successfully', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      
      (supabase.from as jest.Mock).mockReturnValue({
        upsert: mockUpsert
      });

      const success = await configResolver.setUserConfig(
        'zones.power_z1_max_pct',
        60,
        'user123',
        'number'
      );

      expect(success).toBe(true);
      expect(mockUpsert).toHaveBeenCalledWith({
        key: 'zones.power_z1_max_pct',
        value: '60',
        scope: 'user',
        scope_id: 'user123',
        data_type: 'number'
      }, {
        onConflict: 'key,scope,scope_id'
      });
    });
  });

  describe('validateValue', () => {
    it('should validate number constraints', () => {
      const valid1 = configResolver.validateValue(25, 'number', { min: 20, max: 30 });
      expect(valid1).toBe(true);

      const valid2 = configResolver.validateValue(15, 'number', { min: 20, max: 30 });
      expect(valid2).toBe(false);

      const valid3 = configResolver.validateValue(35, 'number', { min: 20, max: 30 });
      expect(valid3).toBe(false);
    });

    it('should validate array types', () => {
      const valid1 = configResolver.validateValue([1, 2, 3], 'array');
      expect(valid1).toBe(true);

      const valid2 = configResolver.validateValue('not an array', 'array');
      expect(valid2).toBe(false);
    });

    it('should validate boolean types', () => {
      const valid1 = configResolver.validateValue(true, 'boolean');
      expect(valid1).toBe(true);

      const valid2 = configResolver.validateValue('true', 'boolean');
      expect(valid2).toBe(false);
    });
  });
});
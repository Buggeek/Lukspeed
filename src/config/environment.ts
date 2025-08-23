// Centralized environment configuration for LukSpeed
export const ENV = {
  // Supabase Configuration
  SUPABASE: {
    URL: process.env.PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Strava Configuration
  STRAVA: {
    CLIENT_ID: process.env.STRAVA_CLIENT_ID || '',
    CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET || '',
  },
  
  // Environment validation
  validate() {
    const required = [
      'PUBLIC_SUPABASE_URL',
      'PUBLIC_SUPABASE_ANON_KEY', 
      'STRAVA_CLIENT_ID',
      'STRAVA_CLIENT_SECRET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ Missing environment variables:', missing);
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    console.log('✅ All environment variables validated');
    return true;
  }
} as const;

// Export individual configs for convenience
export const SUPABASE_CONFIG = ENV.SUPABASE;
export const STRAVA_CONFIG = ENV.STRAVA;

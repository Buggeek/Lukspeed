# Environment Variables Configuration

## 🔧 Current Production Variables (Vercel)

```
PUBLIC_SUPABASE_URL=https://tebrbispkzjtlilpquaz.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_i3pdpa16MmaV8M8d-8egqw_jPg4LAnG
STRAVA_CLIENT_ID=43486
STRAVA_CLIENT_SECRET=fcc023f20b271ba15bd45eb219a5fecbbcf4b752
```

## 📋 Variable Naming Convention

- **PUBLIC VARS:** Use `PUBLIC_*` prefix (accessible in browser)
- **SERVER VARS:** Use direct names (server-side only)
- **CONSISTENCY:** Always use same format across all files

## 🏗️ Best Practices Implemented

1. **Centralized Config:** Use `src/config/environment.ts`
2. **Validation:** Check all required vars on app start
3. **Documentation:** Update this file when adding variables
4. **Simple Naming:** PUBLIC_ prefix for public vars
5. **TypeScript:** Strong typing for environment variables

## 🔧 Usage Example

```typescript
import { ENV, SUPABASE_CONFIG } from '@/config/environment';

// Validate all variables (throws if missing)
ENV.validate();

// Use specific configs
const supabaseUrl = SUPABASE_CONFIG.URL;
const stravaClientId = ENV.STRAVA.CLIENT_ID;
```

## 🚨 Adding New Variables

1. Add to Vercel dashboard with proper prefix
2. Update `src/config/environment.ts`
3. Add to validation array
4. Update this documentation
5. Test in development and production

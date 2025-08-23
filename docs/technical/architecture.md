# LukSpeed Architecture Overview

## 🏗️ **System Architecture**

LukSpeed is a modern web application built with React, TypeScript, and Supabase, designed to transform technical cycling metrics into compelling narratives.

### **High-Level Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Strava API    │────│   LukSpeed App   │────│   Supabase DB   │
│                 │    │                  │    │                 │
│ • OAuth 2.0     │    │ • React Frontend │    │ • User Profiles │
│ • Activities    │    │ • TypeScript     │    │ • Activity Data │
│ • Athlete Data  │    │ • Tailwind CSS   │    │ • Metrics Cache │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────────────┐
                    │   Vercel Hosting    │
                    │                     │
                    │ • Edge Functions    │
                    │ • Static Hosting    │
                    │ • Auto Deployment   │
                    └─────────────────────┘
```

## 📁 **Project Structure**

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── narrative/       # Storytelling components
│   └── ui/              # Shadcn-ui base components
├── hooks/               # Custom React hooks
│   ├── narrative/       # Narrative-specific hooks
│   └── useAuth.ts       # Authentication hook
├── services/            # Core business logic
│   ├── Logger.ts        # Centralized logging
│   ├── StravaSync.ts    # Strava API integration
│   └── MetricsCalculator.ts # Performance calculations
├── pages/               # Route components
│   ├── Auth.tsx         # Authentication page
│   ├── NarrativeDashboard.tsx # Main dashboard
│   └── LogViewerPage.tsx # Development logs
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Database client
│   └── utils.ts         # Helper functions
└── types/               # TypeScript definitions
    └── strava.ts        # Strava API types
```

## 🔄 **Data Flow**

### **Authentication Flow**
1. User clicks "Connect with Strava"
2. Redirect to Strava OAuth authorization
3. Strava returns authorization code
4. Exchange code for access/refresh tokens
5. Create/update user profile in Supabase
6. Store tokens securely for API access

### **Metrics Processing Flow**
1. Fetch recent activities from Strava API
2. Process raw activity data through MetricsCalculator
3. Calculate advanced metrics (FTP, CdA, efficiency)
4. Transform technical data into narrative format
5. Cache processed metrics in Supabase
6. Display interactive dashboard to user

### **Real-time Updates**
1. User interacts with dashboard components
2. Swipe gestures trigger metric transitions
3. Pull-to-refresh initiates data sync
4. WebSocket connections for live updates (future)

## 🛠️ **Core Components**

### **Frontend Architecture**
- **React 18** with hooks-based architecture
- **TypeScript** for type safety and developer experience
- **Tailwind CSS** for responsive, mobile-first design
- **Shadcn-ui** for consistent UI components
- **React Router** for client-side navigation

### **Backend Architecture**
- **Supabase** for database, authentication, and real-time features
- **PostgreSQL** for relational data storage
- **Row Level Security (RLS)** for data isolation
- **Edge Functions** for server-side processing

### **External Integrations**
- **Strava API v3** for activity and athlete data
- **OAuth 2.0** for secure authentication
- **Vercel** for hosting and continuous deployment

## 📊 **Database Schema**

### **Core Tables**
- `profiles` - User profiles with Strava integration
- `app_dbd0941867_activities` - Cached activity data
- `app_dbd0941867_metrics` - Processed performance metrics
- `app_dbd0941867_narratives` - Generated story content

### **Security Model**
- All tables implement Row Level Security (RLS)
- Users can only access their own data
- Service role used for background processing
- Audit trails for data modifications

## 🔍 **Monitoring & Observability**

### **Logging System**
- **Centralized Logger** with 5 severity levels
- **Category-based** filtering (auth, sync, metrics, ui, api, performance)
- **localStorage persistence** for client-side debugging
- **Real-time log viewer** for development

### **Performance Monitoring**
- **Timer tracking** for critical operations
- **API response time** monitoring
- **Component render performance** tracking
- **Error boundary** catching and reporting

## 🔐 **Security Architecture**

### **Authentication & Authorization**
- **OAuth 2.0** with Strava for secure authentication
- **JWT tokens** for session management
- **Refresh token rotation** for enhanced security
- **Anonymous authentication** as fallback

### **Data Protection**
- **API keys** stored in environment variables
- **Sensitive data** encrypted at rest
- **HTTPS** enforced for all communications
- **Rate limiting** on API endpoints

## 🚀 **Deployment Architecture**

### **Vercel Integration**
- **Automatic deployments** from main branch
- **Preview deployments** for pull requests
- **Edge functions** for serverless compute
- **Global CDN** for optimal performance

### **Environment Management**
- **Development** - Local development with hot reload
- **Staging** - Preview deployments for testing
- **Production** - Live platform at lukspeed.com

---

## 📈 **Scalability Considerations**

### **Performance Optimizations**
- **Code splitting** for smaller bundle sizes
- **Lazy loading** for non-critical components
- **Caching strategies** for API responses
- **Image optimization** for faster loads

### **Future Enhancements**
- **Webhook integration** for real-time Strava updates
- **AI-powered insights** using machine learning
- **Multi-sport support** beyond cycling
- **Social features** for athlete communities

---

*This architecture supports the current feature set while providing a foundation for future growth and scalability.*
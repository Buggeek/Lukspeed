# Components Guide

## 📱 **Component Catalog**

This guide provides a comprehensive overview of all React components in the LukSpeed application, organized by functionality and usage patterns.

## 🔐 **Authentication Components**

### **StravaAuthButton**
```typescript
/**
 * @component StravaAuthButton
 * @description Primary authentication component with OAuth integration
 * @version 1.2.0
 * @props None - Self-contained component
 * @dependencies Logger service for timing and error tracking
 * @example <StravaAuthButton />
 */
```

**Location:** `src/components/auth/StravaAuthButton.tsx`

**Features:**
- One-click Strava OAuth initiation
- Loading states and error handling
- Performance timing with Logger integration
- Responsive design for mobile and desktop

**Usage:**
```tsx
import { StravaAuthButton } from '@/components/auth/StravaAuthButton';

function AuthPage() {
  return (
    <div className="auth-container">
      <StravaAuthButton />
    </div>
  );
}
```

## 📊 **Dashboard Components**

### **NarrativeDashboard**
```typescript
/**
 * @component NarrativeDashboard
 * @description Main dashboard that transforms metrics into compelling narratives
 * @version 1.2.0
 * @props None - Uses hooks for data management
 * @dependencies useRealStravaMetrics, MetricCard components
 * @example <NarrativeDashboard />
 */
```

**Location:** `src/pages/NarrativeDashboard.tsx`

**Features:**
- Real-time Strava data integration
- Mobile-first responsive design
- Touch gestures (swipe, pull-to-refresh)
- Narrative storytelling interface
- Loading states and error boundaries

### **MetricCard**
```typescript
/**
 * @component MetricCard
 * @description Individual metric display with narrative context
 * @version 1.1.0
 * @props {Metric} metric - Metric data object
 * @props {boolean} isActive - Card selection state
 * @example <MetricCard metric={ftpData} isActive={true} />
 */
```

**Features:**
- Animated metric transitions
- Context-aware narratives
- Touch interaction support
- Accessibility compliant

### **DataSourceIndicator**
```typescript
/**
 * @component DataSourceIndicator
 * @description Shows whether data is real or demo
 * @version 1.2.0
 * @props {boolean} isRealData - Data authenticity flag
 * @props {boolean} isLoading - Loading state
 * @example <DataSourceIndicator isRealData={true} isLoading={false} />
 */
```

**Location:** `src/components/narrative/DataSourceIndicator.tsx`

**Features:**
- Visual indication of data source
- Loading state representation
- Minimal, non-intrusive design

## 🧩 **UI Components (Shadcn-ui)**

### **Core Components**
All UI components are based on Shadcn-ui and fully customizable:

**Button Components:**
- `Button` - Primary action buttons
- `ButtonGroup` - Grouped button controls
- `ToggleButton` - State toggle controls

**Layout Components:**
- `Card` - Content containers
- `Sheet` - Slide-out panels
- `Dialog` - Modal dialogs
- `Drawer` - Bottom sheet drawers

**Form Components:**
- `Input` - Text input fields
- `Select` - Dropdown selections
- `Switch` - Boolean toggles
- `Slider` - Range inputs

**Feedback Components:**
- `Alert` - Status messages
- `Toast` - Temporary notifications
- `Progress` - Loading indicators
- `Skeleton` - Loading placeholders

## 🔧 **Utility Components**

### **LogViewer**
```typescript
/**
 * @component LogViewer
 * @description Development tool for viewing application logs
 * @version 1.2.0
 * @props None - Reads from Logger service
 * @dependencies Logger service
 * @example <LogViewer />
 */
```

**Location:** `src/utils/LogViewer.tsx`

**Features:**
- Real-time log filtering
- Category-based organization
- Export functionality
- Search capabilities
- Auto-refresh every 2 seconds

### **ErrorBoundary**
```typescript
/**
 * @component ErrorBoundary
 * @description React error boundary with automatic logging
 * @version 1.2.0
 * @props {ReactNode} children - Components to wrap
 * @props {string} fallback - Error display component
 * @dependencies useErrorBoundary hook
 * @example <ErrorBoundary><App /></ErrorBoundary>
 */
```

**Location:** `src/hooks/useErrorBoundary.ts`

**Features:**
- Automatic error catching
- Detailed error logging
- Graceful fallback UI
- Development-friendly error display

## 📱 **Page Components**

### **Index (Homepage)**
```typescript
/**
 * @component Index
 * @description Landing page with call-to-action
 * @version 1.0.0
 * @props None
 * @example <Route path="/" element={<Index />} />
 */
```

**Features:**
- Hero section with value proposition
- Clear call-to-action flow
- Responsive design
- Performance optimized

### **Auth**
```typescript
/**
 * @component Auth
 * @description Authentication page with Strava integration
 * @version 1.1.0
 * @props None
 * @dependencies StravaAuthButton
 * @example <Route path="/auth" element={<Auth />} />
 */
```

**Features:**
- Streamlined authentication flow
- Visual branding consistency
- Error state handling
- Mobile optimization

### **AuthCallback**
```typescript
/**
 * @component AuthCallback
 * @description OAuth callback handler with manual token exchange
 * @version 1.2.0
 * @props None
 * @dependencies Logger, Supabase client
 * @example <Route path="/auth/callback" element={<AuthCallback />} />
 */
```

**Features:**
- OAuth code exchange
- User profile creation/update
- Comprehensive error handling
- Detailed logging integration

### **LogViewerPage**
```typescript
/**
 * @component LogViewerPage
 * @description Full-page log viewer for development
 * @version 1.2.0
 * @props None
 * @dependencies LogViewer component
 * @example <Route path="/logs" element={<LogViewerPage />} />
 */
```

**Features:**
- Full-screen log interface
- Navigation breadcrumbs
- Export capabilities
- Real-time updates

## 🎨 **Styling Patterns**

### **Design System**
- **Colors:** Consistent palette with CSS custom properties
- **Typography:** Systematic scale with Tailwind classes
- **Spacing:** 8px grid system for consistent layouts
- **Breakpoints:** Mobile-first responsive design

### **Component Patterns**
```tsx
// Standard component structure
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState();
  const { data, loading } = useCustomHook();
  
  // Event handlers
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  // Render with consistent class patterns
  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg">
        {/* Component content */}
      </Card>
    </div>
  );
}
```

## 🧪 **Testing Patterns**

### **Component Testing**
Each component should have corresponding tests:

```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('handles user interactions', () => {
    // Interaction tests
  });
});
```

## 📚 **Component Dependencies**

### **Dependency Graph**
- **UI Components** → Shadcn-ui base components
- **Page Components** → Custom hooks + UI components
- **Custom Components** → Services (Logger, StravaSync) + UI components
- **All Components** → TypeScript types for props validation

### **Import Patterns**
```typescript
// External dependencies
import React from 'react';
import { useCallback, useState } from 'react';

// UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Custom hooks and services
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/services/Logger';

// Types
import type { ComponentProps } from '@/types';
```

---

## 🚀 **Performance Considerations**

### **Optimization Strategies**
- **Lazy loading** for non-critical components
- **Memoization** for expensive calculations
- **Virtual scrolling** for large lists (future)
- **Image optimization** for media content

### **Bundle Size Management**
- **Code splitting** at route level
- **Tree shaking** for unused code elimination
- **Dynamic imports** for conditional features

---

*This component guide is automatically updated with each release to reflect the current codebase structure.*
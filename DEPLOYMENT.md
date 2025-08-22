# LukSpeed Deployment Guide

## 🚀 Quick Start

### Frontend Deployment

The React frontend is ready for deployment. Run these commands:

```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build

# Preview the build
pnpm run preview
```

### Backend Deployment

1. **Set up Python environment**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Start the FastAPI server**:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Database Setup

Execute the SQL schema in `database/schema.sql` in your PostgreSQL database:

```sql
-- Run all commands in database/schema.sql
```

## 🌐 Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://user:password@localhost/lukspeed
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
JWT_SECRET_KEY=your_jwt_secret_key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📋 Features Implemented

### ✅ Core Features
- **Dashboard**: Performance metrics, trends, recent activities
- **Activities**: List, filter, and view cycling activities
- **Bicycles**: Manage bike collection and configurations
- **Fittings**: Bike fitting measurements and adjustments
- **Analytics**: Performance analysis with charts and visualizations
- **Profile**: User and cyclist profile management

### ✅ Technical Implementation
- **Frontend**: React + TypeScript + Shadcn/ui + Tailwind CSS
- **Backend**: FastAPI + Python with comprehensive API endpoints
- **Database**: PostgreSQL schema with proper relationships
- **Authentication**: Strava OAuth integration ready
- **Data Processing**: .fit file processing architecture
- **Responsive Design**: Mobile-friendly interface

### 🔄 API Endpoints Available
- `POST /auth/strava/connect` - Strava OAuth initiation
- `POST /auth/strava/callback` - OAuth callback handling
- `GET /users/profile` - User profile management
- `GET /activities` - Activity listing with pagination
- `POST /activities/sync` - Strava sync functionality
- `GET /analytics/dashboard` - Dashboard data
- `GET /bicycles` - Bicycle management

## 🧪 Testing the Application

1. **Start both servers**:
   - Frontend: `pnpm run dev` (port 5173)
   - Backend: `python backend/main.py` (port 8000)

2. **Test the features**:
   - Navigate through all pages using the sidebar
   - Test the responsive design on different screen sizes
   - Verify all components render correctly
   - Check mock data displays properly

## 📊 Mock Data

The application includes comprehensive mock data for testing:
- Sample cycling activities with realistic metrics
- Multiple bicycle configurations
- Performance trends and analytics
- Bike fitting measurements

## 🔧 Customization

The platform is built with modularity in mind:
- **Components**: Reusable UI components in `src/components/`
- **Pages**: Feature pages in `src/pages/`
- **Types**: TypeScript interfaces in `src/types/`
- **API**: Centralized API client in `src/lib/api.ts`

## 📈 Next Steps

To complete the full LukSpeed vision:

1. **Strava Integration**: Implement real OAuth flow
2. **Database Connection**: Connect to actual PostgreSQL/Supabase
3. **FIT File Processing**: Add real .fit file parsing
4. **Advanced Analytics**: Implement NP, IF, TSS calculations
5. **ML Models**: Add FitAI recommendations
6. **Real-time Updates**: WebSocket integration for live data

The foundation is solid and ready for these enhancements!
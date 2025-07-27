# ServeMee - Lightning Fast Service Delivery Platform

## Overview
ServeMee is a hyper-local service marketplace that connects consumers with verified, neighborhood-based service providers for instant, reliable, and trusted local services.

## Technology Stack
- **Frontend**: Next.js 15 with TypeScript
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with PostGIS extension
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Firebase project with Authentication enabled

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd servemee
```

2. **Run the setup script (Ubuntu)**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Configure Firebase**
```bash
chmod +x scripts/setup-firebase.sh
./scripts/setup-firebase.sh
```

4. **Set up environment variables**

Backend (.env):
```bash
cp backend/.env.example backend/.env
# Update with your database and Firebase credentials
```

Frontend (.env.local):
```bash
cp frontend/.env.local.example frontend/.env.local
# Update with your Firebase web config
```

5. **Run database migrations**
```bash
cd backend
npm run migration:run
```

6. **Start the development servers**
```bash
# Option 1: Use the convenience script
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh

# Option 2: Start manually
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs (development only)

## Features

### For Consumers
- Browse service categories and types
- Request services with location-based matching
- Book services with specific providers
- Track service requests and bookings
- Rate and review completed services
- OTP-based service verification

### For Service Providers
- Create and manage service offerings
- Set operational areas/localities
- Accept and manage service requests
- Handle bookings and scheduling
- Receive ratings and reviews
- Real-time notifications

### For Administrators
- Manage service categories and types
- Oversee user accounts and providers
- Monitor platform activity
- Manage geographical data (countries, states, districts, localities)

## Architecture

### Backend Structure
```
backend/src/
├── auth/                 # Authentication & authorization
├── user/                 # User management
├── service-provider/     # Service provider profiles
├── service/             # Service offerings
├── service-category/    # Service categorization
├── service-type/        # Service type definitions
├── service-request/     # Service request handling
├── booking/             # Booking management
├── rating-review/       # Review system
├── locality/            # Location management
├── country/             # Country data
├── state/               # State data
├── district/            # District data
├── config/              # Configuration files
├── common/              # Shared utilities
└── migrations/          # Database migrations
```

### Frontend Structure
```
frontend/src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── lib/                 # Third-party library configurations
```

## Database Schema

The application uses a PostgreSQL database with the following main entities:
- **Users**: Consumer and service provider accounts
- **Service Providers**: Extended profiles for service providers
- **Services**: Individual service offerings
- **Service Categories**: High-level service groupings
- **Service Types**: Specific service classifications
- **Service Requests**: Consumer requests for services
- **Bookings**: Scheduled service appointments
- **Ratings & Reviews**: Feedback system
- **Geographical Hierarchy**: Countries → States → Districts → Localities

## API Documentation

When running in development mode, comprehensive API documentation is available at:
http://localhost:3000/api/docs

The API follows RESTful conventions with:
- JWT-based authentication via Firebase
- Role-based access control
- Comprehensive input validation
- Structured error responses
- Request/response logging

## Security Features

- Firebase Authentication integration
- Role-based access control (Consumer, Service Provider, Admin)
- Input validation and sanitization
- CORS configuration
- Security headers
- OTP verification for service completion
- Protected routes and API endpoints

## Deployment

### Production Environment Variables

Backend:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
FRONTEND_URL=https://your-domain.com
```

Frontend:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
```

### Build Commands
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Check the API documentation at `/api/docs`
- Review the database schema in `backend/schema_dump.sql`
- Examine the migration files for database structure

## Prerequisites

### System Requirements (Ubuntu)
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource repository)
curl -fsSL [https://deb.nodesource.com/setup_18.x](https://deb.nodesource.com/setup_18.x) | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL and PostGIS
sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3 -y

# Install Git (if not already installed)
sudo apt install git -y

# Verify installations
node --version  # Should be 18+
npm --version
psql --version

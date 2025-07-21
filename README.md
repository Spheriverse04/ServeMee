# ServeMee - Lightning Fast Service Delivery Platform

## Overview
ServeMee is a hyper-local service marketplace that connects consumers with verified, neighborhood-based service providers for instant, reliable, and trusted local services.

## Technology Stack
- **Frontend**: Next.js 15 with TypeScript
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with PostGIS extension
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS

## Prerequisites

### System Requirements (Ubuntu)
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL and PostGIS
sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3 -y

# Install Git (if not already installed)
sudo apt install git -y

# Verify installations
node --version  # Should be 18+
npm --version
psql --version
```

## Project Setup

### 1. Clone and Setup Project Structure
```bash
# Navigate to your desired directory
cd ~/
mkdir servemee-project
cd servemee-project

# If you have the code, copy it here
# Otherwise, create the structure as provided
```

### 2. Database Setup
```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE servemee_db;
CREATE USER servemee_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE servemee_db TO servemee_user;
ALTER USER servemee_user CREATEDB;
\q
EOF

# Enable PostGIS extension
sudo -u postgres psql -d servemee_db << EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
\q
EOF
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file (see backend/.env.example below)
cp .env.example .env
nano .env  # Edit with your actual values

# Run database migrations
npm run migration:run

# Start the backend server
npm run start:dev
```

### 4. Frontend Setup
```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file (see frontend/.env.local.example below)
cp .env.local.example .env.local
nano .env.local  # Edit with your actual values

# Start the frontend server
npm run dev
```

## Environment Configuration

### Backend Environment (.env)
See backend/.env.example for required variables.

### Frontend Environment (.env.local)
See frontend/.env.local.example for required variables.

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password and Phone
4. Generate service account key for backend
5. Get web app config for frontend

## Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api (if Swagger is configured)

## Database Management

### Run Migrations
```bash
cd backend
npm run migration:run
```

### Revert Migrations
```bash
cd backend
npm run migration:revert
```

### Generate New Migration
```bash
cd backend
npm run migration:generate -- -n MigrationName
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000 or 3001
   sudo lsof -t -i tcp:3000 | xargs kill -9
   sudo lsof -t -i tcp:3001 | xargs kill -9
   ```

2. **PostgreSQL Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

3. **Permission Issues**
   ```bash
   # Fix npm permissions
   sudo chown -R $(whoami) ~/.npm
   ```

## Project Structure
```
servemee-project/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── user/           # User management
│   │   ├── service/        # Service management
│   │   ├── booking/        # Booking system
│   │   ├── locality/       # Location management
│   │   ├── service-category/ # Service categories
│   │   ├── service-type/   # Service types
│   │   ├── service-request/ # Service requests
│   │   ├── rating-review/  # Rating system
│   │   └── migration/      # Database migrations
│   ├── .env               # Environment variables
│   └── package.json
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   └── lib/          # Utilities
│   ├── .env.local        # Environment variables
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
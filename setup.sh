#!/bin/bash

# ServeMee Project Setup Script for Ubuntu
# Run this script to set up the entire project

set -e  # Exit on any error

echo "🚀 Setting up ServeMee Project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    print_warning "This script is designed for Ubuntu. Proceed with caution on other systems."
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed successfully"
else
    print_success "Node.js is already installed"
fi

# Install PostgreSQL and PostGIS
print_status "Installing PostgreSQL and PostGIS..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3 -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL and PostGIS installed successfully"
else
    print_success "PostgreSQL is already installed"
fi

# Install Git
print_status "Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
    print_success "Git installed successfully"
else
    print_success "Git is already installed"
fi

# Verify installations
print_status "Verifying installations..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "PostgreSQL version: $(psql --version)"
echo "Git version: $(git --version)"

# Database setup
print_status "Setting up database..."
read -p "Enter database password for servemee_user: " -s db_password
echo

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE IF NOT EXISTS servemee_db;
CREATE USER IF NOT EXISTS servemee_user WITH PASSWORD '$db_password';
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

print_success "Database setup completed"

# Backend setup
print_status "Setting up backend..."
cd backend

# Install backend dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    # Update database password in .env
    sed -i "s/your_secure_password/$db_password/g" .env
    print_warning "Please update backend/.env with your Firebase credentials"
fi

print_success "Backend dependencies installed"

# Frontend setup
print_status "Setting up frontend..."
cd ../frontend

# Install frontend dependencies
npm install

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    print_warning "Please update frontend/.env.local with your Firebase credentials"
fi

print_success "Frontend dependencies installed"

# Go back to root directory
cd ..

print_success "🎉 ServeMee project setup completed!"
echo
print_status "Next steps:"
echo "1. Update Firebase credentials in backend/.env and frontend/.env.local"
echo "2. Run database migrations: cd backend && npm run migration:run"
echo "3. Start backend: cd backend && npm run start:dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo
print_status "Access your application at:"
echo "- Frontend: http://localhost:3001"
echo "- Backend API: http://localhost:3000"
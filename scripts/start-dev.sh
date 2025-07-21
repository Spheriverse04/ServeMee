#!/bin/bash

# Development startup script
# This script starts both backend and frontend in development mode

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_warning "Please run this script from the project root directory"
    exit 1
fi

# Function to kill processes on exit
cleanup() {
    print_status "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up trap to cleanup on exit
trap cleanup SIGINT SIGTERM

print_status "Starting ServeMee development servers..."

# Start backend
print_status "Starting backend server..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
print_status "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

print_success "Development servers started!"
print_status "Backend running on: http://localhost:3000"
print_status "Frontend running on: http://localhost:3001"
print_status "Press Ctrl+C to stop both servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
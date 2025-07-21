#!/bin/bash

# Firebase setup helper script
# This script guides you through Firebase configuration

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔥 Firebase Configuration Helper"
echo "================================"
echo

print_status "This script will help you configure Firebase for ServeMee"
echo

print_warning "Before proceeding, make sure you have:"
echo "1. Created a Firebase project at https://console.firebase.google.com/"
echo "2. Enabled Authentication with Email/Password and Phone"
echo "3. Generated a service account key"
echo "4. Obtained your web app configuration"
echo

read -p "Have you completed the above steps? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Please complete the Firebase setup first"
    exit 1
fi

# Backend Firebase configuration
print_status "Configuring backend Firebase..."
echo

if [ ! -f "backend/firebase-admin-sdk.json" ]; then
    print_warning "Service account key not found at backend/firebase-admin-sdk.json"
    echo "Please download your service account key from Firebase Console:"
    echo "1. Go to Project Settings > Service Accounts"
    echo "2. Click 'Generate new private key'"
    echo "3. Save the file as 'firebase-admin-sdk.json' in the backend directory"
    echo
    read -p "Press Enter when you've added the service account key..."
fi

# Frontend Firebase configuration
print_status "Configuring frontend Firebase..."
echo

if [ ! -f "frontend/.env.local" ]; then
    print_error "Frontend environment file not found"
    print_status "Creating from template..."
    cp frontend/.env.local.example frontend/.env.local
fi

echo "Please provide your Firebase web app configuration:"
echo

read -p "API Key: " api_key
read -p "Auth Domain: " auth_domain
read -p "Project ID: " project_id
read -p "Storage Bucket: " storage_bucket
read -p "Messaging Sender ID: " messaging_sender_id
read -p "App ID: " app_id

# Update frontend .env.local
sed -i "s/your-api-key/$api_key/g" frontend/.env.local
sed -i "s/your-project-id.firebaseapp.com/$auth_domain/g" frontend/.env.local
sed -i "s/your-project-id/$project_id/g" frontend/.env.local
sed -i "s/your-project-id.appspot.com/$storage_bucket/g" frontend/.env.local
sed -i "s/123456789/$messaging_sender_id/g" frontend/.env.local
sed -i "s/1:123456789:web:abcdef123456/$app_id/g" frontend/.env.local

print_success "Firebase configuration completed!"
echo

print_status "Next steps:"
echo "1. Verify your Firebase Authentication settings"
echo "2. Test the authentication flow"
echo "3. Configure Firebase Storage if needed"
echo

print_warning "Remember to keep your Firebase credentials secure and never commit them to version control!"
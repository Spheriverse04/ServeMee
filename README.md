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

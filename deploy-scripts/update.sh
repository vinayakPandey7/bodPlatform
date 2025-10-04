#!/bin/bash

# Update script for theciero.com
# Run this script to update your deployed application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/theciero"

echo -e "${GREEN}🔄 Starting application update...${NC}"

# Navigate to project directory
cd $PROJECT_DIR

# Pull latest changes (if using Git)
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
# git pull origin main

# Update backend dependencies
echo -e "${YELLOW}📦 Updating backend dependencies...${NC}"
cd $PROJECT_DIR/server
npm install --production

# Update frontend dependencies
echo -e "${YELLOW}📦 Updating frontend dependencies...${NC}"
cd $PROJECT_DIR/client
npm install --production

# Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

# Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
pm2 restart all

# Check status
echo -e "${YELLOW}📊 Checking service status...${NC}"
pm2 status

echo -e "${GREEN}✅ Update completed successfully!${NC}"
echo -e "${GREEN}📊 Monitor your services with: pm2 status${NC}"
echo -e "${GREEN}📝 View logs with: pm2 logs${NC}"

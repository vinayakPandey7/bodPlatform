#!/bin/bash

# Quick deployment script for theciero.com
# This script deploys from your local machine to AWS
#
# ⚠️  NOTE: This is a BACKUP/MANUAL deployment script
# Primary deployment uses GitHub Actions (automatic on push)
# Use this script only when:
#   - GitHub Actions is down
#   - You need an emergency hotfix
#   - You want to deploy without pushing to GitHub

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SSH_KEY="${SSH_KEY:-$HOME/Downloads/theciero.pem}"
AWS_HOST="${AWS_HOST:-theciero.com}"
AWS_USER="${AWS_USER:-ubuntu}"
DEPLOY_PATH="/var/www/theciero"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${GREEN}🚀 Quick Deploy to theciero.com${NC}"
echo "=================================="
echo ""
echo "SSH Key: $SSH_KEY"
echo "AWS Host: $AWS_HOST"
echo "Local Dir: $PROJECT_DIR"
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH key not found: $SSH_KEY${NC}"
    echo "Please set SSH_KEY environment variable or place key at ~/Downloads/theciero.pem"
    exit 1
fi

# Test SSH connection
echo -e "${YELLOW}🔐 Testing SSH connection...${NC}"
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$AWS_USER@$AWS_HOST" "echo 'Connected'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to AWS server${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"

# Create deployment archive
echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
cd "$PROJECT_DIR"
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='client/node_modules' \
    --exclude='server/node_modules' \
    --exclude='.github' \
    -czf /tmp/bodPlatform-deploy.tar.gz .
echo -e "${GREEN}✅ Archive created: $(du -h /tmp/bodPlatform-deploy.tar.gz | cut -f1)${NC}"

# Upload to server
echo -e "${YELLOW}⬆️  Uploading to AWS...${NC}"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no /tmp/bodPlatform-deploy.tar.gz "$AWS_USER@$AWS_HOST:/tmp/"
echo -e "${GREEN}✅ Upload completed${NC}"

# Deploy on server
echo -e "${YELLOW}🚀 Deploying on server...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$AWS_USER@$AWS_HOST" << 'ENDSSH'
set -e

DEPLOY_PATH="/var/www/theciero"

echo "📋 Backing up environment files..."
cp $DEPLOY_PATH/server/.env /tmp/server.env.backup
cp $DEPLOY_PATH/client/.env.production /tmp/client.env.backup 2>/dev/null || true

echo "📂 Extracting new code..."
cd $DEPLOY_PATH
tar -xzf /tmp/bodPlatform-deploy.tar.gz

echo "🔄 Restoring environment files..."
cp /tmp/server.env.backup server/.env
cp /tmp/client.env.backup client/.env.production 2>/dev/null || true

echo "📦 Installing backend dependencies..."
cd $DEPLOY_PATH/server
npm install --production --silent

echo "📦 Installing frontend dependencies..."
cd $DEPLOY_PATH/client
npm install --production --silent

echo "🏗️  Building frontend..."
rm -rf .next
NODE_ENV=production npm run build

echo "🔄 Restarting services..."
pm2 restart all
pm2 save

echo "🧹 Cleaning up..."
rm /tmp/bodPlatform-deploy.tar.gz

echo "✅ Deployment completed successfully!"
date
ENDSSH

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://theciero.com)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Website is healthy (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}⚠️  Warning: Website returned HTTP $HTTP_CODE${NC}"
fi

# Cleanup local temp file
rm /tmp/bodPlatform-deploy.tar.gz

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${GREEN}🌐 Visit: https://theciero.com${NC}"
echo ""


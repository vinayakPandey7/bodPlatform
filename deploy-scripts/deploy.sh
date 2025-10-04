#!/bin/bash

# Deployment script for theciero.com on AWS Ubuntu
# Make sure to run this script as root or with sudo

set -e

echo "🚀 Starting deployment for theciero.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="theciero.com"
PROJECT_DIR="/var/www/theciero"
BACKEND_PORT=5000
FRONTEND_PORT=3000

echo -e "${GREEN}📋 Deployment Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "Project Directory: $PROJECT_DIR"
echo "Backend Port: $BACKEND_PORT"
echo "Frontend Port: $FRONTEND_PORT"

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Node.js 20.x
echo -e "${YELLOW}📦 Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo -e "${YELLOW}📦 Installing PM2...${NC}"
npm install -g pm2

# Install MongoDB
echo -e "${YELLOW}📦 Installing MongoDB...${NC}"
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
apt install -y nginx

# Install Certbot for SSL
echo -e "${YELLOW}📦 Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

# Create project directory
echo -e "${YELLOW}📁 Creating project directory...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone or update repository (adjust URL as needed)
echo -e "${YELLOW}📥 Setting up project files...${NC}"
# If you're using Git, uncomment and modify the next line:
# git clone https://github.com/yourusername/bodPlatform.git .

# For now, we'll assume you'll upload the files manually
echo "Please upload your project files to $PROJECT_DIR"

# Install dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd $PROJECT_DIR/server
npm install --production

echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd $PROJECT_DIR/client
npm install --production

# Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

# Copy Nginx configuration
echo -e "${YELLOW}⚙️ Configuring Nginx...${NC}"
cp $PROJECT_DIR/nginx/theciero.com.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/theciero.com.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start services with PM2
echo -e "${YELLOW}🚀 Starting services with PM2...${NC}"

# Create PM2 ecosystem file
cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: '$PROJECT_DIR/server',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_file: '/var/log/pm2/backend-combined.log',
      time: true
    },
    {
      name: 'frontend',
      cwd: '$PROJECT_DIR/client',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: $FRONTEND_PORT
      },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
      log_file: '/var/log/pm2/frontend-combined.log',
      time: true
    }
  ]
};
EOF

# Configure environment variables
echo -e "${YELLOW}📝 Configuring environment variables...${NC}"
cd /var/www/theciero/server

# Copy the production environment file
if [ -f "env.production" ]; then
    sudo cp env.production .env.production
    echo -e "${GREEN}✅ Environment file copied successfully${NC}"
else
    echo -e "${RED}❌ Environment file not found. Please ensure env.production exists${NC}"
    echo "Creating a basic environment file..."
    sudo cp ../env.production.example .env.production
    echo -e "${YELLOW}⚠️  Please edit .env.production with your actual values${NC}"
fi

# Set proper permissions
sudo chown ubuntu:ubuntu .env.production
sudo chmod 600 .env.production

# Start PM2 processes
cd $PROJECT_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure firewall
echo -e "${YELLOW}🔒 Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Get SSL certificate
echo -e "${YELLOW}🔐 Getting SSL certificate...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email your-email@example.com

# Setup SSL auto-renewal
echo -e "${YELLOW}🔄 Setting up SSL auto-renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your website should be available at: https://$DOMAIN${NC}"
echo -e "${GREEN}📊 Monitor your services with: pm2 status${NC}"
echo -e "${GREEN}📝 View logs with: pm2 logs${NC}"

echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Update your DNS records to point to IP: 18.246.69.40"
echo "2. Environment variables are configured from env.production file"
echo "3. Restart services: pm2 restart all"
echo "4. Check logs: pm2 logs"
echo "5. Verify SSL certificate: https://theciero.com"

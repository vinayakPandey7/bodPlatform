# 🚀 Deployment Guide for theciero.com

## Quick Deployment Commands

### For Frontend Changes Only
```bash
# 1. Connect to your AWS server
ssh -i "theciero.pem" ubuntu@ec2-18-246-69-40.us-west-2.compute.amazonaws.com

# 2. Go to frontend directory
cd /var/www/theciero/client

# 3. Pull latest changes (if using Git)
git pull origin main

# 4. Install dependencies (if package.json changed)
npm install

# 5. Restart frontend
pm2 restart frontend

# 6. Check status
pm2 status
```

### For Backend Changes Only
```bash
# 1. Connect to your AWS server
ssh -i "theciero.pem" ubuntu@ec2-18-246-69-40.us-west-2.compute.amazonaws.com

# 2. Go to backend directory
cd /var/www/theciero/server

# 3. Pull latest changes (if using Git)
git pull origin main

# 4. Install dependencies (if package.json changed)
npm install

# 5. Restart backend
pm2 restart backend

# 6. Check status
pm2 status
```

### For Full Application Changes
```bash
# 1. Connect to your AWS server
ssh -i "theciero.pem" ubuntu@ec2-18-246-69-40.us-west-2.compute.amazonaws.com

# 2. Go to project directory
cd /var/www/theciero

# 3. Pull latest changes (if using Git)
git pull origin main

# 4. Restart both services
pm2 restart all

# 5. Check status
pm2 status
```

## 📋 Complete Deployment Process

### Step 1: Upload Changes to Server

#### Option A: Using Git (Recommended)
```bash
# On your local machine, commit and push changes
git add .
git commit -m "Your update message"
git push origin main

# On server, pull changes
ssh -i "theciero.pem" ubuntu@ec2-18-246-69-40.us-west-2.compute.amazonaws.com
cd /var/www/theciero
git pull origin main
```

#### Option B: Using SCP (Alternative)
```bash
# Upload frontend changes
scp -i "theciero.pem" -r client/ ubuntu@ec2-18-246-69-40.us-west-2.compute.amazonaws.com:/var/www/theciero/

# Upload backend changes
scp -i "theciero.pem" -r server/ ubuntu@ec2-18-246-69-40.us-west-2.compute.amazonaws.com:/var/www/theciero/
```

### Step 2: Update Dependencies

```bash
# Frontend dependencies
cd /var/www/theciero/client
npm install

# Backend dependencies
cd /var/www/theciero/server
npm install
```

### Step 3: Rebuild Frontend (if needed)

```bash
# Clear cache and rebuild
cd /var/www/theciero/client
rm -rf .next
npm run build
```

### Step 4: Restart Services

```bash
# Restart specific service
pm2 restart frontend
pm2 restart backend

# Or restart all
pm2 restart all

# Save PM2 configuration
pm2 save
```

### Step 5: Verify Deployment

```bash
# Check service status
pm2 status

# Test frontend
curl -I https://theciero.com

# Test backend
curl https://theciero.com/api/auth/login

# Check logs
pm2 logs frontend --lines 10
pm2 logs backend --lines 10
```

## 🔧 Troubleshooting Commands

### Check Service Status
```bash
# Check PM2 processes
pm2 status

# Check service logs
pm2 logs frontend --lines 20
pm2 logs backend --lines 20

# Check what's listening on ports
netstat -tlnp | grep :3000
netstat -tlnp | grep :5001
```

### Restart Services
```bash
# Stop and start specific service
pm2 stop frontend
pm2 start frontend

pm2 stop backend
pm2 start backend

# Or restart all
pm2 restart all
```

### Check Nginx
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Check SSL Certificate
```bash
# Check SSL certificate status
sudo certbot certificates

# Renew SSL certificate (if needed)
sudo certbot renew
```

## 📁 Important File Locations

### Server Configuration Files
- **Backend Environment**: `/var/www/theciero/server/.env.production`
- **Frontend Environment**: `/var/www/theciero/client/.env.production`
- **Nginx Configuration**: `/etc/nginx/sites-available/theciero-http.conf`
- **PM2 Configuration**: `~/.pm2/dump.pm2`

### Application Files
- **Frontend Code**: `/var/www/theciero/client/`
- **Backend Code**: `/var/www/theciero/server/`
- **Logs**: `~/.pm2/logs/`

## 🌐 Domain and SSL

### Your Current Setup
- **Domain**: theciero.com
- **SSL**: Let's Encrypt (auto-renewal enabled)
- **Backend Port**: 5001
- **Frontend Port**: 3000

### SSL Renewal (Automatic)
```bash
# Check if auto-renewal is working
sudo systemctl status certbot.timer

# Manual renewal (if needed)
sudo certbot renew
```

## 🚨 Emergency Commands

### If Website is Down
```bash
# Check all services
pm2 status
sudo systemctl status nginx

# Restart everything
pm2 restart all
sudo systemctl restart nginx

# Check logs for errors
pm2 logs --lines 50
sudo journalctl -u nginx --lines 20
```

### If Backend is Not Responding
```bash
# Check backend directly
curl http://localhost:5001/

# Check backend logs
pm2 logs backend --lines 20

# Restart backend
pm2 restart backend
```

### If Frontend is Not Responding
```bash
# Check frontend directly
curl -I http://localhost:3000

# Check frontend logs
pm2 logs frontend --lines 20

# Restart frontend
pm2 restart frontend
```

## 📝 Environment Variables

### Backend Environment (.env.production)
```bash
# Database
MONGODB_URI=mongodb+srv://boduser:HhjNas0NOGAHjCW5@cluster0.kevwf.mongodb.net/bod_service_portal?retryWrites=true&w=majority&appName=Cluster0

# Server
PORT=5001
NODE_ENV=production

# URLs
FRONTEND_URL=https://theciero.com
RESET_PASSWORD_URL=https://theciero.com/reset-password

# API URLs
NEXT_PUBLIC_API_URL=https://theciero.com/api
API_URL=https://theciero.com/api
```

### Frontend Environment (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://theciero.com/api
API_URL=https://theciero.com/api
NODE_ENV=production
```

## 🔄 Automated Deployment Script

Create this script for easy deployment:

```bash
#!/bin/bash
# Save as deploy.sh

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
cd /var/www/theciero/client
npm install

cd /var/www/theciero/server
npm install

# Restart services
pm2 restart all

# Save PM2 configuration
pm2 save

# Test deployment
echo "✅ Testing deployment..."
curl -I https://theciero.com
curl https://theciero.com/api/auth/login

echo "🎉 Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

## 📞 Support Information

- **Server IP**: 18.246.69.40
- **SSH Command**: `ssh -i "theciero.pem" ubuntu@ec2-18-246-69-40.us-west-2.compute.amazonaws.com`
- **Domain**: theciero.com
- **Backend API**: https://theciero.com/api
- **Frontend**: https://theciero.com

## ✅ Quick Health Check

Run this command to check if everything is working:
```bash
# Quick health check
pm2 status && curl -I https://theciero.com && curl https://theciero.com/api/auth/login
```

---

**🎉 Your website is live at: https://theciero.com**

Remember to always test your changes in a development environment before deploying to production!

# 🚀 Fresh Deployment Guide - AWS Ubuntu Instance

## 📋 Prerequisites

### Required Information
- **Domain**: theciero.com
- **AWS Instance**: Ubuntu 22.04 LTS (recommended)
- **Minimum Storage**: 20GB (recommended 30GB+)
- **Instance Type**: t3.medium or higher
- **Security Groups**: HTTP (80), HTTPS (443), SSH (22)

### Environment Variables Needed
```bash
# Database Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.kevwf.mongodb.net/bod_service_portal?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key

# Email Configuration
ADMIN_EMAIL_USER=admin@theciero.com
ADMIN_EMAIL_PASS=your_gmail_app_password_here
NOREPLY_EMAIL_USER=admin@theciero.com
NOREPLY_EMAIL_PASS=your_gmail_app_password_here
EMAIL_USER=admin@theciero.com
EMAIL_PASS=your_gmail_app_password_here

# Google Calendar Configuration
GOOGLE_CALENDAR_ADMIN_ENABLED=true
GOOGLE_CALENDAR_NOREPLY_ENABLED=true
GOOGLE_CALENDAR_DEFAULT_TIMEZONE=America/New_York

# Google OAuth Credentials
ADMIN_GOOGLE_CLIENT_ID=your_google_client_id_here
ADMIN_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
ADMIN_GOOGLE_PROJECT_ID=your_google_project_id_here
ADMIN_GOOGLE_REDIRECT_URI=https://theciero.com/api/auth/google/callback

# Google OAuth Tokens
ADMIN_GOOGLE_ACCESS_TOKEN=your_google_access_token_here
ADMIN_GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
ADMIN_GOOGLE_SCOPE=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events
ADMIN_GOOGLE_TOKEN_TYPE=Bearer

# NoReply Google OAuth (same as admin)
NOREPLY_GOOGLE_CLIENT_ID=your_google_client_id_here
NOREPLY_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NOREPLY_GOOGLE_PROJECT_ID=your_google_project_id_here
NOREPLY_GOOGLE_REDIRECT_URI=https://theciero.com/api/auth/google/callback
NOREPLY_GOOGLE_ACCESS_TOKEN=your_google_access_token_here
NOREPLY_GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
NOREPLY_GOOGLE_SCOPE=https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events
NOREPLY_GOOGLE_TOKEN_TYPE=Bearer

# Account Information
GOOGLE_ADMIN_EMAIL=admin@theciero.com
GOOGLE_NOREPLY_EMAIL=admin@theciero.com

# Server Configuration
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://theciero.com
RESET_PASSWORD_URL=https://theciero.com/reset-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

---

## 🛠️ Step 1: AWS Instance Setup

### 1.1 Launch New Ubuntu Instance
```bash
# Recommended Instance Configuration:
# - Instance Type: t3.medium (2 vCPU, 4GB RAM)
# - Storage: 30GB GP3 SSD (minimum)
# - Security Groups: HTTP (80), HTTPS (443), SSH (22)
# - Key Pair: Use your existing theciero.pem
```

### 1.2 Connect to New Instance
```bash
# Replace with your new instance IP
ssh -i "theciero.pem" ubuntu@YOUR_NEW_INSTANCE_IP
```

### 1.3 Update System
```bash
# Update package lists
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common
```

---

## 🛠️ Step 2: Install Required Software

### 2.1 Install Node.js (v20)
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.2 Install PM2
```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 2.3 Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 2.4 Install Certbot (SSL)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

---

## 🛠️ Step 3: Upload Application Code

### 3.1 Create Project Directory
```bash
# Create project directory
sudo mkdir -p /var/www/theciero
sudo chown -R ubuntu:ubuntu /var/www/theciero
```

### 3.2 Upload Code (Choose one method)

#### Option A: Using Git (Recommended)
```bash
# Clone your repository
cd /var/www/theciero
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .

# Or if you have the code locally, upload it
```

#### Option B: Using SCP from Local Machine
```bash
# From your local machine, upload the project
scp -i "theciero.pem" -r bodPlatform/ ubuntu@YOUR_NEW_INSTANCE_IP:/var/www/theciero/
```

#### Option C: Using Tarball
```bash
# On local machine, create tarball
tar -czf bodPlatform.tar.gz bodPlatform/

# Upload tarball
scp -i "theciero.pem" bodPlatform.tar.gz ubuntu@YOUR_NEW_INSTANCE_IP:/home/ubuntu/

# On server, extract
cd /var/www/theciero
tar -xzf /home/ubuntu/bodPlatform.tar.gz --strip-components=1
```

---

## 🛠️ Step 4: Configure Backend

### 4.1 Install Backend Dependencies
```bash
# Go to backend directory
cd /var/www/theciero/server

# Install dependencies
npm install
```

### 4.2 Create Backend Environment File
```bash
# Create environment file
sudo nano /var/www/theciero/server/.env.production
```

**Add all the environment variables from the prerequisites section above.**

### 4.3 Test Backend
```bash
# Test backend manually
cd /var/www/theciero/server
node index.js
```

**Expected output**: "Server is running on port 5001"
**Press Ctrl+C to stop**

---

## 🛠️ Step 5: Configure Frontend

### 5.1 Install Frontend Dependencies
```bash
# Go to frontend directory
cd /var/www/theciero/client

# Install dependencies
npm install
```

### 5.2 Create Frontend Environment File
```bash
# Create frontend environment file
sudo nano /var/www/theciero/client/.env.production
```

**Add this content:**
```bash
NEXT_PUBLIC_API_URL=https://theciero.com/api
API_URL=https://theciero.com/api
NODE_ENV=production
```

### 5.3 Update Next.js Configuration
```bash
# Update next.config.js
sudo nano /var/www/theciero/client/next.config.js
```

**Replace content with:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_API_URL: 'https://theciero.com/api',
    API_URL: 'https://theciero.com/api',
  },
  images: {
    domains: ['res.cloudinary.com', 'localhost', 'theciero.com'],
  },
}

module.exports = nextConfig
```

### 5.4 Fix Hardcoded URLs
```bash
# Fix hardcoded URLs in frontend code
find /var/www/theciero/client/src/app/api -name "*.ts" -exec sed -i 's|https://bodplatform.onrender.com/api|https://theciero.com/api|g' {} \;
find /var/www/theciero/client/src/app/api -name "*.ts" -exec sed -i 's|https://bodplatform.onrender.com|https://theciero.com|g' {} \;
sudo sed -i 's|https://bodplatform.onrender.com/api|https://theciero.com/api|g' /var/www/theciero/client/src/lib/api.ts
sudo sed -i 's|https://bodplatform.onrender.com/api|https://theciero.com/api|g' /var/www/theciero/client/src/app/page.tsx
```

### 5.5 Build Frontend
```bash
# Build frontend for production
cd /var/www/theciero/client
npm run build
```

---

## 🛠️ Step 6: Configure Nginx

### 6.1 Create Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/theciero-http.conf
```

**Add this content:**
```nginx
server {
    listen 80;
    server_name theciero.com www.theciero.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name theciero.com www.theciero.com;
    
    ssl_certificate /etc/letsencrypt/live/theciero.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/theciero.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Backend API routes
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routes (everything else)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.2 Enable Nginx Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/theciero-http.conf /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🛠️ Step 7: Setup SSL Certificate

### 7.1 Obtain SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d theciero.com -d www.theciero.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect option (2)
```

### 7.2 Test SSL Certificate
```bash
# Test certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🛠️ Step 8: Start Application Services

### 8.1 Start Backend with PM2
```bash
# Go to backend directory
cd /var/www/theciero/server

# Start backend with PM2
pm2 start index.js --name backend

# Check status
pm2 status
```

### 8.2 Start Frontend with PM2
```bash
# Go to frontend directory
cd /var/www/theciero/client

# Start frontend with PM2
pm2 start "npm start" --name frontend

# Check status
pm2 status
```

### 8.3 Save PM2 Configuration
```bash
# Save PM2 configuration
pm2 save

# Verify PM2 startup
pm2 startup
```

---

## 🛠️ Step 9: Final Testing

### 9.1 Test All Services
```bash
# Check PM2 processes
pm2 status

# Test backend directly
curl http://localhost:5001/

# Test frontend directly
curl -I http://localhost:3000

# Test through Nginx
curl -I https://theciero.com
curl https://theciero.com/api/auth/login
```

### 9.2 Test in Browser
1. Go to `https://theciero.com`
2. Open Developer Tools (F12)
3. Go to Network tab
4. Try to log in
5. Verify API calls go to `https://theciero.com/api/auth/login`

---

## 🛠️ Step 10: Update DNS (if needed)

### 10.1 Update GoDaddy DNS
If using a new instance IP:

1. **Login to GoDaddy**
2. **Go to DNS Management**
3. **Update A Record**:
   - **Type**: A
   - **Name**: @
   - **Value**: YOUR_NEW_INSTANCE_IP
   - **TTL**: 600 (10 minutes)

4. **Update CNAME Record**:
   - **Type**: CNAME
   - **Name**: www
   - **Value**: theciero.com
   - **TTL**: 600 (10 minutes)

### 10.2 Wait for DNS Propagation
```bash
# Check DNS propagation
nslookup theciero.com
dig theciero.com
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using ports
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :5001

# Kill processes if needed
sudo kill -9 PID_NUMBER
```

#### 2. Permission Issues
```bash
# Fix permissions
sudo chown -R ubuntu:ubuntu /var/www/theciero
sudo chmod -R 755 /var/www/theciero
```

#### 3. Nginx Configuration Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

#### 5. PM2 Issues
```bash
# Check PM2 logs
pm2 logs --lines 50

# Restart all processes
pm2 restart all

# Reload PM2
pm2 reload all
```

---

## 📊 Monitoring Commands

### Health Check Script
```bash
#!/bin/bash
# Save as health_check.sh

echo "🔍 Health Check for theciero.com"
echo "================================"

# Check PM2 processes
echo "📋 PM2 Status:"
pm2 status

# Check Nginx
echo -e "\n🌐 Nginx Status:"
sudo systemctl status nginx --no-pager

# Check SSL
echo -e "\n🔒 SSL Certificate:"
sudo certbot certificates

# Test endpoints
echo -e "\n🧪 Testing Endpoints:"
curl -I https://theciero.com 2>/dev/null | head -1
curl https://theciero.com/api/auth/login 2>/dev/null | head -1

echo -e "\n✅ Health check complete!"
```

Make it executable:
```bash
chmod +x health_check.sh
./health_check.sh
```

---

## 🚀 Quick Deployment Commands (After Setup)

### For Frontend Updates
```bash
cd /var/www/theciero/client
git pull origin main
npm install
pm2 restart frontend
```

### For Backend Updates
```bash
cd /var/www/theciero/server
git pull origin main
npm install
pm2 restart backend
```

### For Full Updates
```bash
cd /var/www/theciero
git pull origin main
cd client && npm install
cd ../server && npm install
pm2 restart all
```

---

## 📝 Important Notes

1. **Storage**: Use at least 20GB (30GB+ recommended)
2. **Instance Type**: t3.medium or higher for better performance
3. **Security Groups**: Ensure HTTP (80), HTTPS (443), SSH (22) are open
4. **Backup**: Regularly backup your application and configuration files
5. **Monitoring**: Set up monitoring for disk space, memory, and CPU usage
6. **Updates**: Keep system packages updated regularly

---

## 🎉 Success Checklist

- [ ] AWS instance launched with sufficient storage
- [ ] Node.js and PM2 installed
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained
- [ ] Application code uploaded
- [ ] Environment variables configured
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] Nginx proxying requests correctly
- [ ] Website accessible at https://theciero.com
- [ ] API calls working correctly
- [ ] DNS updated (if needed)
- [ ] PM2 startup configured

**🎉 Your website should now be live at: https://theciero.com**

---

## 📞 Support Information

- **Instance IP**: [Your New Instance IP]
- **SSH Command**: `ssh -i "theciero.pem" ubuntu@YOUR_NEW_INSTANCE_IP`
- **Domain**: theciero.com
- **Backend API**: https://theciero.com/api
- **Frontend**: https://theciero.com

Remember to update the Google OAuth redirect URIs in Google Cloud Console to point to your new domain!



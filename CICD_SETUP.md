# 🚀 CI/CD Setup Guide for Automatic Deployment

## Overview
This guide covers multiple **FREE** options for automating deployment to AWS when you push to the `main-calendarly` branch.

---

## Option 1: GitHub Actions (Recommended ⭐)

### Why GitHub Actions?
- ✅ **100% Free** for public repos, 2,000 min/month for private
- ✅ **No Server Required** - runs on GitHub's infrastructure
- ✅ **Easy Setup** - just add a YAML file
- ✅ **Built-in Secrets Management**
- ✅ **Great UI** for monitoring deployments

### Setup Steps

#### 1. Add GitHub Secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:
- **Name**: `AWS_SSH_KEY`
  - **Value**: Copy your entire `theciero.pem` file content
  ```bash
  cat ~/Downloads/theciero.pem
  ```

- **Name**: `AWS_HOST`
  - **Value**: Your AWS instance IP or domain
  ```
  theciero.com
  # or
  18.246.69.40
  ```

#### 2. Workflow File Already Created
The workflow file is at `.github/workflows/deploy.yml`

#### 3. Push to Trigger Deployment
```bash
git add .
git commit -m "Add CI/CD workflow"
git push origin main-calendarly
```

#### 4. Monitor Deployment
- Go to your GitHub repo → Actions tab
- Watch the deployment progress in real-time
- See logs for each step

### Workflow Triggers
- **Automatic**: Push to `main-calendarly` branch
- **Manual**: Click "Run workflow" in Actions tab

---

## Option 2: Jenkins (Self-Hosted)

### Why Jenkins?
- ✅ **Free & Open Source**
- ✅ **You're already familiar with it**
- ✅ **Highly customizable**
- ❌ Requires a server to run Jenkins (can use free tier AWS)

### Setup Steps

#### 1. Install Jenkins on Free AWS Instance
You can use AWS Free Tier (t2.micro) for Jenkins:

```bash
# SSH to a new or existing AWS instance
ssh -i "your-key.pem" ubuntu@jenkins-instance-ip

# Install Java
sudo apt update
sudo apt install -y openjdk-11-jdk

# Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### 2. Configure Jenkins
1. Open `http://jenkins-instance-ip:8080`
2. Enter initial admin password
3. Install suggested plugins
4. Create admin user

#### 3. Create Jenkins Pipeline Job

**Jenkinsfile** (add to your repo root):

```groovy
pipeline {
    agent any
    
    environment {
        AWS_HOST = 'theciero.com'
        AWS_USER = 'ubuntu'
        DEPLOY_PATH = '/var/www/theciero'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Archive') {
            steps {
                sh '''
                    tar --exclude='node_modules' \
                        --exclude='.next' \
                        --exclude='.git' \
                        --exclude='client/node_modules' \
                        --exclude='server/node_modules' \
                        -czf deploy.tar.gz .
                '''
            }
        }
        
        stage('Deploy to AWS') {
            steps {
                sshagent(['aws-ssh-credentials']) {
                    sh '''
                        # Upload
                        scp -o StrictHostKeyChecking=no deploy.tar.gz $AWS_USER@$AWS_HOST:/tmp/
                        
                        # Deploy
                        ssh -o StrictHostKeyChecking=no $AWS_USER@$AWS_HOST << 'ENDSSH'
                            # Backup env files
                            cp $DEPLOY_PATH/server/.env /tmp/server.env.backup
                            cp $DEPLOY_PATH/client/.env.production /tmp/client.env.backup 2>/dev/null || true
                            
                            # Extract
                            cd $DEPLOY_PATH
                            tar -xzf /tmp/deploy.tar.gz
                            
                            # Restore env
                            cp /tmp/server.env.backup server/.env
                            cp /tmp/client.env.backup client/.env.production 2>/dev/null || true
                            
                            # Install deps
                            cd server && npm install
                            cd ../client && npm install
                            
                            # Build
                            cd $DEPLOY_PATH/client
                            rm -rf .next
                            NODE_ENV=production npm run build
                            
                            # Restart
                            pm2 restart all
                            pm2 save
                            
                            echo "✅ Deployment completed!"
ENDSSH
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
    }
}
```

#### 4. Add SSH Credentials to Jenkins
1. Jenkins Dashboard → Manage Jenkins → Credentials
2. Add Credentials → SSH Username with private key
3. ID: `aws-ssh-credentials`
4. Username: `ubuntu`
5. Private Key → Enter directly → Paste your `theciero.pem` content

#### 5. Create Pipeline Job
1. New Item → Pipeline
2. Build Triggers → GitHub hook trigger
3. Pipeline → Definition: Pipeline script from SCM
4. SCM: Git → Add your repo URL
5. Branch: `main-calendarly`

#### 6. Setup GitHub Webhook
1. GitHub Repo → Settings → Webhooks → Add webhook
2. Payload URL: `http://jenkins-ip:8080/github-webhook/`
3. Content type: `application/json`
4. Events: Just the push event

**Cost**: Free if using AWS Free Tier, but uses server resources

---

## Option 3: GitLab CI/CD (Alternative to GitHub Actions)

### Why GitLab CI/CD?
- ✅ **Free**: 400 CI/CD minutes/month
- ✅ **Similar to GitHub Actions**
- ✅ **Good if you use GitLab**

**.gitlab-ci.yml**:
```yaml
stages:
  - deploy

deploy_production:
  stage: deploy
  only:
    - main-calendarly
  before_script:
    - 'which ssh-agent || ( apt-get update -y && apt-get install openssh-client -y )'
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf deploy.tar.gz .
    - scp deploy.tar.gz ubuntu@theciero.com:/tmp/
    - ssh ubuntu@theciero.com "cd /var/www/theciero && tar -xzf /tmp/deploy.tar.gz && cd server && npm install && cd ../client && npm install && npm run build && pm2 restart all"
```

---

## Option 4: AWS CodePipeline + CodeDeploy

### Why AWS CodePipeline?
- ✅ **Free Tier**: First pipeline free, then $1/month per pipeline
- ✅ **Native AWS Integration**
- ✅ **No external server needed**
- ❌ More complex setup

### Setup (Brief):
1. Create CodePipeline in AWS Console
2. Source: GitHub (connect your repo)
3. Build: CodeBuild (optional)
4. Deploy: CodeDeploy to EC2

**appspec.yml** (for CodeDeploy):
```yaml
version: 0.0
os: linux
files:
  - source: /
    destination: /var/www/theciero
hooks:
  AfterInstall:
    - location: deploy-scripts/install-deps.sh
      timeout: 300
  ApplicationStart:
    - location: deploy-scripts/restart-services.sh
      timeout: 60
```

---

## Option 5: Simple Cron + Git Pull (Simplest)

### Why Cron?
- ✅ **100% Free**
- ✅ **Super Simple**
- ❌ Not triggered by push (runs on schedule)
- ❌ No logs/monitoring

### Setup on AWS Server:

```bash
# Create deployment script
cat > /home/ubuntu/auto-deploy.sh << 'EOF'
#!/bin/bash
cd /var/www/theciero

# Check for updates
git fetch origin main-calendarly
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main-calendarly)

if [ $LOCAL != $REMOTE ]; then
    echo "Updates found, deploying..."
    
    # Backup env
    cp server/.env /tmp/server.env.backup
    cp client/.env.production /tmp/client.env.backup 2>/dev/null || true
    
    # Pull changes
    git pull origin main-calendarly
    
    # Restore env
    cp /tmp/server.env.backup server/.env
    cp /tmp/client.env.backup client/.env.production 2>/dev/null || true
    
    # Install deps
    cd server && npm install
    cd ../client && npm install
    
    # Build
    cd /var/www/theciero/client
    rm -rf .next
    NODE_ENV=production npm run build
    
    # Restart
    pm2 restart all
    pm2 save
    
    echo "✅ Deployed at $(date)"
else
    echo "No updates found"
fi
EOF

chmod +x /home/ubuntu/auto-deploy.sh

# Add to crontab (runs every 5 minutes)
crontab -l | { cat; echo "*/5 * * * * /home/ubuntu/auto-deploy.sh >> /home/ubuntu/deploy.log 2>&1"; } | crontab -
```

---

## 📊 Comparison Table

| Option | Cost | Ease of Setup | Triggered by Push | Logs/Monitoring | Server Required |
|--------|------|---------------|-------------------|-----------------|-----------------|
| **GitHub Actions** | Free | ⭐⭐⭐⭐⭐ | ✅ | ✅ Excellent | ❌ |
| **Jenkins** | Free | ⭐⭐⭐ | ✅ | ✅ Good | ✅ |
| **GitLab CI/CD** | Free | ⭐⭐⭐⭐ | ✅ | ✅ Good | ❌ |
| **AWS CodePipeline** | $1/month | ⭐⭐ | ✅ | ✅ Good | ❌ |
| **Cron + Git Pull** | Free | ⭐⭐⭐⭐⭐ | ❌ | ❌ | ❌ |

---

## 🏆 My Recommendation

**For your use case, I recommend GitHub Actions** because:
1. ✅ **Completely free** for your needs
2. ✅ **No additional server** required (unlike Jenkins)
3. ✅ **Easy setup** - just add the workflow file
4. ✅ **Great UI** for monitoring deployments
5. ✅ **Triggered by push** to `main-calendarly`
6. ✅ **Built-in secrets** management for SSH keys
7. ✅ **You already have the code in GitHub**

---

## 🚀 Quick Start with GitHub Actions

1. **Add SSH key to GitHub Secrets**:
   ```bash
   # Copy your SSH key
   cat ~/Downloads/theciero.pem
   # Go to: GitHub repo → Settings → Secrets → New secret
   # Name: AWS_SSH_KEY
   # Value: [paste the key]
   ```

2. **Add AWS host to GitHub Secrets**:
   ```
   # Name: AWS_HOST
   # Value: theciero.com
   ```

3. **Commit and push the workflow**:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add CI/CD workflow"
   git push origin main-calendarly
   ```

4. **Watch it deploy**:
   - Go to GitHub → Actions tab
   - See your deployment in real-time!

---

## 📝 Notes

- The workflow file is already created at `.github/workflows/deploy.yml`
- You can manually trigger deployments from GitHub Actions UI
- Deployment takes ~3-5 minutes (depending on build time)
- You'll get email notifications on success/failure

---

## 🔧 Troubleshooting

### If deployment fails:
1. Check GitHub Actions logs
2. Verify SSH key is correct in secrets
3. Ensure AWS security group allows SSH (port 22)
4. Check disk space on AWS instance

### Manual deployment (if needed):
```bash
# From your local machine
cd /Users/amit/Downloads/Project/bodPlatform
./deploy-scripts/deploy.sh
```

---

**Need help?** Check the Actions tab in your GitHub repo for detailed logs of each deployment step.


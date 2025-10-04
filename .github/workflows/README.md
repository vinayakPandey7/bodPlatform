# GitHub Actions CI/CD Setup

This directory contains the GitHub Actions workflow for automatic deployment to AWS.

## Setup Instructions

### 1. Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

#### `AWS_SSH_KEY`
Your AWS EC2 SSH private key content.

```bash
# On your Mac, copy the key content:
cat ~/Downloads/theciero.pem

# Copy the entire output and paste it as the secret value
```

#### `AWS_HOST`
Your AWS instance IP address or domain.

```
theciero.com
```

Or use the IP:
```
18.246.69.40
```

### 2. How It Works

The workflow in `deploy.yml` will:

1. **Trigger**: Automatically run when you push to the `main-calendarly` branch
2. **Build**: Create a deployment archive (excluding node_modules, .git, etc.)
3. **Upload**: Transfer the archive to your AWS server
4. **Deploy**: 
   - Backup environment files
   - Extract new code
   - Restore environment files
   - Install dependencies
   - Build frontend
   - Restart PM2 services
5. **Complete**: Your changes are live!

### 3. Deployment Process

#### Automatic Deployment
Simply push to the `main-calendarly` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main-calendarly
```

The deployment will start automatically. Monitor it at:
- GitHub Repository → **Actions** tab

#### Manual Deployment
You can also trigger a deployment manually:

1. Go to GitHub Repository → **Actions** tab
2. Select "Deploy to AWS" workflow
3. Click **Run workflow** button
4. Select branch: `main-calendarly`
5. Click **Run workflow**

### 4. Monitoring Deployments

#### View Logs
1. Go to **Actions** tab in GitHub
2. Click on the latest workflow run
3. Click on **deploy** job
4. Expand each step to see detailed logs

#### Check Deployment Status
- ✅ Green checkmark = Successful deployment
- ❌ Red X = Failed deployment
- 🟡 Yellow dot = In progress

#### Notifications
You'll receive email notifications for:
- Failed deployments
- Successful deployments (optional)

### 5. Deployment Time

Typical deployment takes **3-5 minutes**:
- Checkout: ~10 seconds
- Create archive: ~10 seconds
- Upload: ~30 seconds
- Backend install: ~30 seconds
- Frontend install: ~1 minute
- Frontend build: ~2 minutes
- Restart services: ~10 seconds

### 6. Troubleshooting

#### Deployment Fails at "Deploy to AWS" Step

**Check SSH Key:**
```bash
# Verify SSH key is correct
ssh -i ~/Downloads/theciero.pem ubuntu@theciero.com "echo 'Connected'"
```

**Update GitHub Secret:**
- Go to Settings → Secrets → Actions
- Edit `AWS_SSH_KEY`
- Paste the complete key (including header/footer)

#### Deployment Succeeds but Website Down

**Check PM2 on server:**
```bash
ssh -i ~/Downloads/theciero.pem ubuntu@theciero.com "pm2 status"
ssh -i ~/Downloads/theciero.pem ubuntu@theciero.com "pm2 logs --lines 50"
```

#### Build Fails

**Check disk space:**
```bash
ssh -i ~/Downloads/theciero.pem ubuntu@theciero.com "df -h /"
```

If disk is full:
```bash
ssh -i ~/Downloads/theciero.pem ubuntu@theciero.com "
  rm -rf /var/www/theciero/client/.next
  npm cache clean --force
"
```

### 7. Workflow File Location

The workflow configuration is at:
```
.github/workflows/deploy.yml
```

To modify the deployment process, edit this file.

### 8. Security Notes

- ✅ SSH key is stored as encrypted secret in GitHub
- ✅ Secrets are not visible in logs
- ✅ Only authorized collaborators can trigger workflows
- ✅ Environment files (.env) are preserved during deployment
- ✅ Never commit SSH keys or .env files to the repository

### 9. Best Practices

1. **Test locally** before pushing to `main-calendarly`
2. **Check Actions tab** after pushing to ensure deployment succeeds
3. **Monitor logs** if anything seems wrong
4. **Keep secrets updated** if you rotate SSH keys
5. **Review failed deployments** to identify issues

### 10. Rollback

If a deployment breaks something:

**Option 1: Revert the commit**
```bash
git revert HEAD
git push origin main-calendarly
# New deployment with previous code will run automatically
```

**Option 2: Manual rollback on server**
```bash
ssh -i ~/Downloads/theciero.pem ubuntu@theciero.com
cd /var/www/theciero
git log --oneline
git checkout <previous-commit-hash>
pm2 restart all
```

### 11. Cost

GitHub Actions is **FREE** for:
- Public repositories: Unlimited minutes
- Private repositories: 2,000 minutes/month

Your deployments use ~5 minutes each, so you can do **400 deployments/month for free** on private repos.

### 12. Alternative: Manual Deployment

If GitHub Actions isn't working, use the manual script:

```bash
cd /Users/amit/Downloads/Project/bodPlatform
./deploy-scripts/quick-deploy.sh
```

---

## Quick Reference

### Check Workflow Status
```
https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

### View Secrets
```
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

### Edit Workflow
```
.github/workflows/deploy.yml
```

---

## Need Help?

1. Check the **Actions** tab for detailed logs
2. Review the **CICD_SETUP.md** file in the root directory
3. SSH to server and check PM2 logs: `pm2 logs`


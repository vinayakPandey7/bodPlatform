# 🚀 GitHub Actions Setup - Step by Step

## Step 1: Add Secrets to GitHub Repository

### 1.1 Navigate to Secrets Settings
1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click the green **New repository secret** button

### 1.2 Add AWS_SSH_KEY Secret

**First Secret:**
- **Name**: `AWS_SSH_KEY`
- **Secret**: Copy the ENTIRE content below (including BEGIN/END lines):

```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAqZh2AEi3FOVhBL5EaJt23wNd6di7aEJAtTFVdUiVIiP/XonM
shMkYKqNT9eb1Dn25h/N+HtwUE4S2/vh0mThxuTJpVYGqgxjyPOYN8he1AKRwnqh
cQLEw7kVn3bJfbduPjgialcZ1AOR98rfNz9+I5ghfYP8UffFkXwYWTEoHJqTGuZl
4bKZCiw7TirewStwYeClkn2rMQ/8/5+2+ELjsoZn5MWqZMJcdNWtKLhbCcL6cnzg
3tooOsq4nqQvPfYfTFoKzJU7ddII+0BZeB01FPT2rmU5rxTc+ZrtkSuTMpQoon1l
kcNuL/ub+brIlQVcF3qchogm9nl5GaUfk8splQIDAQABAoIBAESI7AapW/MBzvcP
vK1ZRexRe/4oK3OyclvGl/ZRYpLtYSFfJm0/9w9pXLnLM5nL4s6UQ7QKjhSluFFV
tKhFREgP5Lz/yqmlYB2w8u539npOn4Cr9dmpeMJvZSGP61T2b4KNRLscf7+BwdcV
EKdO7TaNH9uNHsYxDpIASAajKsaDuE5LSRaEKvBE+q/lDw+ReRNo3rinNGuWrY0Z
73AM3rUhO3qkRH7iJAgPd30FsH0FKTvZSkgzoYZZN0+nTmHRJosN0gljSPN7106k
uVCHNzLRZF/QEB9i9fetEzn0foAgHxFpb1uyCH3GzsBqNMOUaEbbXwhXLf93b0+Y
8wSKgnECgYEA0QG2fyVgi05CPdrGUSNZbIT5XQ5Ye/4BI+Kw2EfqsPDibgNI7mVP
yL0iquO4H5uylBjiAhqwqgDGvY0wUYcDSb9oV4ifWvRCjucrebdUjhGNvxKNKvuU
mzRK/KO4bpwuPjZNWK663/y5BPlCRA+5cseYWAFYVTXxRgQQnwl5j/MCgYEAz7pE
0zFFAnCOmK6DiKlMdeCE5jclGL8wKosYHrzAwpIBigZMc0cHhkeTdnPj1mlA8OpD
svHOiWGypwqBnHAAyekUN6ldl5iY2G9yQAQ1zlDX2xJ2qUngoqOu37smRdVRs6iJ
5meGQMuHcmTL+9K7HOXoKkUFOgtVrSiZxh9lSlcCgYEAwGadQ0p7J4IxRJOiwIqU
BWwbyegs2GepUQmb1l3N1HjLWI65kou8+IPz5/CdTKudpuuJEnrTaowwZ8oTUtnA
0yDawsnIOIhmxPpVcUStF+Nc4yoGviy+TmnDJfLpExm/EBIY/axL52nUQJncwJ7h
DqJiwZDrafWwV83iJyUnvLUCgYAc3AMN2E1/HkYhXjV1+hdeVRgBp+2md4Fol7R9
KLobDg/ari9W4Kph9HW/QjCILE1SaymGpeOM4J7iaCpDoqfpZVFivkv7cL7javBT
hoI3LLIghHsp39KupdD40lZp404biLHH6eAUBnLF6M0SKl/GjwZnQPmN6982VGqw
xNHctwKBgD1zTXbbvN7T/d4nCxZZXvs7eaLQWnkBV6B/ypx1RzOSKxGOWiy2qAXc
bWXXkZqqgFsCqPOEgvCXLvDEYuUeno7vH0YDxceRU/WXK48qUcB4LX1LkT51mf8X
xCPSwUBZtof1hEiU9ChXgw00hrjDrmYnzTBmStWkMRmt7FLocstt
-----END RSA PRIVATE KEY-----
```

**Important:** Copy the ENTIRE key including the BEGIN and END lines!

Click **Add secret**

### 1.3 Add AWS_HOST Secret

**Second Secret:**
- **Name**: `AWS_HOST`
- **Secret**: `theciero.com`

Click **Add secret**

---

## Step 2: Commit and Push the Workflow

Now let's commit the GitHub Actions workflow file:

```bash
cd /Users/amit/Downloads/Project/bodPlatform

# Add all the new files
git add .github/workflows/deploy.yml
git add CICD_SETUP.md
git add Jenkinsfile
git add deploy-scripts/quick-deploy.sh
git add .github/workflows/README.md
git add GITHUB_ACTIONS_SETUP.md

# Also commit the fixed URLs
git add client/src

# Commit
git commit -m "Add GitHub Actions CI/CD workflow for automatic deployment"

# Push to main-calendarly
git push origin main-calendarly
```

---

## Step 3: Watch Your First Deployment! 🎉

1. After pushing, go to your GitHub repository
2. Click the **Actions** tab (top menu)
3. You should see a workflow run starting
4. Click on it to see the deployment progress in real-time!

### What You'll See:

```
✅ Checkout code
✅ Setup Node.js
✅ Create deployment archive
✅ Deploy to AWS
   ├── Setup SSH
   ├── Upload and extract
   ├── Backup environment files
   ├── Extract new code
   ├── Restore environment files
   ├── Install dependencies
   ├── Build frontend
   └── Restart services
```

The entire deployment takes about **3-5 minutes**.

---

## Step 4: Test It Out!

After the first deployment completes, test the automation:

```bash
# Make a small change (like updating a comment)
echo "// CI/CD is working!" >> client/src/app/page.tsx

# Commit and push
git add .
git commit -m "Test CI/CD automation"
git push origin main-calendarly

# Go to GitHub Actions tab and watch it deploy automatically! 🚀
```

---

## Troubleshooting

### If Deployment Fails:

1. **Check the Actions tab** - Click on the failed run to see detailed logs
2. **Common issues:**
   - **SSH Key incorrect**: Make sure you copied the ENTIRE key including BEGIN/END lines
   - **Permission denied**: Verify the SSH key is for the correct AWS instance
   - **Disk space**: Check if server has enough space: `df -h /`

### Verify Secrets Are Set:

Go to: Settings → Secrets and variables → Actions

You should see:
- ✅ AWS_SSH_KEY
- ✅ AWS_HOST

---

## Future Deployments

From now on, every time you push to `main-calendarly`:

```bash
git add .
git commit -m "Your changes"
git push origin main-calendarly
```

GitHub Actions will automatically:
1. Detect the push
2. Start the deployment workflow
3. Deploy to AWS
4. Restart services
5. Your changes are LIVE! 🎉

You can monitor every deployment in the **Actions** tab.

---

## Manual Deployment (If Needed)

If GitHub Actions is down or you need to deploy manually:

```bash
cd /Users/amit/Downloads/Project/bodPlatform
./deploy-scripts/quick-deploy.sh
```

---

## Benefits You're Getting:

✅ **Automatic Deployment** - Push code → Auto deploys
✅ **No Server Needed** - Runs on GitHub's infrastructure
✅ **100% Free** - No cost for your usage
✅ **Deployment History** - See all past deployments
✅ **Rollback Easy** - Just revert a commit and push
✅ **Real-time Logs** - Watch deployment progress
✅ **Email Notifications** - Get notified of failures
✅ **Security** - SSH key stored encrypted

---

## Next Steps:

1. ✅ Add secrets to GitHub (see Step 1)
2. ✅ Push the workflow (see Step 2)
3. ✅ Watch first deployment (see Step 3)
4. ✅ Test with a small change (see Step 4)
5. 🎉 Enjoy automatic deployments!

---

**Need help?** Check the detailed logs in GitHub Actions tab or the comprehensive guide in `CICD_SETUP.md`.


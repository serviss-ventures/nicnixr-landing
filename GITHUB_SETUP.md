# 🐙 GitHub Setup Instructions

Complete guide to set up your NicNixr marketing site repository on GitHub and deploy to production.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- NicNixr project ready (completed ✅)

## 🚀 Step 1: Create GitHub Repository

### Option A: GitHub Web Interface

1. **Go to GitHub**
   - Visit [github.com](https://github.com)
   - Click the "+" icon → "New repository"

2. **Repository Settings**
   ```
   Repository name: nicnixr-landing
   Description: 🚭 Professional marketing landing page for NicNixr - A science-backed nicotine recovery app
   Visibility: Public (or Private if preferred)
   ❌ Don't initialize with README (we already have one)
   ```

3. **Create Repository**
   - Click "Create repository"
   - Copy the repository URL

### Option B: GitHub CLI (if installed)

```bash
# Create repository using GitHub CLI
gh repo create nicnixr-landing --public --description "🚭 Professional marketing landing page for NicNixr - A science-backed nicotine recovery app"
```

## 🔗 Step 2: Connect Local Repository

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/nicnixr-landing.git

# Verify remote was added
git remote -v

# Push to GitHub
git push -u origin main
```

## 🌐 Step 3: Deploy to Vercel (Recommended)

### Quick Deploy

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub account

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your `nicnixr-landing` repository
   - Click "Import"

3. **Configure Deployment**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be live at `nicnixr-landing.vercel.app`

### Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `nicnixr.com`)

2. **Update DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or follow Vercel's specific DNS instructions

## 📝 Step 4: Repository Configuration

### Branch Protection

1. **Settings → Branches**
   - Add rule for `main` branch
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require up-to-date branches

### Issue Templates

Create `.github/ISSUE_TEMPLATE/`:

```bash
mkdir -p .github/ISSUE_TEMPLATE
```

#### Bug Report Template
```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug or issue
title: "[BUG] "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report a bug!
  
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear description of what the bug is
    validations:
      required: true
      
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '....'
        3. See error
    validations:
      required: true
```

#### Feature Request Template
```yaml
# .github/ISSUE_TEMPLATE/feature_request.yml
name: Feature Request
description: Suggest a new feature
title: "[FEATURE] "
labels: ["enhancement"]
body:
  - type: textarea
    id: feature-description
    attributes:
      label: Feature Description
      description: A clear description of what you want to happen
    validations:
      required: true
```

### Pull Request Template

```markdown
# .github/pull_request_template.md

## 📝 Description

Brief description of changes

## 🔄 Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## ✅ Testing

- [ ] Build passes (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Cross-browser tested

## 📱 Screenshots

Include screenshots for UI changes

## 📋 Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to documentation
```

## 🤖 Step 5: Automation Setup

### GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Build project
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: .next/
```

## 🏷️ Step 6: Release Management

### Create First Release

```bash
# Tag the current commit
git tag -a v1.0.0 -m "🎉 Initial release - Production ready marketing site"

# Push tag to GitHub
git push origin v1.0.0
```

### GitHub Release

1. **Go to Releases**
   - Repository → Releases → "Create a new release"

2. **Release Details**
   ```
   Tag: v1.0.0
   Title: 🎉 NicNixr Marketing Site v1.0.0
   Description: Copy from CHANGELOG.md [1.0.0] section
   ```

## 📊 Step 7: Repository Settings

### About Section

```
Description: 🚭 Professional marketing landing page for NicNixr - A science-backed nicotine recovery app
Website: https://nicnixr-landing.vercel.app
Topics: nextjs, typescript, tailwindcss, landing-page, nicotine, health, recovery
```

### Security

1. **Enable Security Features**
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates

2. **Secrets Management**
   - Add any environment variables as repository secrets
   - `Settings → Secrets and variables → Actions`

## 🔗 Step 8: Documentation Links

Update these files with your actual GitHub URLs:

### README.md
```markdown
git clone https://github.com/YOUR_USERNAME/nicnixr-landing.git
```

### CONTRIBUTING.md
```markdown
git clone https://github.com/YOUR_USERNAME/nicnixr-landing.git
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Repository is public/accessible
- [ ] All files are committed and pushed
- [ ] Vercel deployment is working
- [ ] Live site loads correctly
- [ ] Build pipeline passes
- [ ] README displays properly
- [ ] Issues/PRs templates work
- [ ] Release v1.0.0 is published

## 🚀 Next Steps

Your NicNixr marketing site is now:

1. **Version Controlled** - Full git history
2. **Documented** - Comprehensive README and guides  
3. **Deployed** - Live on Vercel with automatic deployments
4. **Collaborative** - Ready for team development
5. **Professional** - Industry-standard repository structure

### Ready for Development

- Clone repository for new features
- Create feature branches for changes
- Use pull requests for code review
- Deploy automatically on merge to main

---

## 🆘 Troubleshooting

### Common Issues

**Push rejected:**
```bash
git pull origin main --rebase
git push origin main
```

**Vercel build fails:**
- Check build logs in Vercel dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are listed

**Domain not working:**
- Verify DNS settings
- Check domain configuration in Vercel
- Allow 24-48 hours for DNS propagation

---

**🎉 Congratulations! Your NicNixr marketing site is now GitHub-ready and deployed!**

Ready to start building the app? 🚀 
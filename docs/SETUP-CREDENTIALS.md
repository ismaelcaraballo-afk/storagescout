# StorageScout - Credentials Setup Guide

## Overview

StorageScout uses two third-party APIs for real-time data:

1. **WattTime API** — Real-time carbon intensity and marginal emissions (CAISO)
2. **Electricity Maps API** — Grid carbon intensity for all regions

## Setup Instructions

### Step 1: Create `.env` File

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

### Step 2: Add Your Credentials

Edit `.env` and fill in your actual credentials from each service.

### Step 3: Load Credentials in Your Application

**For Node.js/JavaScript:**
```javascript
require('dotenv').config();

const wattimeUsername = process.env.WATTTIME_USERNAME;
const electricityMapsToken = process.env.ELECTRICITYMAPS_TOKEN;
```

**For Browser-based Applications (Not Recommended):**
⚠️ **Do NOT load .env in browser code** — it would expose secrets in client-side code.
Instead, use a backend proxy or environment variables during build time.

### Step 4: Get Your Own Credentials

#### WattTime
1. Go to https://www.watttime.org/api-documentation/
2. Create a free account
3. Get your API credentials (username, password, email, organization)

#### Electricity Maps
1. Go to https://www.electricitymaps.com/api
2. Sign up for a free tier account
3. Copy your API token

## ⚠️ SECURITY RULES

### Never Commit `.env` to Git

The `.env` file is listed in `.gitignore` and **must never be committed** to version control.

```bash
# ✅ Good - .env is ignored
git status
# On branch main
# nothing to commit

# ❌ Bad - if you see .env here, remove it immediately:
git rm --cached .env
git commit -m "Remove .env from git tracking"
```

### Never Share Credentials in Chat/Email

- ❌ Do NOT paste credentials in Slack, email, or chat
- ❌ Do NOT push credentials to GitHub
- ❌ Do NOT commit `.env` file

### How to Share Securely with Team

**Option 1: Pass in Person**
- Copy `.env.example` with placeholders
- Give team members their own credentials via secure channel (encrypted email, password manager)
- Each person fills in their own `.env` file locally

**Option 2: Use Secrets Manager**
- GitHub Secrets (for CI/CD)
- AWS Secrets Manager
- HashiCorp Vault
- 1Password or LastPass as team vault

**Option 3: Environment Variables**
- Store credentials as system environment variables
- Load at runtime: `process.env.WATTTIME_USERNAME`

## Checking Your Setup

To verify credentials are loaded correctly:

```bash
# Check if .env file exists and is ignored
git status
# .env should NOT appear in the output (it's in .gitignore)

# Check if credentials are accessible in your app
console.log(process.env.WATTTIME_USERNAME);  // Should print your username
```

## Troubleshooting

### `.env` file appears in `git status`

**Problem:** The file is being tracked by git (probably added before .gitignore was created).

**Solution:**
```bash
git rm --cached .env
git commit -m "Remove .env from git history"
```

### Environment variables not loading

**Problem:** dotenv not installed or not required.

**Solution:**
```bash
npm install dotenv
```

Then add to your main file:
```javascript
require('dotenv').config();
```

### API credentials not working

**Problem:** Typo or wrong format.

**Solution:**
1. Double-check credentials in `.env` file
2. Verify format — no extra spaces or quotes
3. Test API credentials directly on their service websites

## See Also

- [WattTime API Documentation](https://www.watttime.org/api-documentation/)
- [Electricity Maps API Documentation](https://www.electricitymaps.com/api)
- [Environment Variables Best Practices](https://12factor.net/config)

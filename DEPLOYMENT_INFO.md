# Nightlife OS - Deployment Information

## Firebase Configuration

### Project Details
- **Project Name**: NIGHTLIFE-OS
- **Project ID**: nightlife-os
- **Project Number**: 104919062880
- **Region**: eur3 (Europe)

### Firebase Services Activated
- ✅ **Authentication**: Email/Password enabled
- ✅ **Firestore Database**: Production mode, Europe region
- ✅ **Automatic Indexing**: Enabled for all fields (including shortCode)

### Firebase Web App
- **App Name**: nIGHTLIFE os wEB
- **App ID**: 1:104919062880:web:dc915a854d0987c25ea485

### Firebase Configuration (firebase-config.json)
```json
{
  "apiKey": "AIzaSyCBEtyVWVexC9PnorzIJvtebbnCrXzrwKc5w",
  "authDomain": "nightlife-os.firebaseapp.com",
  "projectId": "nightlife-os",
  "storageBucket": "nightlife-os.firebasestorage.app",
  "messagingSenderId": "104919062880",
  "appId": "1:104919062880:web:dc915a854d0987c25ea485"
}
```

---

## GitHub Repository

### Repository Details
- **Repository Name**: NIGHTLIFE-OS
- **Owner**: schirnhofer
- **Visibility**: Private
- **Description**: Nightlife OS - Multi-tenant SaaS platform for club management
- **URL**: https://github.com/schirnhofer/NIGHTLIFE-OS
- **Clone URL**: https://github.com/schirnhofer/NIGHTLIFE-OS.git

### Git Status
- ✅ Repository created on GitHub
- ✅ Local repository initialized
- ✅ Initial commit created: "Initial commit - Phase 1-9 completed with Shortcode System"
- ✅ Branch renamed to "main"
- ✅ Remote "origin" added
- ⏳ **PENDING**: Push to GitHub (requires authentication)

### How to Push to GitHub

You need to authenticate with GitHub to push the code. Here are your options:

#### Option 1: Using Personal Access Token (Recommended)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Nightlife OS"
4. Select scopes: ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. Copy the token (it will only be shown once!)
7. Run the following command in the terminal:

```bash
cd /home/ubuntu/nightlife_os
git push -u origin main
# When prompted for username: enter your GitHub username
# When prompted for password: paste the Personal Access Token
```

#### Option 2: Using SSH (Alternative)

1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add SSH key to GitHub: https://github.com/settings/keys
3. Change remote URL: `git remote set-url origin git@github.com:schirnhofer/NIGHTLIFE-OS.git`
4. Push: `git push -u origin main`

---

## Vercel Deployment

### Status
- ⏳ **PENDING**: Vercel setup not yet completed

### Next Steps for Vercel Deployment

1. Go to: https://vercel.com/new
2. Log in with GitHub
3. Import the "NIGHTLIFE-OS" repository
4. Configure the first app (user-app):
   - **Project Name**: nightlife-os-user-app
   - **Framework Preset**: Next.js
   - **Root Directory**: apps/user-app
   - **Build Command**: `cd ../.. && pnpm install && pnpm build --filter=user-app`
   - **Output Directory**: .next
   - **Install Command**: pnpm install

5. Add Environment Variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = AIzaSyCBEtyVWVexC9PnorzIJvtebbnCrXzrwKc5w
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = nightlife-os.firebaseapp.com
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = nightlife-os
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = nightlife-os.firebasestorage.app
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = 104919062880
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = 1:104919062880:web:dc915a854d0987c25ea485

6. Click "Deploy"
7. Wait for deployment to complete
8. Note the deployment URL

### Additional Apps to Deploy (Later)
- club-admin
- super-admin
- staff-app
- crew-app
- cloakroom-app

---

## Local Environment Setup

### Create .env.local Files

You need to create `.env.local` files in all 6 apps with the Firebase configuration.

Run the following commands:

```bash
cd /home/ubuntu/nightlife_os

# Create .env.local for user-app
cat > apps/user-app/.env.local << 'ENVEOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCBEtyVWVexC9PnorzIJvtebbnCrXzrwKc5w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nightlife-os.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nightlife-os
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nightlife-os.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=104919062880
NEXT_PUBLIC_FIREBASE_APP_ID=1:104919062880:web:dc915a854d0987c25ea485
ENVEOF

# Create .env.local for club-admin
cat > apps/club-admin/.env.local << 'ENVEOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCBEtyVWVexC9PnorzIJvtebbnCrXzrwKc5w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nightlife-os.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nightlife-os
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nightlife-os.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=104919062880
NEXT_PUBLIC_FIREBASE_APP_ID=1:104919062880:web:dc915a854d0987c25ea485
ENVEOF

# Create .env.local for super-admin
cat > apps/super-admin/.env.local << 'ENVEOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCBEtyVWVexC9PnorzIJvtebbnCrXzrwKc5w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nightlife-os.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nightlife-os
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nightlife-os.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=104919062880
NEXT_PUBLIC_FIREBASE_APP_ID=1:104919062880:web:dc915a854d0987c25ea485
ENVEOF

# Create .env.local for staff-app
cat > apps/staff-app/.env.local << 'ENVEOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCBEtyVWVexC9PnorzIJvtebbnCrXzrwKc5w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nightlife-os.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nightlife-os
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nightlife-os.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=104919062880
NEXT_PUBLIC_FIREBASE_APP_ID=1:104919062880:web:dc915a854d0987c25ea485
ENVEOF

# Create .env.local for crew-app
cat > apps/crew-app/.env.local << 'ENVEOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCBEtyVWVexC9PnorzIJvtebbnCrXzrwKc5w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nightlife-os.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nightlife-os
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nightlife-os.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=104919062880
NEXT_PUBLIC_FIREBASE_APP_ID=1:104919062880:web:dc915a854d0987c25ea485
ENVEOF

# Create .env.local for cloakroom-app
cat > apps/cloakroom-app/.env.local << 'ENVEOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCBEtyVWVexC9PnorzIJvtebbnCrXzrwKc5w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nightlife-os.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nightlife-os
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nightlife-os.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=104919062880
NEXT_PUBLIC_FIREBASE_APP_ID=1:104919062880:web:dc915a854d0987c25ea485
ENVEOF

echo "✅ All .env.local files created successfully!"
```

---

## Summary

### ✅ Completed
- Firebase Project created and configured
- Firebase Authentication enabled (Email/Password)
- Firestore Database created (Europe region, Production mode)
- Firebase Web App registered
- Firebase Config saved to `firebase-config.json`
- GitHub Repository created (Private)
- Local Git repository initialized and committed

### ⏳ Pending
- Push code to GitHub (requires authentication)
- Create .env.local files for all apps
- Deploy to Vercel

### 📝 Notes
- Firebase is fully configured and ready to use
- GitHub repository is ready, just needs to be pushed
- Vercel deployment can be done after GitHub push
- All credentials and configuration are documented in this file

---

**Last Updated**: December 5, 2025

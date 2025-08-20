# 🚀 Task Manager Deployment Guide

## Quick Start Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - Recommended for Free Tier

This option gives you a production-ready app with minimal configuration.

#### Step 1: Prepare Your Code

1. **Update for PostgreSQL** (since we used SQLite for development):

```bash
# Install PostgreSQL adapter
cd server
npm install @prisma/adapter-pg pg

# Update your schema.prisma
# Change datasource to:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/task-manager.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy Backend to Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: task-manager-api
   - **Region**: Choose closest to you
   - **Branch**: main
   - **Root Directory**: server
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
5. Add environment variables:
   ```
   DATABASE_URL=(will be provided by Render)
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app (update after frontend deploy)
   ```
6. Click "Create Web Service"

#### Step 3: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: client
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: dist
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Click "Deploy"

#### Step 4: Update CORS

After both are deployed, update your backend environment variable:
- `CLIENT_URL` = Your Vercel URL (e.g., https://task-manager-abc123.vercel.app)

---

### Option 2: Railway (All-in-One) - Easiest Setup

Railway handles everything in one platform with PostgreSQL included.

1. Go to [Railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically:
   - Detect your services
   - Provision PostgreSQL
   - Set up environment variables
   - Deploy both frontend and backend

Add these environment variables in Railway:
```
# Backend variables
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
CLIENT_URL=${{Frontend.RAILWAY_STATIC_URL}}

# Frontend variables
VITE_API_URL=${{Backend.RAILWAY_PUBLIC_URL}}
```

---

### Option 3: Local Network Deployment (Use on Your Computer/Network)

If you want to use it locally on your machine or home network:

#### Quick Local Production Setup

1. **Build the production version**:
```bash
# Build frontend
cd client
npm run build

# Serve with a static server
npm install -g serve
serve -s dist -l 3001
```

2. **Run backend in production mode**:
```bash
cd server
NODE_ENV=production npm start
```

3. **Access your app**: http://localhost:3001

#### Deploy on Home Network (Access from other devices)

1. **Find your local IP**:
```bash
# On Mac
ipconfig getifaddr en0

# On Windows
ipconfig
```

2. **Update environment variables**:
```bash
# .env file
CLIENT_URL=http://YOUR_LOCAL_IP:3001
VITE_API_URL=http://YOUR_LOCAL_IP:3000
```

3. **Start servers with host flag**:
```bash
# Frontend
cd client && npm run dev -- --host

# Backend already listens on all interfaces
cd server && npm run dev
```

4. **Access from any device on your network**:
   - `http://YOUR_LOCAL_IP:5173`

---

### Option 4: Docker Deployment (Professional)

Create a complete Docker deployment:

```dockerfile
# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine as builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: taskmanager
      POSTGRES_USER: taskuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      DATABASE_URL: postgresql://taskuser:${DB_PASSWORD}@postgres:5432/taskmanager
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
    ports:
      - "3000:3000"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Production Checklist

Before deploying, ensure:

- [ ] Change all secret keys in environment variables
- [ ] Update `CLIENT_URL` and `VITE_API_URL` with production URLs
- [ ] Enable HTTPS (automatic on Vercel/Render/Railway)
- [ ] Set up database backups
- [ ] Configure rate limiting for production
- [ ] Test with production build locally first

---

## 🎯 Recommended: Quick Deploy Commands

```bash
# 1. Test production build locally
cd client && npm run build && npm run preview

# 2. Create GitHub repository
gh repo create task-manager --public --source=. --remote=origin --push

# 3. Deploy to Vercel (requires Vercel CLI)
npm i -g vercel
cd client && vercel

# 4. Deploy to Render
# Use the Render dashboard with render.yaml file
```

---

## 📱 Making it a Mobile App (PWA)

Add PWA support for mobile installation:

1. Install PWA plugin:
```bash
cd client
npm install vite-plugin-pwa -D
```

2. Update `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Task Manager',
        short_name: 'Tasks',
        theme_color: '#3b82f6',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
}
```

Users can then "Add to Home Screen" on mobile devices!

---

## Need Help?

- **Vercel Issues**: Check build logs in Vercel dashboard
- **Database Issues**: Ensure PostgreSQL connection string is correct
- **CORS Issues**: Verify CLIENT_URL matches your frontend URL exactly
- **Environment Variables**: Double-check all are set correctly

Choose the deployment option that best fits your needs. Vercel + Render is recommended for a free, production-ready deployment!
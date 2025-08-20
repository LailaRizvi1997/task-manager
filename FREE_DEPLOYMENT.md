# 🆓 **100% FREE Deployment Guide**

## **No PostgreSQL Needed - Uses SQLite (Free Forever)**

---

## 🎯 **Exact Render Configuration**

### **Step 1: Create Web Service on Render**

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Select your repository: `LailaRizvi1997/task-manager`

### **Step 2: Copy These EXACT Settings**

**Name:**
```
task-manager-api
```

**Region:**
```
Oregon (US West)
```

**Branch:**
```
main
```

**Root Directory:**
```
server
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install && npx prisma generate && npx prisma migrate deploy
```

**Start Command:**
```
npm start
```

**Plan:**
```
Free
```

### **Step 3: Environment Variables (Only 4 needed!)**

Click **"Advanced"** and add these:

**Variable 1:**
- Key: `DATABASE_URL`
- Value: `file:./production.db`

**Variable 2:**
- Key: `JWT_SECRET`
- Value: `your-super-secret-jwt-key-12345-change-this`

**Variable 3:**
- Key: `JWT_REFRESH_SECRET`
- Value: `your-other-super-secret-refresh-key-67890`

**Variable 4:**
- Key: `NODE_ENV`
- Value: `production`

**Variable 5:**
- Key: `CLIENT_URL`
- Value: `*`

### **Step 4: Click "Create Web Service"**

That's it! No database setup needed - SQLite is included.

---

## 🌐 **Deploy Frontend to Vercel (Free)**

### **Step 1: Deploy to Vercel**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your repository: `LailaRizvi1997/task-manager`

### **Step 2: Configure Vercel**

**Framework Preset:**
```
Vite
```

**Root Directory:**
```
client
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

### **Step 3: Environment Variables**

Add this environment variable:

**Key:** `VITE_API_URL`
**Value:** `https://task-manager-api-xyz.onrender.com` 
*(Replace with your actual Render URL after backend deploys)*

### **Step 4: Deploy**

Click **"Deploy"** - Vercel will build and deploy your frontend.

---

## 📱 **After Deployment**

### **Update CLIENT_URL**

1. Once Vercel gives you a URL (like `https://task-manager-abc123.vercel.app`)
2. Go back to Render → Your service → Environment
3. Update `CLIENT_URL` to your Vercel URL
4. Redeploy your Render service

---

## ✅ **What You'll Have**

- **Backend:** `https://task-manager-api-xyz.onrender.com` (FREE)
- **Frontend:** `https://task-manager-abc123.vercel.app` (FREE)
- **Database:** SQLite file hosted with your app (FREE)
- **Total Cost:** **$0/month forever** 

---

## 🔐 **Login Credentials**

Your app will automatically create:
- **Email:** `demo@taskmanager.com`
- **Password:** `Demo123!`

Plus sample tasks including EOD examples!

---

## ⚠️ **Important Notes**

- **Data persists** between app restarts
- **No database costs** - SQLite is just a file
- **Render free tier** sleeps after 15 minutes of inactivity
- **Takes 30 seconds** to wake up when accessed
- **Perfect for personal use**

---

## 🎯 **Summary: What Makes This FREE**

✅ **Render Web Service:** Free tier (750 hours/month)
✅ **Vercel Frontend:** Free tier (unlimited bandwidth)  
✅ **SQLite Database:** Just a file, no hosting cost
✅ **Domain:** Free .onrender.com and .vercel.app subdomains

**Result: $0/month forever!**
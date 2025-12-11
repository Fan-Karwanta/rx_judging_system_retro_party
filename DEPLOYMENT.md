# Deployment Guide - RX Judging System

This guide covers deploying the RX Judging System with:
- **Frontend (React/Vite)** → Vercel
- **Backend (Express/MongoDB/Socket.IO)** → Render

---

## Prerequisites

1. GitHub account with this repository pushed
2. Vercel account (https://vercel.com)
3. Render account (https://render.com)
4. MongoDB Atlas database (already configured)

---

## Step 1: Deploy Backend to Render

### 1.1 Push to GitHub
Make sure your code is pushed to GitHub.

### 1.2 Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `rx-judge-server`
   - **Root Directory**: `rx_judging_system_retro_party/server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 1.3 Add Environment Variables

In Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://fanrx:rxjudge123@cluster102.pilzy.mongodb.net/?appName=Cluster102` |
| `PORT` | `10000` |
| `CORS_ORIGINS` | `https://your-vercel-app.vercel.app` (update after Vercel deploy) |

### 1.4 Deploy
Click **"Create Web Service"** and wait for deployment to complete.

**Note your Render URL** (e.g., `https://rx-judge-server.onrender.com`)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `rx_judging_system_retro_party`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Add Environment Variables

In Vercel project settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://rx-judge-server.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://rx-judge-server.onrender.com` |

Replace `rx-judge-server.onrender.com` with your actual Render URL.

### 2.3 Deploy
Click **"Deploy"** and wait for the build to complete.

---

## Step 3: Update CORS on Render

After Vercel deployment, go back to Render and update the `CORS_ORIGINS` environment variable with your Vercel URL:

```
CORS_ORIGINS=https://your-app-name.vercel.app
```

Render will automatically redeploy with the new settings.

---

## Password Protection

The Admin Panel and Score Entry pages are password protected.

**Password**: `rxthanks123`

The Live Display page is publicly accessible without a password.

---

## Verification

After deployment, verify:

1. ✅ Home page loads at your Vercel URL
2. ✅ Admin Panel asks for password (`rxthanks123`)
3. ✅ Score Entry asks for password (`rxthanks123`)
4. ✅ Live Display loads without password
5. ✅ Data syncs in real-time between pages

---

## Troubleshooting

### Backend not connecting
- Check Render logs for errors
- Verify MongoDB URI is correct
- Ensure CORS_ORIGINS includes your Vercel URL

### Frontend API errors
- Verify VITE_API_URL and VITE_SOCKET_URL are set correctly
- Check browser console for CORS errors
- Redeploy Vercel after changing environment variables

### Socket.IO not working
- Render free tier may have cold starts (first request takes ~30s)
- Ensure VITE_SOCKET_URL points to Render URL without `/api`

---

## URLs Summary

| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://your-app.vercel.app` |
| Backend (Render) | `https://rx-judge-server.onrender.com` |
| API Endpoint | `https://rx-judge-server.onrender.com/api` |

---

## Quick Commands

```bash
# Local development - Frontend
cd rx_judging_system_retro_party
npm install
npm run dev

# Local development - Backend
cd rx_judging_system_retro_party/server
npm install
npm run dev
```

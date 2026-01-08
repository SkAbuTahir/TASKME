# Railway Deployment Guide for TaskMe

## Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Your code pushed to GitHub repository

## Step-by-Step Deployment

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy on Railway

1. **Go to Railway.app**
   - Visit https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your TaskMe repository

3. **Configure Environment Variables**
   In Railway dashboard, go to Variables tab and add:
   ```
   DATABASE_URL=postgresql://taskme_user:VYApORK2sA5TyVSNeJ1zXAV5VtA78v2s@dpg-d5fng13uibrs73e01jlg-a.singapore-postgres.render.com/taskme
   JWT_SECRET=6087a19778c2f6011a13b7a25234d06a9b3c9a037369e8d943182048d42fe21ab634ca1d02eae2439c5f5782df2d30485a04fcb6d53fa5b6dab0a75675a303d1
   NODE_ENV=production
   PORT=8800
   ```

4. **Configure Build Settings**
   - Root Directory: `/server`
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`

### 3. Deploy Frontend (Optional)

For the React frontend, you can deploy to:
- **Netlify** (recommended)
- **Vercel**
- **Railway** (separate service)

#### Netlify Deployment:
1. Go to netlify.com
2. Connect GitHub repository
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Root directory: `client`

4. Add environment variables:
   ```
   VITE_APP_BASE_URL=https://your-railway-app.railway.app
   VITE_APP_FIREBASE_API_KEY=your_firebase_key
   ```

### 4. Update CORS Settings

After deployment, update your server's CORS settings in `server/index.js`:

```javascript
const allowedOrigins = [
  "https://your-netlify-app.netlify.app", // Your frontend URL
  "https://your-railway-app.railway.app", // Your backend URL
  "http://localhost:3000",
  "http://localhost:3001"
];
```

## Post-Deployment Steps

### 1. Initialize Database
After first deployment, run database setup:
```bash
# In Railway console or locally with production DATABASE_URL
npm run db:push
npm run db:seed
```

### 2. Test Your Application
- Backend: `https://your-app.railway.app/api`
- Frontend: `https://your-app.netlify.app`

### 3. Monitor Logs
- Check Railway dashboard for deployment logs
- Monitor application performance

## Environment Variables Reference

### Backend (Railway)
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=8800
```

### Frontend (Netlify)
```env
VITE_APP_BASE_URL=https://your-railway-app.railway.app
VITE_APP_FIREBASE_API_KEY=your_firebase_api_key
```

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check if all dependencies are in package.json
   - Verify build command is correct
   - Check Railway build logs

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL database is accessible
   - Check Render.com database status

3. **CORS Errors**
   - Update allowedOrigins in server code
   - Redeploy after CORS changes

4. **Environment Variables**
   - Ensure all required variables are set in Railway
   - Check variable names match exactly

### Useful Commands:
```bash
# Local testing with production env
NODE_ENV=production npm start

# Check database connection
npx prisma studio

# View Railway logs
railway logs
```

## Custom Domain (Optional)

1. In Railway dashboard, go to Settings
2. Add custom domain
3. Update DNS records as instructed
4. Update CORS settings with new domain

## Scaling & Performance

- Railway automatically scales based on usage
- Monitor resource usage in dashboard
- Consider upgrading plan for higher traffic
- Implement caching strategies if needed

Your TaskMe application is now deployed and ready for production use!
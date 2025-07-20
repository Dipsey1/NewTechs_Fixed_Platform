# NewTechs Platform - Quick Start Guide

## 🚀 Get Your Multi-Blog Platform Running in 30 Minutes

This quick start guide will get your NewTechs multi-blog platform up and running quickly. For detailed information, refer to the comprehensive documentation.

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed  
- [ ] Git installed
- [ ] Domain access (for DNS configuration)
- [ ] Hosting accounts (Vercel recommended)

### Step 1: Frontend Setup (5 minutes)

```bash
# Clone or extract the platform files
cd newtechs-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

Your frontend will be available at `http://localhost:3000`

### Step 2: Backend Setup (10 minutes)

```bash
# Navigate to backend directory
cd newtechs-backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Start Flask server
python src/main.py
```

Your backend API will be available at `http://localhost:5000`

### Step 3: Content Migration (5 minutes)

1. **Setup Blogs:**
   - Visit: `http://localhost:5000/api/migrate/setup-blogs`
   - This creates all 7 blog structures

2. **Import Content:**
   - Place your Blogger backup in `/Takeout/Blogger/Blogs/`
   - Visit: `http://localhost:5000/api/migrate/blogger`
   - Wait for migration to complete

3. **Verify Migration:**
   - Visit: `http://localhost:5000/api/migrate/status`
   - Check that all posts were imported successfully

### Step 4: Production Deployment (10 minutes)

#### Frontend (Vercel):
1. Connect GitHub repo to Vercel
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=your-backend-url
   NEXT_PUBLIC_SITE_URL=your-domain.com
   ```
3. Deploy automatically

#### Backend (Choose one):
- **Vercel Functions:** Deploy alongside frontend
- **Railway:** Connect repo and deploy
- **VPS:** Use provided Docker configuration

### Step 5: Domain Connection

1. **Add Domain in Vercel:**
   - Go to Project Settings > Domains
   - Add your domain (e.g., domain.com)

2. **Configure DNS:**
   - Add A record: `@ → 76.76.19.61` (Vercel IP)
   - Add CNAME: `www → your-app.vercel.app`

3. **Wait for SSL:**
   - SSL certificates auto-provision (5-10 minutes)

### Essential Configuration

#### Environment Variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-backend.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Backend (.env)
DATABASE_URL=your-database-url
SECRET_KEY=your-secret-key
FLASK_ENV=production
```

#### Google AdSense Setup:
1. Apply for AdSense account
2. Add your AdSense Publisher ID to environment variables
3. Ad units will automatically appear once approved

### Verification Checklist

- [ ] Homepage loads correctly
- [ ] All 7 blogs are accessible
- [ ] Search functionality works
- [ ] Mobile navigation works
- [ ] Dark/light theme toggle works
- [ ] Newsletter signup works
- [ ] Content displays properly
- [ ] SSL certificate is active
- [ ] Domain redirects work

### Quick Troubleshooting

**Frontend won't start:**
- Check Node.js version (18+)
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

**Backend won't start:**
- Check Python version (3.11+)
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`

**Migration fails:**
- Check file paths in Takeout folder
- Verify backend is running
- Check browser console for errors

**Domain not working:**
- Verify DNS configuration
- Wait for propagation (up to 48 hours)
- Check SSL certificate status

### Next Steps

1. **Content Review:** Check migrated posts for formatting
2. **SEO Setup:** Configure Google Analytics and Search Console
3. **Monetization:** Set up AdSense and affiliate programs
4. **Customization:** Adjust colors, logos, and branding
5. **Backup:** Set up automated backups

### Support Resources

- **Full Documentation:** `NewTechs_Platform_Documentation.md`
- **Domain Setup Guide:** `domain_setup_guide.md`
- **API Documentation:** Available in main documentation
- **Technical Support:** Check troubleshooting section

### Success Metrics

After setup, you should have:
- ✅ 7 fully functional blogs
- ✅ 99+ migrated articles
- ✅ SEO-optimized structure
- ✅ Mobile-responsive design
- ✅ Monetization ready
- ✅ Professional domain setup

**Estimated Total Setup Time:** 30 minutes  
**Go-Live Time:** 1-2 hours (including DNS propagation)

---

*For detailed instructions and advanced configuration, refer to the complete documentation package.*


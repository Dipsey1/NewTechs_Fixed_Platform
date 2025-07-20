# Domain Setup Guide for NewTechs Multi-Blog Platform

## Overview

This guide will help you connect your domain.com domain to the NewTechs multi-blog platform. We'll be using a modern Next.js architecture with Vercel hosting to support multiple blogs under one domain.

## Architecture Overview

Your multi-blog platform will be structured as follows:

```
yourdomain.com/                    (Main NewTechs blog)
yourdomain.com/crypto/             (Crypto Updates sub-blog)
yourdomain.com/techspot/           (TechSpot365 sub-blog)
yourdomain.com/masterminds/        (TheMasterMinds sub-blog)
yourdomain.com/gambia/             (The Gambia Network sub-blog)
yourdomain.com/bantaba/            (The Grand Bantaba sub-blog)
yourdomain.com/dibz/               (dibz inc sub-blog)
```

## Step-by-Step Domain Connection Process

### Step 1: Prepare Your Domain at Domain.com

1. **Log into your Domain.com account**
2. **Navigate to your domain management panel**
3. **Find the DNS management section**
4. **Prepare to add DNS records** (we'll provide the specific records after deployment)

### Step 2: Deploy to Vercel (We'll handle this)

1. **Create Vercel account** (if needed)
2. **Deploy the Next.js multi-blog platform**
3. **Get the deployment URL** (something like `your-project.vercel.app`)

### Step 3: Add Custom Domain in Vercel

1. **Go to your Vercel project dashboard**
2. **Click on "Settings" tab**
3. **Select "Domains" from the sidebar**
4. **Click "Add Domain" button**
5. **Enter your domain name** (e.g., `yourdomain.com`)
6. **Vercel will provide DNS configuration instructions**

### Step 4: Configure DNS Records at Domain.com

#### Option A: Using A Records (Recommended for Apex Domain)

Add these A records in your Domain.com DNS panel:

```
Type: A
Name: @ (or leave blank for root domain)
Value: 76.76.19.19
TTL: 3600 (or default)

Type: A
Name: www
Value: 76.76.19.19
TTL: 3600 (or default)
```

#### Option B: Using CNAME Records (For Subdomains)

If you want to use a subdomain like `blog.yourdomain.com`:

```
Type: CNAME
Name: blog
Value: your-project.vercel.app
TTL: 3600 (or default)
```

#### Option C: Using Nameservers (Advanced)

For maximum control, you can use Vercel's nameservers:

1. **In Vercel, enable nameserver management**
2. **Copy the provided nameservers** (usually 4 nameserver addresses)
3. **In Domain.com, change nameservers to Vercel's nameservers**

### Step 5: SSL Certificate Setup

Vercel automatically provides SSL certificates for custom domains:

1. **SSL certificates are automatically generated**
2. **HTTPS is enforced by default**
3. **Certificates auto-renew**
4. **No additional configuration needed**

### Step 6: Verify Domain Connection

1. **Wait for DNS propagation** (can take up to 48 hours, usually 15-30 minutes)
2. **Check domain status in Vercel dashboard**
3. **Test the website** by visiting your domain
4. **Verify all sub-blog paths work correctly**

## DNS Configuration Examples

### For Domain.com DNS Panel

```
# Root domain
Type: A
Host: @
Points to: 76.76.19.19
TTL: 3600

# WWW subdomain
Type: A
Host: www
Points to: 76.76.19.19
TTL: 3600

# Optional: Email forwarding
Type: MX
Host: @
Points to: mail.yourdomain.com
Priority: 10
TTL: 3600
```

### Alternative: CNAME Configuration

```
# Root domain (if supported)
Type: CNAME
Host: @
Points to: your-project.vercel.app
TTL: 3600

# WWW subdomain
Type: CNAME
Host: www
Points to: your-project.vercel.app
TTL: 3600
```

## Multi-Blog URL Structure

After setup, your blogs will be accessible at:

| Blog Name | URL Path | Description |
|-----------|----------|-------------|
| New Techs (Main) | `yourdomain.com/` | Main tech blog homepage |
| Crypto Updates | `yourdomain.com/crypto/` | Cryptocurrency content |
| TechSpot365 | `yourdomain.com/techspot/` | Tech news and updates |
| TheMasterMinds | `yourdomain.com/masterminds/` | Tech insights and analysis |
| The Gambia Network | `yourdomain.com/gambia/` | Regional tech content |
| The Grand Bantaba | `yourdomain.com/bantaba/` | Community discussions |
| dibz inc | `yourdomain.com/dibz/` | Business and startup content |

## Advanced Features

### Custom Subdomains (Optional)

If you want each blog on its own subdomain:

```
newtechs.yourdomain.com     (Main blog)
crypto.yourdomain.com       (Crypto Updates)
techspot.yourdomain.com     (TechSpot365)
masterminds.yourdomain.com  (TheMasterMinds)
gambia.yourdomain.com       (The Gambia Network)
bantaba.yourdomain.com      (The Grand Bantaba)
dibz.yourdomain.com         (dibz inc)
```

This requires wildcard DNS setup:

```
Type: A
Host: *
Points to: 76.76.19.19
TTL: 3600
```

### Email Setup (Optional)

To set up email with your domain:

```
Type: MX
Host: @
Points to: mail.yourdomain.com
Priority: 10
TTL: 3600

Type: TXT
Host: @
Value: "v=spf1 include:_spf.google.com ~all"
TTL: 3600
```

## Troubleshooting

### Common Issues and Solutions

1. **Domain not connecting after 24 hours**
   - Check DNS records are correct
   - Verify TTL settings
   - Clear browser cache
   - Use DNS checker tools

2. **SSL certificate not working**
   - Wait for Vercel to generate certificate
   - Check domain verification status
   - Ensure DNS records point to Vercel

3. **Subdirectories not working**
   - Verify Next.js routing configuration
   - Check middleware setup
   - Test individual blog paths

4. **Email not working**
   - Verify MX records
   - Check email provider settings
   - Test email forwarding

### DNS Propagation Checker

Use these tools to check DNS propagation:
- whatsmydns.net
- dnschecker.org
- dns.google (Google DNS checker)

### Vercel Domain Status

Check domain status in Vercel:
1. Go to project settings
2. Click "Domains"
3. Check status indicators:
   - ✅ Valid Configuration
   - ⚠️ Invalid Configuration
   - 🔄 Pending Verification

## Support and Next Steps

### After Domain Connection

1. **Test all blog sections**
2. **Verify SEO settings**
3. **Check Google Analytics integration**
4. **Test AdSense ad placements**
5. **Verify social sharing functionality**

### Performance Optimization

1. **Enable Vercel Analytics**
2. **Set up monitoring**
3. **Configure caching headers**
4. **Optimize images and assets**

### Security Features

1. **HTTPS enforcement** (automatic)
2. **Security headers** (configured)
3. **DDoS protection** (Vercel provides)
4. **Rate limiting** (if needed)

## Contact Information

If you need assistance with domain setup:

1. **Domain.com Support**: For DNS configuration help
2. **Vercel Support**: For hosting and deployment issues
3. **Project Support**: For custom configuration needs

## Timeline

Expected setup timeline:
- **Domain configuration**: 15-30 minutes
- **DNS propagation**: 15 minutes to 48 hours (usually 1-2 hours)
- **SSL certificate generation**: 5-15 minutes after DNS propagation
- **Full functionality**: Within 2-4 hours of DNS configuration

## Backup Plan

If primary setup doesn't work:
1. **Use Vercel's provided domain** temporarily
2. **Try CNAME instead of A records**
3. **Use nameserver method**
4. **Contact Domain.com support for assistance**

---

**Note**: This guide assumes you're using Domain.com as your registrar. The process is similar for other registrars, but the interface may look different. The DNS record values and Vercel configuration remain the same regardless of your registrar.


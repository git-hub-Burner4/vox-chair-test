# Environment Variables Setup

## Required Environment Variables

This project requires the following environment variables to be set:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`
   - Get these from your Supabase Dashboard: https://app.supabase.com/project/_/settings/api
   - **Project URL**: Found under "Project URL"
   - **Anon Key**: Found under "Project API keys" → "anon public"

## Vercel Deployment Setup

⚠️ **IMPORTANT**: You must add environment variables to Vercel before deploying!

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |

4. Redeploy your application

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Link your project (if not already linked)
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Pull environment variables locally (optional)
vercel env pull
```

### Option 3: Using .env file during deployment

```bash
vercel --build-env NEXT_PUBLIC_SUPABASE_URL="your-url" \
      --build-env NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
```

## Troubleshooting

### Error: "Your project's URL and API key are required to create a Supabase client!"

**Cause**: Environment variables are not set in Vercel

**Solution**:
1. Add environment variables to Vercel (see above)
2. Trigger a new deployment
3. Make sure you selected all environments (Production, Preview, Development)

### Error: "ESLint must be installed"

**Cause**: ESLint is not installed in your project

**Solution**:
```bash
npm install --save-dev eslint
git add package.json package-lock.json
git commit -m "Add ESLint"
git push
```

## OAuth Configuration

Don't forget to add your Vercel deployment URLs to Supabase:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app-*.vercel.app/auth/callback` (for preview deployments)

## Security Notes

- ✅ `.env.local` is gitignored and will never be committed
- ✅ The `NEXT_PUBLIC_` prefix means these are safe to expose to the browser
- ✅ Your anon key is safe to use client-side (it's designed for that)
- ⚠️ Never commit `.env.local` to version control
- ⚠️ Never share your service role key (not used in this project)

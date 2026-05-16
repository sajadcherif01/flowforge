# FlowForge

Build and automate chatbot flows. Self-hosted, free, no limits.

## Stack

- **Frontend**: React + TypeScript + Vite + React Flow + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **AI**: GitHub Models API (GPT-4o free)
- **Hosting**: GitHub Pages (free)

## Setup

### 1. Create a Supabase project

1. Go to https://supabase.com and create a free project
2. Open the **SQL Editor** and paste the contents of `supabase/migrations/00001_schema.sql`
3. Run the SQL to create all tables and RLS policies

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install and run

```bash
npm install
npm run dev
```

### 4. Deploy to GitHub Pages

1. Create a GitHub repository named `flowforge`
2. Push the code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USER/flowforge.git
   git push -u origin main
   ```
3. In your repo settings: **Settings → Pages → Source: GitHub Actions**
4. The app will auto-deploy at `https://YOUR_USER.github.io/flowforge`

### 5. Configure integrations

In the app:
- **Settings**: Add your GitHub Personal Access Token (with `read:models` scope)
- **Integrations**: Configure Telegram Bot token, SMTP, Webhooks

## Features

- Visual flow builder with drag & drop
- 8 node types: Trigger, Message, Condition, Delay, AI, Telegram, Email, Webhook
- Telegram bot integration
- AI responses via GitHub Models (GPT-4o free)
- Contact management
- Email sending via SMTP
- Webhook support
- Real-time conversation tracking
- Full data encryption at rest
- Row Level Security (Supabase RLS)

## Architecture

```
User → GitHub Pages (React App) → Supabase (PostgreSQL + Auth)
                                  → Edge Functions (Telegram Bot, AI, Email)
                                  → GitHub Models API (AI)
                                  → Telegram API / SMTP
```

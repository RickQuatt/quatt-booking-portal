# Quatt Cloudflare Web App Template

A forkable template for building internal web tools at Quatt. Fork it, deploy to Cloudflare, and only people with `@quatt.io` Google accounts can access your app. No auth code to write.

## What You Get For Free

- **Authentication** — Google OAuth login restricted to `@quatt.io` emails. Handled entirely by Cloudflare edge middleware. Zero auth code in your app.
- **Cloudflare Pages deployment** — Push to `main` and it's live. Branch previews included.
- **Dark mode** — Toggle in the sidebar. All components adapt automatically.
- **Quatt branding** — Brand colors, Plus Jakarta Sans font, Quatt logo in sidebar.
- **Responsive sidebar** — Collapsible on desktop, drawer on mobile.
- **14 UI components** — Button, Card, Dialog, Table, Form, Input, and more (shadcn/ui).
- **Animation presets** — Page transitions, hover effects, stagger animations (Framer Motion).
- **Type safety** — TypeScript strict mode. Catches errors before they reach production.
- **Code formatting** — Prettier + ESLint enforced on commit.

## 5-Minute Setup

### 1. Fork this repo

Click "Fork" on GitHub. Give it a name like `my-cool-tool`.

### 2. Create a Cloudflare Pages project

- Go to [Cloudflare Pages](https://dash.cloudflare.com/) and create a new project
- Connect your forked GitHub repo
- **Build command:** `bash cf-pages-build.sh`
- **Output directory:** `dist`

### 3. Set environment variables

In Cloudflare Pages > Settings > Environment Variables:

| Variable | Value |
|---|---|
| `SESSION_SECRET` | Generate one: `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Client ID, Web type) |
| `ALLOWED_EMAIL_DOMAIN` | `@quatt.io` |

### 4. Push to main

Your app is live. Only `@quatt.io` Google accounts can access it.

## Building Your Tool

After forking, here's what to customize:

| What | Where | How |
|---|---|---|
| **App name** | Cloudflare env var `APP_NAME` | Shown on the login page |
| **Add a page** | `src/pages/my-page/page.tsx` | Create file, add route in `src/App.tsx` |
| **Add sidebar nav** | `src/components/layout/Sidebar/Sidebar.tsx` | Add item to `navigationItems` array |
| **Add UI components** | Terminal | `npx shadcn@latest add <component-name>` |
| **Change colors** | `src/index.css` | Modify CSS variables under `@theme` |

## Local Development

```bash
npm install
npm run dev              # Fast UI development (no login required)
npm run dev:with-auth    # Full login flow (create .dev.vars first)
```

For `dev:with-auth`, create a `.dev.vars` file in the repo root:

```
SESSION_SECRET=local-dev-secret-at-least-32-characters
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ALLOWED_EMAIL_DOMAIN=@quatt.io
```

## Stack

React 18 · TypeScript · Vite · Tailwind v4 · shadcn/ui · Wouter · TanStack Query · Framer Motion · Cloudflare Pages

## For AI Assistants

See [CLAUDE.md](./CLAUDE.md) for brand guidelines, coding standards, component reference, and architecture details. This file is automatically read by Claude Code, Cursor, and other AI coding tools.

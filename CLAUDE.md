# CLAUDE.md — Quatt Cloudflare Web App Template

## What This Is

This is a **forkable template** for building internal web tools at Quatt. It is deployed to Cloudflare Pages.

**Authentication is already handled.** Only people with a `@quatt.io` Google account can access your app. You do not need to write any auth code — the Cloudflare middleware does it all before your app even loads. Every route, every asset, every API call is protected automatically.

**Fork it. Deploy to Cloudflare. Start building your pages.**

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (no auth — fast UI iteration)
npm run dev:with-auth    # Start dev server with full auth flow (needs .dev.vars)
npm run build            # Production build
npm run check-types      # TypeScript type checking
npm run lint             # Check code quality
npm run prettier:format  # Auto-format all code
npm run test:unit        # Run unit tests
```

**Which dev mode should I use?**
- `npm run dev` — Use this 95% of the time. Fast hot-reload. Auth is skipped.
- `npm run dev:with-auth` — Use this only when testing the login flow. Slower (rebuilds on each change). Requires a `.dev.vars` file (see Deployment section).

## Quatt Brand & Styling Guide

All UI built from this template should follow Quatt's visual identity. AI assistants: use these colors and patterns when generating components.

### Primary Brand Colors

These are registered as Tailwind theme colors and available as utility classes:

| Name | Hex | Tailwind Classes | Use For |
|---|---|---|---|
| Electric Neon | `#ccf822` | `bg-quatt-primary`, `text-quatt-primary` | Primary buttons, accents, highlights, brand emphasis |
| Pumpkin Orange | `#ff6933` | `bg-quatt-secondary`, `text-quatt-secondary` | Secondary actions, CTAs, attention-grabbing elements |
| Forest Black | `#071413` | `bg-quatt-dark`, `text-quatt-dark` | Dark backgrounds, primary text on light backgrounds |

### Extended Palette (reference)

These colors are from the official Quatt design system (`intt-system`). They are NOT pre-registered as Tailwind classes in this template, but you can add them to `src/index.css` under `@theme` if needed:

| Name | Hex | Use For |
|---|---|---|
| Ocean Blue | `#97B9BF` | Informational UI, calm/neutral elements |
| Terra Orange | `#FAB078` | Warm accents, secondary highlights |
| Moss Green | `#8EBF92` | Success states, positive indicators |
| Accent Blue | `#00A5F7` | Links, interactive elements, info badges |
| Accent Cyan | `#0AE5F5` | Data visualizations, charts |
| Accent Green | `#3AE09E` | Success confirmations, positive trends |

### Semantic Colors (Light & Dark Mode)

These are defined as CSS variables in `src/index.css` and used by shadcn/ui components automatically:

| Token | Light Mode | Dark Mode | Used By |
|---|---|---|---|
| `--background` | Cool gray (`hsl(220 15% 94%)`) | Dark blue-gray (`hsl(220 20% 8%)`) | Page background |
| `--card` | White (`hsl(0 0% 100%)`) | Dark card (`hsl(220 18% 13%)`) | Card, panel backgrounds |
| `--foreground` | Near-black | Near-white | Primary text |
| `--muted` | Light gray | Dark gray | Disabled text, secondary info |
| `--destructive` | Red | Dark red | Error states, delete actions |
| `--border` | Light border | Dark border | Dividers, input borders |

You don't need to use these directly — shadcn/ui components (Card, Button, Input, etc.) already use them. Just use the components.

### Typography

- **Font:** Plus Jakarta Sans (variable weight, 200–800)
- **Loaded from:** `src/assets/fonts/` (bundled, no external requests)
- **Note:** The official Quatt customer-facing font is MNKY Marcel (used in the intt-system). This template uses Plus Jakarta Sans for internal tools — it's more readable at small sizes.

| Class | Size | Use For |
|---|---|---|
| `text-xs` | 0.75rem | Metadata, timestamps, labels |
| `text-sm` | 0.875rem | Body text, form inputs, table cells |
| `text-base` | 1rem | Default body text |
| `text-lg` | 1.125rem | Emphasized text, subheadings |
| `text-xl` | 1.25rem | Section subheadings |
| `text-2xl` | 1.5rem | Section headings |
| `text-3xl` | 1.875rem | Page titles |

### Dark Mode

- **How it works:** Class-based. The `dark` class on `<html>` activates dark variants.
- **Toggle:** Built into the sidebar (sun/moon switch).
- **In your code:** Use `dark:` prefix for dark-mode overrides: `className="bg-white dark:bg-gray-900"`
- **All semantic colors** in `src/index.css` have both light and dark values — shadcn/ui components handle this automatically.

### Spacing

Use Tailwind's default spacing scale. Common patterns in this template:

| Pattern | Class | When |
|---|---|---|
| Page padding | `p-6` | Top-level page wrapper |
| Card gap | `space-y-4` | Between elements inside a card |
| Grid gap | `gap-4` | Between grid/flex children |
| Section gap | `space-y-6` | Between major page sections |

### Border Radius

- Default: `--radius: 0.5rem` (defined in `src/index.css`)
- Buttons: `rounded-full` (pill-shaped, Quatt style)
- Cards: `rounded-lg` (via shadcn/ui Card component)
- Inputs: `rounded-md`

### Design Reference

- **Figma:** [Quatt Web Design System](https://www.figma.com/design/JteBbW3yaTqrRbLsNIjeu3/Quatt-Web-Design-System)
- **Full color palette:** See `intt-system/packages/ui-public/src/theme.css` for all 11 color families with full shade ranges (100–800)

## Coding Standards

These rules keep code consistent, especially when AI assistants generate it.

### Component Patterns

```tsx
// Always use named exports (never export default)
export function MyComponent({ title }: Props) {
  return <h1>{title}</h1>;
}

// Props type: use "Props" for single-component files
type Props = {
  title: string;
  isActive: boolean;   // Booleans: prefix with is, has, should, can
};

// For files with multiple components, name props explicitly
type HeaderProps = { title: string };
type FooterProps = { copyright: string };
```

### File Structure

```
src/pages/my-feature/
  page.tsx              # Page component (required, named export)
  components/           # Page-specific components (optional)
    MyWidget.tsx
  hooks/                # Page-specific hooks (optional)
    useMyData.ts

src/components/
  ui/                   # shadcn/ui primitives (Button, Card, etc.)
  shared/               # Reusable across pages (DataTable, Loader, etc.)
  layout/               # Layout components (Sidebar)
```

### Styling Rules

- **Tailwind utility classes only.** No inline styles (`style={}`), no CSS modules, no styled-components.
- **Use shadcn/ui components** as building blocks. Don't rebuild what exists (Button, Card, Dialog, Input, Table, etc.).
- **Add new shadcn/ui components** with: `npx shadcn@latest add <component-name>`
- **Use Quatt brand colors** for primary actions and branding: `bg-quatt-primary`, `text-quatt-dark`, etc.
- **Use semantic colors** for everything else — they automatically adapt to dark mode.

### Animation

Framer Motion presets are available in `src/lib/animations.ts`:

```tsx
import { fadeInVariants, pageVariants, cardHoverVariants } from "@/lib/animations";

<motion.div variants={fadeInVariants} initial="initial" animate="animate">
```

Available: `pageVariants`, `fadeInVariants`, `slideInRightVariants`, `slideInLeftVariants`, `scaleUpVariants`, `staggerContainerVariants`, `staggerItemVariants`, `cardHoverVariants`, `buttonTapVariants`, `spinnerVariants`, `notificationVariants`, `collapseVariants`

## Do's and Don'ts

### Don't Touch These Files

These handle authentication and deployment. Modifying them can break your app:

| File | What It Does |
|---|---|
| `functions/_middleware.ts` | Blocks all unauthenticated requests at the edge |
| `functions/api/create-session.ts` | Verifies Google tokens and issues session cookies |
| `cf-pages-build.sh` | Cloudflare build script (branch-aware) |

### Don't

- Add authentication code — it's already handled by the middleware
- Use inline styles (`style={{}}`) or CSS modules — use Tailwind classes
- Install UI packages without checking if shadcn/ui already has it (`npx shadcn@latest add`)
- Hardcode URLs or API endpoints — use environment variables
- Put secrets in `.env` files — use the Cloudflare dashboard (encrypted)
- Use `export default` — use named exports
- Remove or modify the session cookie logic
- Add `console.log` statements in committed code (linter will warn)

### Do

- Add pages in `src/pages/[name]/page.tsx`
- Register routes in `src/App.tsx`
- Add nav items in `src/components/layout/Sidebar/Sidebar.tsx`
- Use `npx shadcn@latest add <component>` for new UI primitives
- Use Quatt brand colors (`bg-quatt-primary`, `text-quatt-dark`)
- Use `npm run dev` for fast iteration, `npm run dev:with-auth` to test login
- Run `npm run check-types` before pushing — catches errors before Cloudflare build
- Run `npm run prettier:format` to auto-fix formatting

## How to Add a Page

**Step 1:** Create the page file:

```tsx
// src/pages/my-page/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function MyPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Hello</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your content here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2:** Register the route in `src/App.tsx`:

```tsx
import { MyPage } from "./pages/my-page/page";
// ...
<Route path="/my-page" component={MyPage} />
```

**Step 3:** Add a sidebar link in `src/components/layout/Sidebar/Sidebar.tsx`:

```tsx
import { FileText } from "lucide-react";
// In the navigationItems array:
{ label: "My Page", href: "/my-page", icon: FileText },
```

## Pre-installed Components

These shadcn/ui components are ready to use (import from `@/components/ui/`):

Accordion, Badge, Button, Card, Checkbox, Dialog, Form, Input, Label, RadioGroup, Select, Skeleton, Sonner (toast notifications), Switch, Table, Tabs, Textarea

**Shared components** (import from `@/components/shared/`):

Brand (Quatt logo), DataTable (generic table), ErrorText, Loader, PageHeader, ThemeToggle

## Architecture

### Authentication Flow

```
User visits any URL
    |
    v
Cloudflare Edge Middleware (functions/_middleware.ts)
    |
    |-- No session cookie --> Serve inline login page (Google Sign-In button)
    |-- Invalid session ----> Clear cookie, redirect to login
    |-- Valid session ------> Pass through to your React app
```

The middleware blocks ALL routes (including `/assets/*`) without a valid session cookie. Unauthenticated users never receive a single byte of your app.

### Environment Variables

Set these in the **Cloudflare Pages dashboard** (Settings > Environment Variables):

| Variable | Required | Purpose | Example |
|---|---|---|---|
| `SESSION_SECRET` | Yes | Signs session cookies | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth Client ID | `123...apps.googleusercontent.com` |
| `ALLOWED_EMAIL_DOMAIN` | No | Restrict access (default: `@quatt.io`) | `@quatt.io` |
| `APP_NAME` | No | Login page title (default: "Quatt Internal Tool") | `My Cool Tool` |

### Project Structure

```
cloudflare-webapp-template/
|-- functions/                  # Cloudflare edge functions (DO NOT MODIFY)
|   |-- _middleware.ts          # Auth middleware
|   |-- api/create-session.ts   # Session endpoint
|-- src/
|   |-- App.tsx                 # Root app + routes (MODIFY: add your routes here)
|   |-- main.tsx                # React entry point
|   |-- index.css               # Tailwind + brand colors + dark mode tokens
|   |-- pages/                  # Your pages (MODIFY: add pages here)
|   |-- components/
|   |   |-- ui/                 # shadcn/ui components
|   |   |-- shared/             # Reusable components
|   |   |-- layout/             # Sidebar (MODIFY: add nav items)
|   |-- hooks/                  # Custom hooks
|   |-- lib/                    # Utilities (animations, helpers)
|-- .env.development            # Dev env config
|-- .env.production             # Prod env config
|-- cf-pages-build.sh           # Cloudflare build script (DO NOT MODIFY)
|-- components.json             # shadcn/ui CLI config
```

## Deployment

### Cloudflare Pages Setup

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/) > Create a project
2. Connect your GitHub fork
3. Settings:
   - **Build command:** `bash cf-pages-build.sh`
   - **Output directory:** `dist`
4. Add environment variables (see table above)
5. Deploy

No `wrangler.toml` needed — Cloudflare auto-discovers the `functions/` directory.

### Google OAuth Setup (one-time)

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Under "Authorized JavaScript origins", add:
   - Your Cloudflare Pages URL (e.g., `https://my-tool.pages.dev`)
   - `http://localhost:5173` (for local dev)
4. Copy the **Client ID** > set as `GOOGLE_CLIENT_ID` in Cloudflare

### Local Development with Auth

Create a `.dev.vars` file in the repo root (gitignored):

```
SESSION_SECRET=any-random-string-at-least-32-chars-long
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ALLOWED_EMAIL_DOMAIN=@quatt.io
```

Then run:

```bash
npm run dev:with-auth
```

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Login page shows instead of my app | Missing env vars in Cloudflare | Set `GOOGLE_CLIENT_ID` + `SESSION_SECRET` in Cloudflare dashboard |
| "Access restricted" after signing in | Wrong email domain | Check `ALLOWED_EMAIL_DOMAIN` env var (default: `@quatt.io`) |
| Build fails on Cloudflare | TypeScript errors | Run `npm run check-types` locally first |
| White screen after deploy | Build output missing | Verify build command is `bash cf-pages-build.sh` and output dir is `dist` |
| Auth works locally but not on Cloudflare | Env vars not set in dashboard | `.dev.vars` is local only — set vars in Cloudflare Pages dashboard too |
| Google Sign-In popup blocked | Missing authorized origin | Add your domain to "Authorized JavaScript origins" in Google Cloud Console |
| "Not authenticated" in dev mode | Running `npm run dev` (no auth) | This is expected — use `npm run dev:with-auth` or just build your UI |

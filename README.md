# Quatt Support Dashboard

Internal support dashboard for managing CICs, installations, and installers.

## Quick Start

1. `npm install`
2. `npm run dev`
3. Open http://localhost:5173

## Documentation

See [CLAUDE.md](./CLAUDE.md) for comprehensive documentation including:

- Architecture & technology stack
- Component development standards
- Testing guidelines
- API client management

## Authentication Setup

See [docs/CLOUDFLARE_AUTH_SETUP.md](./docs/CLOUDFLARE_AUTH_SETUP.md) for Cloudflare auth configuration.

## Onboarding

Additional onboarding tips: [Dev intro (Slite)](https://quatt.slite.com/app/docs/kCmDd2zez8diqa)

## Adding UI Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add <component-name>
```

Configuration is in `components.json`.

## Secret Debug Page

MQTT command interface: `/cics/{cicUuid}/debug`

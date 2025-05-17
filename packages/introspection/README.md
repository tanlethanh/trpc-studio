# tRPC Introspection

A package that provides introspection capabilities for tRPC APIs. This package adds an introspection endpoint to your tRPC router that exposes procedure information, including input and output schemas.

## Features

- 🔍 Exposes procedure information through an introspection endpoint
- 📝 Converts Zod schemas to JSON Schema format
- 🔒 Optional security through path customization
- 🎯 Type-safe procedure information

## Installation

```bash
npm install @trpc-playground/introspection
```

## Usage

```tsx
import { createIntrospectionRouter } from '@trpc-playground/introspection';
import { createTRPCRouter } from '@trpc/server';

const appRouter = createTRPCRouter({
  // Your existing routers...
});

// Add introspection router
const router = createIntrospectionRouter(appRouter, {
  enabled: process.env.NODE_ENV !== 'production',
  path: '/introspection'
});

export type AppRouter = typeof router;
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether to enable the introspection endpoint |
| `path` | `string` | `/introspection` | The path for the introspection endpoint |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build package
npm run build

# Run linter
npm run lint
```

## License

MIT 
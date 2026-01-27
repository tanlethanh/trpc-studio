# @trpc-studio/introspection

Add introspection capabilities to your tRPC API for use with [tRPC Studio](https://trpc-studio.vercel.app).

[GitHub](https://github.com/tanlethanh/trpc-studio/tree/main/packages/introspection)

**Keywords:** tRPC, API Introspection, TypeScript, API Schema, JSON Schema, tRPC Studio, API Testing, TypeScript API

## Quick Start

Note: This package supports `tRPC@11` and `zod@4`. Consider contributing if you need other schema engines or new features.

```bash
npm install @trpc-studio/introspection
# or
yarn add @trpc-studio/introspection
```

### Basic usage (Recommended)

```ts
import { initTRPC } from '@trpc/server';
import { withIntrospection } from '@trpc-studio/introspection';

const t = initTRPC.create();

const router = t.router({
  // Your router/procedures
});

export const appRouter = withIntrospection(t, router);

// You also need to enable cors for the origin https://trpc-studio.vercel.app
```

### Convenience method: `addIntrospectionEndpoint`

For simpler use cases where you don't need explicit control over the tRPC instance:

```ts
import { initTRPC } from '@trpc/server';
import { addIntrospectionEndpoint } from '@trpc-studio/introspection';

const t = initTRPC.create();
const router = t.router

export const appRouter = addIntrospectionEndpoint(
  router({
    // Your router/procedures
  })
);
```

> **Note:** `addIntrospectionEndpoint` is a convenience wrapper that extracts the router's configuration and internally creates a new tRPC instance. Use `withIntrospection` for more explicit control.

### Development only

```ts
import { initTRPC } from '@trpc/server';
import { withIntrospection } from '@trpc-studio/introspection';

const t = initTRPC.create();

const mainRouter = t.router({
	// Your router/procedures
});

export const appRouter = withIntrospection(t, mainRouter, {
	enabled: process.env.NODE_ENV === 'development',
});

// You also need to enable cors for the origin https://trpc-studio.vercel.app
```

## Usage with tRPC Studio

### 1. Add the introspection endpoint to your tRPC router
### 2. Visit [tRPC Studio](https://trpc-studio.vercel.app)
### 3. Enter your API URL (e.g., `https://your-api.com/api/trpc`)
### 4. Start testing your procedures!

## API

### `withIntrospection(t, router, options?)` (Recommended)

Adds an introspection endpoint by passing the tRPC root object directly. This is the recommended approach as it provides explicit control over your tRPC instance.

**Parameters:**
- `t` - The tRPC root object (from `initTRPC.create()`)
- `router` - Your tRPC router
- `options` - Optional configuration object

**Example:**
```ts
const t = initTRPC.create({ transformer: superjson });
const router = t.router({ /* ... */ });
const routerWithIntrospection = withIntrospection(t, router, {
  enabled: process.env.NODE_ENV === 'development'
});
```

### `addIntrospectionEndpoint(router, options?)`

A convenience wrapper that adds an introspection endpoint to an existing tRPC router. This method extracts the router's configuration and internally creates a new tRPC instance.

**Parameters:**
- `router` - Your tRPC router
- `options` - Optional configuration object

**Example:**
```ts
const routerWithIntrospection = addIntrospectionEndpoint(myRouter, {
  enabled: process.env.NODE_ENV === 'development',
  path: 'schema'
});
```

> **Note:** While simpler, this method is less explicit about tRPC instance management. Consider using `withIntrospection` for better clarity and control.

## Options

Both `addIntrospectionEndpoint` and `withIntrospection` accept the same options:

| Option   | Type      | Default            | Description                                 |
|----------|-----------|--------------------|---------------------------------------------|
| enabled  | boolean   | true               | Enable/disable introspection endpoint       |
| path     | string    | 'introspection'    | Customize introspection endpoint path       |

## License

MIT 
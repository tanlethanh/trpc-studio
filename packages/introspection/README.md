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

### Basic usage

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

// You also need to enable cors for the origin https://trpc-studio.vercel.app
```

### Development only
```ts
import { initTRPC } from '@trpc/server';
import { addIntrospectionEndpoint } from '@trpc-studio/introspection';

const t = initTRPC.create();
const router = t.router;

const mainRouter = router({
	// Your router/procedures
});

export const appRouter =
	process.env.NODE_ENV === 'development'
		? addIntrospectionEndpoint(mainRouter)
		: mainRouter;

// You also need to enable cors for the origin https://trpc-studio.vercel.app
```

## Usage with tRPC Studio

### 1. Add the introspection endpoint to your tRPC router
### 2. Visit [tRPC Studio](https://trpc-studio.vercel.app)
### 3. Enter your API URL (e.g., `https://your-api.com/api/trpc`)
### 4. Start testing your procedures!

## Options

| Option   | Type      | Default            | Description                                 |
|----------|-----------|--------------------|---------------------------------------------|
| enabled  | boolean   | true               | Enable/disable introspection endpoint       |
| path     | string    | '/introspection'   | Customize introspection endpoint path       |

## License

MIT 
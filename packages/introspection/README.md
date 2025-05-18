# @trpc-studio/introspection

Add introspection capabilities to your tRPC API for use with [tRPC Studio](https://trpc-studio.vercel.app).

[GitHub](https://github.com/tanlethanh/trpc-studio/tree/main/packages/introspection)

**Keywords:** tRPC, API Introspection, TypeScript, API Schema, JSON Schema, tRPC Studio, API Testing, TypeScript API

## Quick Start

```bash
npm install @trpc-studio/introspection
# or
yarn add @trpc-studio/introspection
```

```ts
import { createTRPCRouter } from '@trpc/server';
import { addIntrospectionEndpoint } from '@trpc-studio/introspection';

export const appRouter = addIntrospectionEndpoint(
  createTRPCRouter({})
);

export type AppRouter = typeof appRouter;
```

## Usage with tRPC Studio

1. Add the introspection endpoint to your tRPC router
2. Visit [tRPC Studio](https://trpc-studio.vercel.app)
3. Enter your API URL (e.g., `https://your-api.com/api/trpc`)
4. Start testing your procedures!

## Options

| Option   | Type      | Default            | Description                                 |
|----------|-----------|--------------------|---------------------------------------------|
| enabled  | boolean   | true               | Enable/disable introspection endpoint       |
| path     | string    | '/introspection'   | Customize introspection endpoint path       |

## License

MIT 
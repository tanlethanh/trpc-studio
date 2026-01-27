# tRPC Studio

A modern, simple studio for testing and exploring tRPC endpoints.

https://github.com/user-attachments/assets/ba3ef3e7-0641-47cc-9f45-0aca86d80883

## Quick Start

Note: This package supports `tRPC@11` and `zod@4`. Consider contributing if you need other schema engines or new features.

### 1. Add introspection to your tRPC API:
```bash
npm install @trpc-studio/introspection
# or
yarn add @trpc-studio/introspection
```

#### Basic usage
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

#### Development only
```ts
import { initTRPC } from '@trpc/server';
import { withIntrospection } from '@trpc-studio/introspection';

const t = initTRPC.create();

const router = t.router({
	// Your router/procedures
});

export const appRouter = withIntrospection(t, router, {
	enabled: process.env.NODE_ENV === 'development',
});

// You also need to enable cors for the origin https://trpc-studio.vercel.app
```

#### Convenience method: `addIntrospectionEndpoint`

For simpler use cases where you don't need explicit control:

```ts
import { initTRPC } from '@trpc/server';
import { addIntrospectionEndpoint } from '@trpc-studio/introspection';

const t = initTRPC.create();

export const appRouter = addIntrospectionEndpoint(
  t.router({
    // Your router/procedures
  })
);
```

### 2. Visit [tRPC Studio](https://trpc-studio.vercel.app)
### 3. Enter your API URL (e.g., `https://your-api.com/api/trpc`)
### 4. Start testing your procedures!

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

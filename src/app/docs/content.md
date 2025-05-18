# Documentation

## Getting Started

tRPC Studio is a modern, feature-rich studio for testing and exploring tRPC endpoints.
This guide will help you get started with using tRPC Studio effectively.

### Installation

To use tRPC Studio with your tRPC API, you need to add the introspection endpoint:

```bash
npm install @trpc-studio/introspection
# or
yarn add @trpc-studio/introspection
```

### Setup

Add the introspection endpoint to your tRPC router:

```typescript
import { createTRPCRouter } from '@trpc/server';
import { addIntrospectionEndpoint } from '@trpc-studio/introspection';

export const appRouter = addIntrospectionEndpoint(
  createTRPCRouter({})
);
```

## Features

- Interactive tRPC endpoint testing
- JSON Schema-based input validation
- Request history with replay capability
- Dark/Light mode support
- Responsive design

## Usage

Once you have set up the introspection endpoint, you can:

1. Visit tRPC Studio
2. Enter your API URL (e.g., https://your-api.com/api/trpc)
3. Browse and test your procedures

## Best Practices

For the best experience with tRPC Studio:

- Ensure your tRPC router is properly typed
- Use descriptive procedure names
- Implement proper input validation using Zod
- Keep your API documentation up to date 
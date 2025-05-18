# tRPC Studio

A modern, feature-rich studio for testing and exploring tRPC endpoints. Built with Next.js, TypeScript, and Tailwind CSS.

https://github.com/user-attachments/assets/ba3ef3e7-0641-47cc-9f45-0aca86d80883

## Quick Start

1. Add introspection to your tRPC API:
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
```

2. Visit [tRPC Studio](https://trpc-studio.vercel.app)
3. Enter your API URL (e.g., `https://your-api.com/api/trpc`)
4. Start testing your procedures!

## Features

- 🔍 Interactive tRPC endpoint testing
- 📝 JSON Schema-based input validation
- 🔄 Request history with replay capability
- 🌓 Dark/Light mode support
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast and efficient with Next.js

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

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouterDevalue } from '@/server/api/root-devalue';

/**
 * tRPC endpoint with Devalue transformer
 * Handles: circular references, repeated references, most JavaScript types
 * Use this when working with complex data structures with circular references
 */
const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: '/api/trpc-devalue',
		req,
		router: appRouterDevalue,
		createContext: () => ({}),
	});

export { handler as GET, handler as POST };

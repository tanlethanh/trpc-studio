import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouterSuperjson } from '@/server/api/root-superjson';

/**
 * tRPC endpoint with SuperJSON transformer
 * Handles: Date, Map, Set, RegExp, BigInt, undefined, NaN, Infinity
 * Use this when working with complex JavaScript types
 */
const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: '/api/trpc-superjson',
		req,
		router: appRouterSuperjson,
		createContext: () => ({}),
	});

export { handler as GET, handler as POST };

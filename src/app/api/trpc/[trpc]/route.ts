import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouterJson } from '@/server/api/root-json';

/**
 * Default tRPC endpoint with no transformer (standard JSON)
 * Use this for simple data types that are JSON-serializable
 */
const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: '/api/trpc',
		req,
		router: appRouterJson,
		createContext: () => ({}),
	});

export { handler as GET, handler as POST };

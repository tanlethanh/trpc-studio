import { withIntrospection } from '@trpc-studio/introspection';
import { tSuperjson, superjsonRouter } from './trpc/superjson';
import { superjsonExampleRouter } from './routers/superjson-example';
import { exampleRouter } from './routers/example';
import { complexRouter } from './routers/complex';

/**
 * Main router for SuperJSON transformer endpoint
 * Includes both specific SuperJSON examples and standard routers
 */
const router = superjsonRouter({
	example: exampleRouter,
	complex: complexRouter,
	superjson: superjsonExampleRouter,
});

export const appRouterSuperjson = withIntrospection(tSuperjson, router);

export type AppRouterSuperjson = typeof appRouterSuperjson;

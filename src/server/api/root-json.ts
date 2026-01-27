import { withIntrospection } from '@trpc-studio/introspection';
import { t, createTRPCRouter } from './trpc';
import { jsonExampleRouter } from './routers/json-example';
import { exampleRouter } from './routers/example';
import { complexRouter } from './routers/complex';

/**
 * Main router for JSON (no transformer) endpoint
 * Includes both specific JSON examples and standard routers
 */
const router = createTRPCRouter({
	example: exampleRouter,
	complex: complexRouter,
	json: jsonExampleRouter,
});

export const appRouterJson = withIntrospection(t, router);

export type AppRouterJson = typeof appRouterJson;

import { addIntrospectionEndpoint } from '@trpc-studio/introspection';
import { createTRPCRouter } from './trpc';
import { exampleRouter } from './routers/example';
import { complexRouter } from './routers/complex';

export const appRouter = addIntrospectionEndpoint(
	createTRPCRouter({
		example: exampleRouter,
		complex: complexRouter,
	}),
);

export type AppRouter = typeof appRouter;

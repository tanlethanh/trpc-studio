import { withIntrospection } from '@trpc-studio/introspection';
import { createTRPCRouter, t } from './trpc';
import { exampleRouter } from './routers/example';
import { complexRouter } from './routers/complex';

const router = createTRPCRouter({
	example: exampleRouter,
	complex: complexRouter,
});

export const appRouter = withIntrospection(t, router);

export type AppRouter = typeof appRouter;

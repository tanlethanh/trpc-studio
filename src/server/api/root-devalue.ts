import { withIntrospection } from '@trpc-studio/introspection';
import { tDevalue, devalueRouter } from './trpc/devalue';
import { devalueExampleRouter } from './routers/devalue-example';
import { exampleRouter } from './routers/example';
import { complexRouter } from './routers/complex';

/**
 * Main router for Devalue transformer endpoint
 * Includes both specific Devalue examples and standard routers
 */
const router = devalueRouter({
	example: exampleRouter,
	complex: complexRouter,
	devalue: devalueExampleRouter,
});

export const appRouterDevalue = withIntrospection(tDevalue, router);

export type AppRouterDevalue = typeof appRouterDevalue;

import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

/**
 * tRPC instance with SuperJSON transformer
 * Handles Date, Map, Set, RegExp, BigInt, undefined, and more
 */
export const tSuperjson = initTRPC.create({
	transformer: superjson,
});

export const superjsonRouter = tSuperjson.router;
export const superjsonProcedure = tSuperjson.procedure;

import { initTRPC } from '@trpc/server';

/**
 * Default tRPC instance with no transformer (standard JSON)
 * This is used for the main /api/trpc endpoint
 */
export const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createTRPCRouter = router;

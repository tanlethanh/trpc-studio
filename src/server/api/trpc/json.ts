import { initTRPC } from '@trpc/server';

/**
 * tRPC instance with no transformer (standard JSON)
 * Only handles JSON-serializable types
 */
export const tJson = initTRPC.create();

export const jsonRouter = tJson.router;
export const jsonProcedure = tJson.procedure;

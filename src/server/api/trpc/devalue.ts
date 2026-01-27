import { initTRPC } from '@trpc/server';
import { parse, stringify } from 'devalue';

/**
 * tRPC instance with Devalue transformer
 * Handles circular references and most JavaScript types
 */
export const tDevalue = initTRPC.create({
	transformer: {
		serialize: stringify,
		deserialize: parse,
	},
});

export const devalueRouter = tDevalue.router;
export const devalueProcedure = tDevalue.procedure;

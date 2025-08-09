/* eslint-disable @typescript-eslint/no-explicit-any */
import { initTRPC, AnyTRPCRouter } from '@trpc/server';
import * as z from 'zod';

export interface IntrospectionOptions {
	enabled?: boolean;
	path?: string;
}

export interface ProcedureInfo {
	path: string;
	type: 'query' | 'mutation' | 'subscription';
	inputSchema: unknown;
	outputSchema: unknown;
}

export interface RouterInfo {
	procedures: ProcedureInfo[];
}

function collectProcedures(
	router: AnyTRPCRouter,
	parentPath: string[] = [],
): ProcedureInfo[] {
	const procedures: ProcedureInfo[] = [];
	const proceduresEntries = Object.entries(router._def.procedures ?? {});

	for (const [key, proc] of proceduresEntries) {
		try {
			const schema = extractProcedureSchema(proc);
			procedures.push({
				path: [...parentPath, key].join('.'),
				type: (proc as any)._def.type,
				inputSchema: schema.input ? z.toJSONSchema(schema.input) : null,
				outputSchema: schema.output
					? z.toJSONSchema(schema.output)
					: null,
			});
		} catch {}
	}

	for (const [key, sub] of Object.entries(router._def.record ?? {})) {
		if (isTRPCRouter(sub)) {
			procedures.push(...collectProcedures(sub, [...parentPath, key]));
		}
	}
	return procedures;
}

export function addIntrospectionEndpoint<TRouter extends AnyTRPCRouter>(
	router: TRouter,
	options: IntrospectionOptions = {},
): TRouter {
	const { enabled = true, path = 'introspection' } = options;
	if (!enabled) return router;

	const t = initTRPC.create();
	const procedures = collectProcedures(router);

	const introspectionRouter = t.router({
		[path]: t.procedure.input(z.void()).query(() => ({ procedures })),
	});

	return t.router({ ...router, ...introspectionRouter });
}

function isTRPCRouter(val: unknown): val is AnyTRPCRouter {
	return typeof val === 'object' && val !== null && '_def' in val;
}

function extractProcedureSchema(proc: any) {
	const input =
		typeof proc._def.inputs !== 'undefined' ? proc._def.inputs[0] : null;
	const output =
		typeof proc._def.output !== 'undefined' ? proc._def.output : null;

	return { input, output };
}

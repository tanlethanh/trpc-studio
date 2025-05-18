import { initTRPC, AnyTRPCRouter, AnyTRPCProcedure } from '@trpc/server';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

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

// Helper to recursively collect procedures from a router
function collectProcedures(router: AnyTRPCRouter, parentPath: string[] = []): ProcedureInfo[] {
	const procedures: ProcedureInfo[] = [];

	// Collect procedures
	const proceduresEntries = Object.entries(router._def.procedures ?? {}) as [
		string,
		AnyTRPCProcedure,
	][];
	for (const [key, proc] of proceduresEntries) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const unsafeProc = proc as any;
		const inputSchema =
			typeof unsafeProc._def.inputs !== 'undefined' ? unsafeProc._def.inputs[0] : null;
		const outputSchema =
			typeof unsafeProc._def.output !== 'undefined' ? unsafeProc._def.output : null;
		procedures.push({
			path: [...parentPath, key].join('.'),
			type: proc._def.type,
			inputSchema: inputSchema ? zodToJsonSchema(inputSchema) : null,
			outputSchema: outputSchema ? zodToJsonSchema(outputSchema) : null,
		});
	}

	// Recurse into subrouters
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
		[path]: t.procedure.input(z.void()).query(() => {
			return { procedures } as RouterInfo;
		}),
	});

	// Merge the introspection router into the main router
	return t.router({
		...router,
		...introspectionRouter,
	});
}

function isTRPCRouter(val: unknown): val is AnyTRPCRouter {
	return typeof val === 'object' && val !== null && '_def' in val;
}

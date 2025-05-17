import { initTRPC, type AnyRouter } from '@trpc/server';
import { z } from 'zod';

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
function collectProcedures(router: AnyRouter, parentPath: string[] = []): ProcedureInfo[] {
  const procedures: ProcedureInfo[] = [];
  const def = (router as { _def?: { procedures?: Record<string, unknown>; record?: Record<string, unknown> } })._def;
  if (!def) return procedures;

  // Collect procedures
  for (const [key, proc] of Object.entries(def.procedures ?? {})) {
    const procDef = (proc as { _def?: { mutation?: boolean; subscription?: boolean; inputs?: unknown[]; output?: unknown } })._def;
    procedures.push({
      path: [...parentPath, key].join('.'),
      type: procDef && procDef.mutation ? 'mutation' : procDef && procDef.subscription ? 'subscription' : 'query',
      inputSchema: procDef?.inputs?.[0] ?? null,
      outputSchema: procDef?.output ?? null,
    });
  }
  // Recurse into subrouters
  for (const [key, sub] of Object.entries(def.record ?? {})) {
    if (isTRPCRouter(sub)) {
      procedures.push(...collectProcedures(sub, [...parentPath, key]));
    }
  }
  return procedures;
}

export function addIntrospectionEndpoint<TRouter extends AnyRouter>(
  router: TRouter,
  options: IntrospectionOptions = {}
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

// Helper function to convert Zod schema to JSON Schema
export function zodToJsonSchema(schema: unknown): unknown {
  if (!isZodTypeAny(schema)) return { type: 'unknown' };

  if (schema instanceof z.ZodString) {
    return {
      type: 'string',
      ...(schema._def.checks?.length && {
        format: schema._def.checks[0].kind,
      }),
    };
  }

  if (schema instanceof z.ZodNumber) {
    let minimum: number | undefined;
    let maximum: number | undefined;
    for (const check of schema._def.checks ?? []) {
      if (check.kind === 'min' && typeof check.value === 'number') minimum = check.value;
      if (check.kind === 'max' && typeof check.value === 'number') maximum = check.value;
    }
    return {
      type: 'number',
      ...(minimum !== undefined && { minimum }),
      ...(maximum !== undefined && { maximum }),
    };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema._def.type as z.ZodTypeAny),
    };
  }

  if (schema instanceof z.ZodObject) {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(schema._def.shape())) {
      properties[key] = zodToJsonSchema(value);
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 && { required }),
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema._def.values,
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema._def.innerType as z.ZodTypeAny);
  }

  if (schema instanceof z.ZodNullable) {
    const inner = zodToJsonSchema(schema._def.innerType as z.ZodTypeAny);
    return {
      type: ['null', ...(typeof inner === 'object' && inner !== null && 'type' in inner && Array.isArray((inner as { type?: unknown }).type)
        ? (inner as { type: unknown[] }).type
        : typeof inner === 'object' && inner !== null && 'type' in inner
        ? [(inner as { type: unknown }).type]
        : [])],
    };
  }

  return { type: 'unknown' };
}

function isTRPCRouter(val: unknown): val is AnyRouter {
  return typeof val === 'object' && val !== null && '_def' in val;
}

function isZodTypeAny(val: unknown): val is z.ZodTypeAny {
  return typeof val === 'object' && val !== null && '_def' in val;
} 
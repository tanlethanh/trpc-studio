import { z } from 'zod';
import { devalueRouter, devalueProcedure } from '../trpc/devalue';

/**
 * Example router showcasing Devalue transformer capabilities
 * Devalue handles: circular references, repeated references, most JS types
 */
export const devalueExampleRouter = devalueRouter({
	// Returns data with circular references
	getCircularData: devalueProcedure.query(() => {
		interface Node {
			id: string;
			parent?: Node;
			children: Node[];
		}

		const root: Node = {
			id: 'root',
			children: [],
		};

		const child1: Node = {
			id: 'child1',
			parent: root,
			children: [],
		};

		const child2: Node = {
			id: 'child2',
			parent: root,
			children: [],
		};

		root.children.push(child1, child2);

		return {
			tree: root,
			message: 'This tree structure contains circular references',
		};
	}),

	// Returns data with repeated references (same object multiple times)
	getRepeatedReferences: devalueProcedure.query(() => {
		const config = { theme: 'dark', locale: 'en' };

		return {
			userPreferences: config,
			defaultSettings: config, // Same reference
			adminSettings: config, // Same reference again
		};
	}),

	// Returns complex nested data
	getComplexData: devalueProcedure.query(() => {
		return {
			date: new Date(),
			map: new Map([
				['key1', 'value1'],
				['key2', 'value2'],
			]),
			set: new Set([1, 2, 3]),
			regex: /test/gi,
			undefined: undefined,
			null: null,
			array: [1, 2, 3],
			nested: {
				deep: {
					deeper: {
						value: 'nested value',
					},
				},
			},
		};
	}),

	// Mutation with complex input
	saveGraph: devalueProcedure
		.input(
			z.object({
				name: z.string(),
				nodes: z.array(z.any()),
			}),
		)
		.mutation(({ input }) => {
			return {
				id: Math.random().toString(36).substr(2, 9),
				name: input.name,
				nodeCount: input.nodes.length,
				savedAt: new Date(),
			};
		}),
});

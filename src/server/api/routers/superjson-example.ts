import { z } from 'zod';
import { superjsonRouter, superjsonProcedure } from '../trpc/superjson';

/**
 * Example router showcasing SuperJSON transformer capabilities
 * SuperJSON handles: Date, Map, Set, RegExp, BigInt, undefined, NaN, Infinity
 */
export const superjsonExampleRouter = superjsonRouter({
	// Returns data with Date objects
	getCurrentTime: superjsonProcedure.query(() => {
		return {
			now: new Date(),
			future: new Date(Date.now() + 86400000), // Tomorrow
			past: new Date('2020-01-01'),
		};
	}),

	// Returns data with Map and Set
	getCollections: superjsonProcedure.query(() => {
		const userMap = new Map([
			['user1', { name: 'Alice', age: 30 }],
			['user2', { name: 'Bob', age: 25 }],
		]);

		const tagsSet = new Set(['typescript', 'react', 'trpc']);

		return {
			users: userMap,
			tags: tagsSet,
		};
	}),

	// Returns data with special numeric values
	getSpecialNumbers: superjsonProcedure.query(() => {
		return {
			infinity: Infinity,
			negativeInfinity: -Infinity,
			notANumber: NaN,
			bigInt: 9007199254740991n,
			regularNumber: 42,
		};
	}),

	// Returns data with RegExp and undefined
	getPattern: superjsonProcedure.query(() => {
		return {
			emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
			optionalField: undefined,
			requiredField: 'value',
		};
	}),

	// Mutation that accepts Date input
	scheduleEvent: superjsonProcedure
		.input(
			z.object({
				title: z.string(),
				scheduledAt: z.date(),
			}),
		)
		.mutation(({ input }) => {
			return {
				id: Math.random().toString(36).substr(2, 9),
				title: input.title,
				scheduledAt: input.scheduledAt,
				createdAt: new Date(),
			};
		}),
});

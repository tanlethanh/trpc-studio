import { z } from 'zod';
import { jsonRouter, jsonProcedure } from '../trpc/json';

/**
 * Example router with no transformer (standard JSON)
 * Only handles JSON-serializable types: string, number, boolean, null, array, object
 */
export const jsonExampleRouter = jsonRouter({
	// Returns simple JSON data
	getUser: jsonProcedure.query(() => {
		return {
			id: '123',
			name: 'John Doe',
			email: 'john@example.com',
			age: 30,
			isActive: true,
		};
	}),

	// Returns array of objects
	getUsers: jsonProcedure.query(() => {
		return [
			{ id: '1', name: 'Alice', email: 'alice@example.com' },
			{ id: '2', name: 'Bob', email: 'bob@example.com' },
			{ id: '3', name: 'Charlie', email: 'charlie@example.com' },
		];
	}),

	// Returns nested JSON structure
	getConfig: jsonProcedure.query(() => {
		return {
			app: {
				name: 'My App',
				version: '1.0.0',
				features: {
					auth: true,
					payments: false,
					analytics: true,
				},
			},
			api: {
				baseUrl: 'https://api.example.com',
				timeout: 5000,
				retries: 3,
			},
		};
	}),

	// Simple mutation
	createUser: jsonProcedure
		.input(
			z.object({
				name: z.string(),
				email: z.string().email(),
			}),
		)
		.mutation(({ input }) => {
			return {
				id: Math.random().toString(36).substr(2, 9),
				name: input.name,
				email: input.email,
				createdAt: new Date().toISOString(), // Convert Date to string for JSON
			};
		}),
});

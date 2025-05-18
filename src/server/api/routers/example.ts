import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

// Complex input schemas
const UserSchema = z.object({
	id: z.string().default(() => Math.random().toString(36).substring(7)),
	name: z.string(),
	email: z.string().email(),
	age: z.number().min(0).max(120).default(18),
	address: z
		.object({
			street: z.string(),
			city: z.string(),
			country: z.string().default('USA'),
			zipCode: z.string(),
		})
		.optional(),
	tags: z.array(z.string()).default([]),
	metadata: z.record(z.unknown()).optional().default({}),
});

const PaginationSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10),
	sortBy: z.enum(['name', 'age', 'createdAt']).default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const SearchSchema = z.object({
	query: z.string().default(''),
	filters: z
		.object({
			ageRange: z
				.object({
					min: z.number().optional().default(0),
					max: z.number().optional().default(120),
				})
				.optional()
				.default({}),
			tags: z.array(z.string()).optional().default([]),
			hasAddress: z.boolean().optional().default(false),
		})
		.optional()
		.default({}),
	pagination: PaginationSchema.optional().default({}),
});

type User = z.infer<typeof UserSchema>;

// Example data
const users: User[] = [
	{
		id: '1',
		name: 'John Doe',
		email: 'john@example.com',
		age: 30,
		address: {
			street: '123 Main St',
			city: 'New York',
			country: 'USA',
			zipCode: '10001',
		},
		tags: ['developer', 'typescript'],
		metadata: {
			lastLogin: '2024-03-15T10:00:00Z',
			preferences: {
				theme: 'dark',
				notifications: true,
			},
		},
	},
	{
		id: '2',
		name: 'Jane Smith',
		email: 'jane@example.com',
		age: 25,
		tags: ['designer', 'ui'],
		metadata: {
			lastLogin: '2024-03-14T15:30:00Z',
		},
	},
];

export const exampleRouter = createTRPCRouter({
	// Basic query with simple input/output
	hello: publicProcedure
		.input(z.string())
		.output(z.string())
		.query(({ input }) => {
			return `Hello ${input}!`;
		}),

	// Query with complex input schema and pagination
	getUsers: publicProcedure
		.input(SearchSchema)
		.output(
			z.object({
				users: z.array(UserSchema),
				total: z.number(),
				page: z.number(),
				limit: z.number(),
				totalPages: z.number(),
			}),
		)
		.query(({ input }) => {
			const { query, filters, pagination } = input;
			const {
				page = 1,
				limit = 10,
				sortBy = 'createdAt',
				sortOrder = 'desc',
			} = pagination || {};

			// Filter users based on search query and filters
			const filteredUsers = users.filter(user => {
				const matchesQuery =
					user.name.toLowerCase().includes(query.toLowerCase()) ||
					user.email.toLowerCase().includes(query.toLowerCase());

				if (!matchesQuery) return false;

				if (filters) {
					if (filters.ageRange) {
						if (filters.ageRange.min && user.age < filters.ageRange.min) return false;
						if (filters.ageRange.max && user.age > filters.ageRange.max) return false;
					}
					if (filters.tags && filters.tags.length > 0) {
						if (!filters.tags.some((tag: string) => user.tags.includes(tag)))
							return false;
					}
					if (filters.hasAddress !== undefined) {
						if (filters.hasAddress && !user.address) return false;
						if (!filters.hasAddress && user.address) return false;
					}
				}

				return true;
			});

			// Sort users
			filteredUsers.sort((a, b) => {
				const aValue = a[sortBy as keyof User];
				const bValue = b[sortBy as keyof User];
				if (aValue === undefined || bValue === undefined) return 0;
				return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
			});

			// Apply pagination
			const start = (page - 1) * limit;
			const paginatedUsers = filteredUsers.slice(start, start + limit);

			return {
				users: paginatedUsers,
				total: filteredUsers.length,
				page,
				limit,
				totalPages: Math.ceil(filteredUsers.length / limit),
			};
		}),

	// Mutation with complex input validation
	createUser: publicProcedure
		.input(UserSchema)
		.output(
			z.object({
				success: z.boolean(),
				user: UserSchema,
				message: z.string(),
			}),
		)
		.mutation(({ input }) => {
			// In a real app, you would save to a database
			return {
				success: true,
				user: input,
				message: 'User created successfully',
			};
		}),

	// Query with error handling
	getUserById: publicProcedure
		.input(z.string())
		.output(UserSchema)
		.query(({ input }) => {
			const user = users.find(u => u.id === input);
			if (!user) {
				throw new Error(`User with ID ${input} not found`);
			}
			return user;
		}),

	// Query with async operation and timeout
	slowOperation: publicProcedure
		.input(
			z.object({
				delay: z.number().min(0).max(5000),
				shouldFail: z.boolean().optional(),
			}),
		)
		.output(
			z.object({
				message: z.string(),
				timestamp: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const { delay, shouldFail } = input;

			await new Promise(resolve => setTimeout(resolve, delay));

			if (shouldFail) {
				throw new Error('Operation failed as requested');
			}

			return {
				message: `Operation completed after ${delay}ms`,
				timestamp: new Date().toISOString(),
			};
		}),

	// Query with nested data transformation
	getUserStats: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				includeMetadata: z.boolean().optional(),
			}),
		)
		.output(
			z.object({
				basic: z.object({
					name: z.string(),
					email: z.string(),
					age: z.number(),
				}),
			}),
		)
		.query(({ input }) => {
			const user = users.find(u => u.id === input.userId);
			if (!user) {
				throw new Error(`User with ID ${input.userId} not found`);
			}

			const stats = {
				basic: {
					name: user.name,
					email: user.email,
					age: user.age,
				},
				address: user.address
					? {
							city: user.address.city,
							country: user.address.country,
						}
					: null,
				tags: user.tags,
				tagCount: user.tags.length,
			};

			if (input.includeMetadata && user.metadata) {
				return {
					...stats,
					metadata: user.metadata,
				};
			}

			return stats;
		}),
});

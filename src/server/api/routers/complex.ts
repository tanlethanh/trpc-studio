import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { observable } from '@trpc/server/observable';
import type { Observer } from '@trpc/server/observable';

// Complex schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categories: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
});

const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  products: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
    zipCode: z.string(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['order_status', 'stock_alert', 'price_change']),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.string().datetime(),
});

// Example data
const products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop',
    price: 999.99,
    stock: 50,
    categories: ['electronics', 'computers'],
    metadata: {
      brand: 'TechCo',
      warranty: '2 years',
    },
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model smartphone',
    price: 699.99,
    stock: 100,
    categories: ['electronics', 'phones'],
    metadata: {
      brand: 'PhoneCo',
      warranty: '1 year',
    },
  },
];

const orders: z.infer<typeof OrderSchema>[] = [];
const notifications: z.infer<typeof NotificationSchema>[] = [];

export const complexRouter = createTRPCRouter({
  // Complex query with filtering and sorting
  getProducts: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      categories: z.array(z.string()).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      inStock: z.boolean().optional(),
      sortBy: z.enum(['name', 'price', 'stock']).default('name'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }))
    .output(z.array(ProductSchema))
    .query(({ input }) => {
      let filtered = [...products];

      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }

      if (input.categories?.length) {
        filtered = filtered.filter(p => 
          p.categories.some(cat => input.categories!.includes(cat))
        );
      }

      if (input.minPrice !== undefined) {
        filtered = filtered.filter(p => p.price >= input.minPrice!);
      }

      if (input.maxPrice !== undefined) {
        filtered = filtered.filter(p => p.price <= input.maxPrice!);
      }

      if (input.inStock !== undefined) {
        filtered = filtered.filter(p => 
          input.inStock ? p.stock > 0 : p.stock === 0
        );
      }

      filtered.sort((a, b) => {
        const aValue = a[input.sortBy];
        const bValue = b[input.sortBy];
        return input.sortOrder === 'asc'
          ? aValue > bValue ? 1 : -1
          : aValue < bValue ? 1 : -1;
      });

      return filtered;
    }),

  // Mutation with validation and side effects
  createOrder: publicProcedure
    .input(z.object({
      userId: z.string(),
      products: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })),
      shippingAddress: z.object({
        street: z.string(),
        city: z.string(),
        country: z.string(),
        zipCode: z.string(),
      }),
    }))
    .output(OrderSchema)
    .mutation(({ input }) => {
      // Validate products exist and have enough stock
      for (const item of input.products) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${item.productId}`);
        }
      }

      // Create order
      const order: z.infer<typeof OrderSchema> = {
        id: Math.random().toString(36).substring(7),
        userId: input.userId,
        products: input.products,
        status: 'pending',
        shippingAddress: input.shippingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update stock
      for (const item of input.products) {
        const product = products.find(p => p.id === item.productId)!;
        product.stock -= item.quantity;
      }

      orders.push(order);

      // Create notification
      const notification: z.infer<typeof NotificationSchema> = {
        id: Math.random().toString(36).substring(7),
        type: 'order_status',
        message: `Order ${order.id} has been created`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.push(notification);

      return order;
    }),

  // Subscription for real-time updates
  subscribeToNotifications: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .subscription(({ input }) => {
      return observable<{ notification: z.infer<typeof NotificationSchema> }>((emit: Observer<{ notification: z.infer<typeof NotificationSchema> }, unknown>) => {
        const queue: z.infer<typeof NotificationSchema>[] = [];
        let isRunning = true;

        // Initial notifications
        const userNotifications = notifications.filter(n => !n.read);
        queue.push(...userNotifications);

        // Simulate new notifications
        const interval = setInterval(() => {
          if (Math.random() > 0.7) {
            const newNotification: z.infer<typeof NotificationSchema> = {
              id: Math.random().toString(36).substring(7),
              type: ['order_status', 'stock_alert', 'price_change'][Math.floor(Math.random() * 3)] as any,
              message: `New notification for user ${input.userId}`,
              read: false,
              createdAt: new Date().toISOString(),
            };
            notifications.push(newNotification);
            queue.push(newNotification);
          }
        }, 5000);

        // Process queue
        const processQueue = () => {
          if (!isRunning) return;
          if (queue.length > 0) {
            const notification = queue.shift()!;
            emit.next({ notification });
          }
          setTimeout(processQueue, 100);
        };
        processQueue();

        return () => {
          isRunning = false;
          clearInterval(interval);
        };
      });
    }),

  // Complex query with data aggregation
  getOrderAnalytics: publicProcedure
    .input(z.object({
      userId: z.string(),
      timeRange: z.object({
        start: z.string().datetime(),
        end: z.string().datetime(),
      }),
    }))
    .output(z.object({
      totalOrders: z.number(),
      totalSpent: z.number(),
      statusBreakdown: z.record(z.number()),
      popularProducts: z.array(z.object({
        product: z.object({
          id: z.string(),
          name: z.string(),
          price: z.number(),
          stock: z.number(),
          categories: z.array(z.string()),
          metadata: z.record(z.unknown()).optional(),
        }),
        quantity: z.number(),
      })),
    }))
    .query(({ input }) => {
      const userOrders = orders.filter(order => 
        order.userId === input.userId &&
        new Date(order.createdAt) >= new Date(input.timeRange.start) &&
        new Date(order.createdAt) <= new Date(input.timeRange.end)
      );

      const totalSpent = userOrders.reduce((sum, order) => {
        const orderTotal = order.products.reduce((orderSum, item) => {
          const product = products.find(p => p.id === item.productId);
          return orderSum + (product?.price ?? 0) * item.quantity;
        }, 0);
        return sum + orderTotal;
      }, 0);

      const statusCounts = userOrders.reduce((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      const popularProducts = userOrders.reduce((productCounts, order) => {
        order.products.forEach(item => {
          productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
        });
        return productCounts;
      }, {} as Record<string, number>);

      return {
        totalOrders: userOrders.length,
        totalSpent,
        statusBreakdown: statusCounts,
        popularProducts: Object.entries(popularProducts)
          .map(([productId, count]) => {
            const product = products.find(p => p.id === productId);
            if (!product) return null;
            return {
              quantity: count,
              product: {
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                categories: product.categories,
                metadata: product.metadata
              }
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5),
      };
    }),
}); 
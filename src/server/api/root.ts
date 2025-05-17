import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { complexRouter } from "./routers/complex";
import { addIntrospectionEndpoint } from "@trpc-playground/introspection";

export const appRouter = addIntrospectionEndpoint(
  createTRPCRouter({
    example: exampleRouter,
    complex: complexRouter,
  })
);

export type AppRouter = typeof appRouter; 
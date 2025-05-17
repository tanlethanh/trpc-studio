import { type AppRouter } from "@/server/api/root";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export type ProcedurePath = keyof AppRouter["_def"]["procedures"];
export type ProcedureInput<T extends ProcedurePath> = RouterInput[T];
export type ProcedureOutput<T extends ProcedurePath> = RouterOutput[T];

export function getProcedurePaths(): string[] {
  // This will be populated with actual procedure paths from your router
  return ["hello"];
}

export function getProcedureInputSchema(procedure: ProcedurePath): string {
  // This will be populated with actual input schemas from your router
  return JSON.stringify({
    type: "object",
    properties: {
      input: {
        type: "string",
        description: "The input string for the hello procedure"
      }
    },
    required: ["input"]
  }, null, 2);
}

export function getProcedureOutputSchema(procedure: ProcedurePath): string {
  // This will be populated with actual output schemas from your router
  return JSON.stringify({
    type: "string",
    description: "The greeting message"
  }, null, 2);
} 
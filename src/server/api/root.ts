import { postRouter } from "@/server/api/routers/post";  // Import the post router
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";  // Import the necessary functions
import { projectRouter } from "./routers/project";
  // Import the project router

/**
 * This is the primary router for your server.
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,  // Add postRouter to the appRouter
  project: projectRouter,  // Add projectRouter to the appRouter
});

// Export type definition of the API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * Example usage:
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]  // Example query for fetching posts
 */
export const createCaller = createCallerFactory(appRouter);

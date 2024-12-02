import { createTRPCRouter } from "../trpc";
import { protectedProcedure } from "../trpc";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  // Create a project
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        gitHubUrl: z.string().url(), // Validate URL format
        gitHubToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.project.create({
          data: {
            name: input.name,
            gitHubUrl: input.gitHubUrl,
            gitHubToken: input.gitHubToken || null, // Optional field
            userToProjects: {
              create: {
                userId: ctx.user.userId, // Ensure ctx.user.userId is valid
              },
            },
          },
        });
        return project;
      } catch (error) {
        console.error("Error creating project: ", error);
        throw new Error("Failed to create project.");
      }
    }),

  // Fetch projects for the current user
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: {
              userId: ctx.user.userId!,
            },
          },
          deletedAt: null, // Ensure deleted projects are excluded
        },
      });
    } catch (error) {
      console.error("Error fetching projects: ", error);
      throw new Error("Failed to fetch projects.");
    }
  }),
});

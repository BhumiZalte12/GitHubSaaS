import { createTRPCRouter } from "../trpc";
import { protectedProcedure } from "../trpc";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        gitHubUrl: z.string(),
        gitHubToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Received input:", input);

        // Assuming you might want to store the project data
        // const newProject = await ctx.db.project.create({
        //   data: {
        //     name: input.name,
        //     gitHubUrl: input.gitHubUrl,
        //     gitHubToken: input.gitHubToken || null, // Optional field
        //   },
        // });

        // Log the successful creation
        console.log("Project created successfully:", input.name);

        // Return a success message or the created project
        return {
          success: true,
          message: `Project ${input.name} created successfully.`,
        };
      } catch (error) {
        // Handle any errors that occur during the mutation
        console.error("Error creating project:", error);
        throw new Error("Failed to create project.");
      }
    }),
});

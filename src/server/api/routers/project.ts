import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { pollCommits } from "@/lib/github";

export const projectRouter = createTRPCRouter({
  // Create Project
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Project name is required"),
        gitHubUrl: z.string().url("Invalid GitHub URL"),
        gitHubToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.project.create({
          data: {
            name: input.name,
            gitHubUrl: input.gitHubUrl,
            gitHubToken: input.gitHubToken || null,
            userToProjects: {
              create: {
                userId: ctx.user.userId!,
              },
            },
          },
        });
        await pollCommits(project.id)
        return project;
      } catch (error) {
        console.error("Error creating project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project",
        });
      }
    }),

  // Get Projects
  getProjects: protectedProcedure.query(async ({ ctx }) => {
   
      return await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: {
              userId: ctx.user.userId,
            },
          },
        
       
         
        }
      });
    
    
    
  }),

  // Get Commits
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.commit.findMany({
          where: {
            projectId: input.projectId
          },
        });
      } catch (error) {
        console.error("Error fetching commits:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch commits",
        });
      }
    }),
});


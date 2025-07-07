import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";

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
      const user = await ctx.db.user.findUnique({
        where : { id : ctx.user.userId!},select: { credits : true}
      })
      if(!user){
        throw new Error("User not found")
      }
      const currentCredits = user.credits || 0
      const fileCount = await checkCredits(input.gitHubUrl,input.gitHubToken)

      if(currentCredits < fileCount){
        throw new Error("Not enough credits")
      }
      try {
        const project = await ctx.db.project.create({
          data: {
            
            gitHubUrl: input.gitHubUrl,
            name: input.name,
            
            userToProjects: {
              create: {
                userId: ctx.user.userId!,
              },
            },
          },
          
        });

        // Awaiting the index and commit polling processes to complete before returning
        await indexGithubRepo(project.id, input.gitHubUrl, input.gitHubToken);
        await pollCommits(project.id); // Make sure pollCommits is an async function
await ctx.db.user.update({
  where : {
    id : ctx.user.userId!},
    data : { credits : {decrement:fileCount}}
  }) 
  
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
    try {
      return await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: {
              userId: ctx.user.userId!,
            },
          },
          deletedAt: null, // Make sure we only fetch active projects
        },
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch projects",
      });
    }
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
        pollCommits(input.projectId).then().catch(console.error);
        return await ctx.db.commit.findMany({
          where: {
            projectId: input.projectId,
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

    saveAnswer: protectedProcedure.input(z.object({
      projectId:z.string(),
      question:z.string(),
      answer:z.string(),
      filesReferences:z.any()
    })).mutation(async({ctx,input}) =>{
    return await ctx.db.question.create({
      data: {
        answer: input.answer,
        projectId: input.projectId,
        question: input.question,
        filesReferences: input.filesReferences,
        userId:ctx.user.userId!
      }
    })
  }),
  getQuestions: protectedProcedure.input(z.object({projectId:z.string()})).query(async({
    ctx,
    input
  }) =>
  {
    return await ctx.db.question.findMany({where:{projectId:input.projectId},
      include:{
        user:true
      },
      orderBy:{
        createdAt: "desc"
      }
    
    
    })
  }),

  uploadMeeting: protectedProcedure.input(z.object({projectId: z.string(),meetingUrl:z.string(),name:z.string()}))
  .mutation(async({ctx,input}) => {
   const meeting = await ctx.db.meeting.create({
    data : {
      meetingUrl : input.meetingUrl,
      projectId : input.projectId,
      name : input.name,
      status : "PROCESSING"
    }
   })
   return meeting
  }),
  getMeetings: protectedProcedure.input(z.object({projectId: z.string()})).query(async({ctx,input}) => 
  {
    return await ctx.db.meeting.findMany({where:{projectId:input.projectId},
    
  })
}),
deleteMeeting: protectedProcedure.input(z.object({meetingId : z.string()})).mutation(async({ctx,input}) => {
return await ctx.db.meeting.delete({where : {id : input.meetingId}})
}),
getMeetingById: protectedProcedure.input(z.object({meetingId: z.string() })).query(async({
  ctx,input}) =>
  {
    return await ctx.db.meeting.findMany({
      where:{
        id:input.meetingId
      },
      include : {
        issues: true
      }
    })
  }
),
archiveProject: protectedProcedure.input(z.object({projectId : z.string()})).mutation(async({ctx,input}) => {
  return await ctx.db.project.update({where : {id : input.projectId},
  data:{
    deletedAt: new Date() 
  }})
  }),

  getTeamMembers:protectedProcedure.input(z.object({projectId : z.string()})).query(async({ctx,input}) => {
    return await ctx.db.userToProjects.findMany({where : {projectId : input.projectId},include:{user : true}
})
}),
getMyCredits: protectedProcedure.query(async({ctx}) =>
 {
  return await ctx.db.user.findUnique({
    where : {
      id : ctx.user.userId!
    },
    select : {
      credits : true
    }
  })
 }),
 checkCredits: protectedProcedure.input(z.object({gitHubUrl: z.string(),gitHubToken : z.string().optional()})).mutation(async({ctx,input}) =>
 {
  const fileCount =  await checkCredits(input.gitHubUrl,input.gitHubToken)
  const userCredits = await ctx.db.user.findUnique({
    where : {
      id : ctx.user.userId!
    },
    select : {
      credits : true
    }
  })
  return { fileCount, userCredits: userCredits?.credits || 0}

 })

})



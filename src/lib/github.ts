import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../server/db";


import { Octokit } from "octokit";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

// Initialize Octokit instance
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
const gitHubUrl = "https://github.com/BhumiZalte12/GitHubSaaS"
// Define the structure of the commit response
type Response = {
  commitMessage: string;
  commitHash: string;
 
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// Get commit details from GitHub repository
export const getCommitHashes = async (gitHubUrl: string): Promise<Response[]> => {
  const [owner, repo] = gitHubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  // Sort commits by date in descending order
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
  ) as any[]

  // Map to required structure and return top 10 commits
  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    //commitAuthor: commit.commit?.author?.name ?? "",
    commitAuthorName: commit.author?.login ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  
  }));
};

// Poll commits for a project
export const pollCommits = async (projectId: string) => {
 const { project ,gitHubUrl } = await fetchProjectGithubUrl(projectId)

    
    const commitHashes = await getCommitHashes(gitHubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

    const summaryResponses = await Promise.allSettled(
      unprocessedCommits.map((commit) => {
        return summariseCommit(gitHubUrl, commit.commitHash)
      }))


    const summaries = summaryResponses.map((response) =>{
     if(response.status === "fulfilled" ){return response.value as string}
     return " "
    })
    const commits = await db.commit.createMany({
      data: summaries.map((summary, index) => {
        return{
        projectId : projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary,
      
        }})})

    return commits;
  } 


// Summarize commits
async function summariseCommit(gitHubUrl: string, commitHash: string) {
 
    const { data } = await axios.get(`${gitHubUrl}/commit/${commitHash}.diff`, {
      headers: {
        Accept: "application/vnd.github.v3.diff",
      },
    });

    return await aiSummariseCommit(data as string);
  } 


// Fetch the GitHub URL of a project from the database
async function fetchProjectGithubUrl(projectId: string){
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      gitHubUrl: true,
    },
  });

  if (!project?.gitHubUrl) {
    throw new Error("Project has no GitHub URL");
  }

  return { project , gitHubUrl: project.gitHubUrl} 
}

// Filter unprocessed commits
async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  })

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash
      ))
      return unprocessedCommits
  
  
}

// Test the function
pollCommits("cm4bt1k8g0000ar5zngvnvyt4")



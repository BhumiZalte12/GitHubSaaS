import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aisummariseCommits } from "./gemini";

// Initialize Octokit instance
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
const gitHubUrl = "https://github.com/BhumiZalte12/GitHubSaaS"
// Define the structure of the commit response
type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthor: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// Get commit details from GitHub repository
export const getCommitDetails = async (gitHubUrl: string): Promise<Response[]> => {
    //https://github.com/BhumiZalte12/GitHubSaaS
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
  );

  // Map to required structure and return top 10 commits
  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit?.message ?? "",
    commitAuthor: commit.commit?.author?.name ?? "",
    commitAuthorName: commit.author?.login ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

// Poll commits for a project
export const pollCommits = async (projectId: string) => {
  try {
    const gitHubUrl = await fetchProjectGithubUrl(projectId);
    const commitDetails = await getCommitDetails(gitHubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

    const summaryResponses = await Promise.allSettled(
      unprocessedCommits.map((commit) => summariseCommit(gitHubUrl, commit.commitHash))
    );

    const summaries = summaryResponses.map((response, index) =>
      response.status === "fulfilled" ? (response.value as string) : `Error for commit ${unprocessedCommits[index]?.commitHash}`
    );

    const commits = await db.commit.createMany({
      data: summaries.map((summary, index) => ({
        projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthor: unprocessedCommits[index]!.commitAuthor,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary,
      })),
    });

    return commits;
  } catch (error) {
    console.error("Error polling commits:", error);
    throw error;
  }
};

// Summarize commits
async function summariseCommit(gitHubUrl: string, commitHash: string) {
  try {
    const { data } = await axios.get(`${gitHubUrl}/commits/${commitHash}.diff`, {
      headers: {
        Accept: "application/vnd.github.v3.diff",
      },
    });

    return await aisummariseCommits(data as string);
  } catch (error) {
    console.error("Error summarizing commit:", error);
    return "Error summarizing commit";
  }
}

// Fetch the GitHub URL of a project from the database
async function fetchProjectGithubUrl(projectId: string): Promise<string> {
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

  return project.gitHubUrl;
}

// Filter unprocessed commits
async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
  });

  return commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash
      )
  );
}

// Test the function
pollCommits("cm49qdu5y00005jbqzl7mz840").then(console.log).catch(console.error);

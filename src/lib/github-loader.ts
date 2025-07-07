import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { summariseCode } from './gemini';
import { generateEmbedding } from './gemini';
import { db } from "../server/db";
import { Octokit } from 'octokit';
import { SourceCode } from 'eslint';



const getFileCount = async (path: string , octokit: Octokit,gitHubOwner : string,GithubRepo : string,acc: number=0)=>
  {
    const {data} = await octokit.rest.repos.getContent({
      owner : gitHubOwner,
      repo : GithubRepo,
      path 
    })
  if(!Array.isArray(data) && data.type === 'file'){
    return acc + 1
  }
  
    if(!Array.isArray(data)){
     let fileCount = 0
     const directories: string[] = []
  
     for(const item of data){
      if(item.type==='dir'){
        directories.push(item.path)
      }else{
        fileCount++
      }
     }
     if(directories.length > 0){
      const directoryCounts = await Promise.all(directories.map(dirPath => getFileCount(dirPath,octokit,gitHubOwner,GithubRepo,0)))
      fileCount += directoryCounts.reduce((acc,count) => acc + count,0)
     }
     return acc + fileCount
    }
    return acc
  }
  export const checkCredits = async (gitHubUrl: string,gitHubToken?:string) =>
  {
    const octokit = new Octokit({ auth: gitHubToken });
  
    const gitHubOwner = gitHubUrl.split('/')[3]
    const GithubRepo = gitHubUrl.split('/')[4]
    if(!gitHubOwner || !GithubRepo){
      return 0 
    }
    const fileCount = await getFileCount('',octokit,gitHubOwner,GithubRepo,0)
    return fileCount
    
  }
// Load GitHub repository
export const loadGithubRepo = async (githubUrl: string, gitHubToken?: string) => {
  try {
    console.log("Loading GitHub repository from URL:", githubUrl);
    console.log("GitHub Token provided:", !!gitHubToken);

    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: gitHubToken || '',
      branch: 'main',
      ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
      recursive: true,
      unknown: 'warn',
      maxConcurrency: 5,
    });

    const docs = await loader.load();
    console.log("Repository successfully loaded with document count:", docs?.length || 0);

    if (!docs || docs.length === 0) {
      throw new Error("No documents found in the GitHub repository.");
    }

    return docs;
  } catch (error: any) {
    console.error("Error loading GitHub repository:", error.message);
    if (error.response) {
      console.error("HTTP Status Code:", error.response.status);
      console.error("Response Data:", error.response.data);
    }
    throw new Error(`Failed to load GitHub repository: ${error.message}`);
  }
};

// Index GitHub repository and store embeddings
export const indexGithubRepo = async (projectId: string, gitHubUrl: string, gitHubToken?: string) => {
  try {
    const docs = await loadGithubRepo(gitHubUrl, gitHubToken);
    const allEmbeddings = await generateEmbeddings(docs);

    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
      console.log(`Processing ${index + 1} of ${allEmbeddings.length}`);
      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        }
      });

      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}`;
    }));
  } catch (error: any) {
    console.error("Error indexing GitHub repository:", error.message);
    throw new Error(`Failed to index GitHub repository: ${error.message}`);
  }
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(docs.map(async doc => {
    const summary = await summariseCode(doc);
    const embedding = await generateEmbedding(summary);
    return {
      summary,
      embedding,
      sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
      fileName: doc.metadata.source,
    };
  }));
};

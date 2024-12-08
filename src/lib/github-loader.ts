import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { summariseCode } from './gemini';
import { generateEmbedding } from './gemini';
import { db } from "../server/db";
import { doc } from 'prettier';

// Load GitHub repository


export const loadGithubRepo = async (githubUrl: string, gitHubToken?: string) => {
  try {
    // Log the GitHub URL and token presence for debugging
    console.log("Loading GitHub repository from URL:", githubUrl);
    console.log("GitHub Token provided:", !!gitHubToken);

    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: gitHubToken || undefined,
      branch: 'main',
      ignoreFiles: ['yarn.lock', 'pnpm-lock.yaml'],
      recursive: true,
      unknown: 'warn',
      maxConcurrency: 5,
    });

    // Load repository documents
    const docs = await loader.load();
    console.log("Repository successfully loaded with document count:", docs?.length || 0);

    return docs;
  } catch (error: any) {
    // Detailed error logging
    console.log("GitHub URL:", githubUrl);
    console.log("GitHub Token used:", gitHubToken ? "Yes" : "No");
    console.error("Error loading GitHub repository:", error.message);
    console.error("Stack trace:", error.stack);

    // Add specific error handling if needed
    if (error.response) {
      console.error("HTTP Status Code:", error.response.status);
      console.error("Response Data:", error.response.data);
    }

    // Throw a descriptive error
    throw new Error(`Failed to load GitHub repository: ${error.message}`);
  }
};


// Index GitHub repository and store embeddings
export const indexGithubRepo = async (projectId: string, gitHubUrl: string, gitHubToken?: string) => {
  try {
    const docs = await loadGithubRepo(gitHubUrl, gitHubToken);
    const allEmbeddings = await generateEmbeddings(docs);

    // Using Promise.allSettled for concurrent processing
    await Promise.allSettled(
        allEmbeddings.map(async (embedding, index) => {
          if (!embedding) return;
          try {
            const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
              data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId,
              },
            });
      
            await db.$executeRaw(`
              UPDATE "SourceCodeEmbedding"
              SET "summaryEmbedding" = $1::vector
              WHERE "id" = $2
            `, [embedding.embedding, sourceCodeEmbedding.id]);
          } catch (err) {
            console.error(`Error saving embedding for index ${index}:`, err);
          }
        })
      );
      
  } catch (error) {
    console.error("Error indexing GitHub repository:", error);
    throw new Error("Failed to index GitHub repository");
  }
};

// Generate embeddings for the documents
const generateEmbeddings = async (docs: Document[]) => {
    try {
      return await Promise.all(
        docs.map(async doc => {
          try {
            const summary = await summariseCode(doc);
            const embedding = await generateEmbedding(summary);
  
            return {
              summary,
              embedding,
              sourceCode: JSON.stringify(doc.pageContent),
              fileName: doc.metadata.source,
            };
          } catch (error) {
            console.error("Error generating embedding for document:", error);
            return null;
          }
        })
      );
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error("Failed to generate embeddings");
    }
  };
  
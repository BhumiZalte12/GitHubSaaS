import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { summariseCode } from './gemini';
import { generateEmbedding } from './gemini';
import { db } from "../server/db";

// Helper function to validate the payload
const validatePayload = (payload: any, index: number) => {
  if (!payload || typeof payload !== "object") {
    console.error(`Invalid payload for document at index ${index}:`, payload);
    return false;
  }
  return true;
};

// Load GitHub repository
export const loadGithubRepo = async (githubUrl: string, gitHubToken?: string) => {
  try {
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

    const allEmbeddings = await generateEmbeddings(docs, projectId);

    const results = await Promise.allSettled(
      allEmbeddings.map(async (embedding, index) => {
        if (!embedding) {
          console.warn(`Skipping empty embedding for document at index ${index}`);
          return;
        }

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

          console.log(`Successfully saved embedding for document: ${embedding.fileName}`);
        } catch (err) {
          console.error(`Error saving embedding for document at index ${index}:`, err);
        }
      })
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Error processing document at index ${index}:`, result.reason);
      }
    });

  } catch (error) {
    console.error("Error indexing GitHub repository:", error);
    throw new Error("Failed to index GitHub repository");
  }
};

// Generate embeddings for the documents
const generateEmbeddings = async (docs: Document[], projectId: string) => {
  try {
    return await Promise.all(
      docs.map(async (doc, index) => {
        // Validate payload (document)
        if (!validatePayload(doc, index)) {
          return null; // Skip invalid payloads
        }

        try {
          console.log(`Processing document at index ${index}:`, doc.metadata.source);

          const summary = await summariseCode(doc);
          console.log(`Generated summary for document at index ${index}:`, summary);

          const embedding = await generateEmbedding(summary);
          console.log(`Generated embedding for document at index ${index}`);

          return {
            summary,
            embedding,
            sourceCode: JSON.stringify(doc.pageContent),
            fileName: doc.metadata.source,
          };
        } catch (error) {
          console.error(`Error generating embedding for document at index ${index}:`, error);
          return null;
        }
      })
    );
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
};

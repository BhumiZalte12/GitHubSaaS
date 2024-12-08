'use server';

import { createStreamableValue } from 'ai/rsc';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateEmbedding } from '@/lib/gemini';
import { db } from '@/server/db';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue();

    try {
        // Generate query vector for the question
        const queryVector = await generateEmbedding(question);
        const vectorQuery = `[${queryVector.join(',')}]`;

        // Query the database for relevant context
        const result = await db.$queryRaw`
            SELECT "fileName", "sourceCode", "summary", 
                   1 - ("summaryEmbedding" <=> ${vectorQuery} :: vector) AS similarity
            FROM "SourceCodeEmbedding"
            WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery} :: vector) > 0.3
              AND "projectId" = ${projectId}
            ORDER BY similarity DESC
            LIMIT 10
        ` as { fileName: string; sourceCode: string; summary: string; }[];

        console.log("Database Query Result:", result);

        // Construct the context block
        let context = '';
        for (const doc of result) {
            context += `source: ${doc.fileName}\nsummary of file: ${doc.summary}\n\n`;
        }

        // Check if context is empty
        if (!context) {
            stream.update("I'm sorry, but I don't know the answer based on the provided context.");
            stream.done();
            return { output: stream, filesReferences: [] };
        }

        // Stream the AI model's response
        (async () => {
            try {
                const { textStream } = await streamText({
                    model: google('gemini-1.5-flash'),
                    prompt: `
You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION
                    `,
                });

                for await (const delta of textStream) {
                    stream.update(delta);
                }
                stream.done();
            } catch (error) {
                console.error("AI Streaming Error:", error);
                stream.update("An error occurred while generating the response.");
                stream.done();
            }
        })();

        return { output: stream, filesReferences: result };
    } catch (error) {
        console.error("Backend Error:", error);
        stream.update("An unexpected error occurred while processing your request.");
        stream.done();
        return { output: stream, filesReferences: [] };
    }
}

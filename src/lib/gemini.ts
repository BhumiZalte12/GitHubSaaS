import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Function to fetch the generative model once
const getGenerativeModel = () => genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // You can switch models depending on your need
});

// Function to summarize commits using generative AI
export const aiSummariseCommit = async (diff: string): Promise<string> => {
  const model = getGenerativeModel();

  const prompt = `
    You are an expert programmer, and you are trying to summarize a git diff.
    Reminders about the git diff format:
    For every file, there are a few metadata lines, like (for example):
    '''
    diff --git a/lib/index.js b/lib/index.js
    index aadf691..bfef603 100644
    --- a/lib/index.js
    +++ b/lib/index.js
    '''
    This means that 'lib/index.js' was modified in this commit. Note that this is only an example.
    Then there is a specifier of the lines that were modified.
    A line starting with '+' means it was added.
    A line starting with '-' means that line was deleted.
    A line that starts with neither '+' nor '-' is code given for context and better understanding.
    It is not part of the diff.
    [...your example summary...]
    Summarize the following git diff:\n\n${diff}
  `;

  try {
    const response = await model.generateContent([prompt]);
    return response.response.text();
  } catch (error) {
    console.error("Error summarizing commit:", error);
    return "Error summarizing commit";
  }
};

// Function to summarize code with a specific context
export async function summariseCode(doc: Document) {
  try {
    const code = doc.pageContent.slice(0, 10000); // Limit code length
    const model = getGenerativeModel();

    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.
      You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
      Here is the code:
      ---
      ${code}
      ---
      Give a summary no more than 100 words of the code above.`,
    ]);

    return response.response.text();
  } catch (error) {
    console.error("Error summarizing code:", error);
    return "";
  }
}

// Function to generate embeddings for a summary
export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  try {
    const result = await model.embedContent(summary);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}
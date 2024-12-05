import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINIC_API_KEY!);

// Fetch the generative model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Function to summarize commits using generative AI
export const aisummariseCommits = async (diff: string): Promise<string> => {
  try {
    const response = await model.generateContent([
      {
        text: `Summarize the following git diff:\n\n${diff}`, // Use only valid properties
      },
    ]);

    // Extract and return the generated content
    if (response && response.length > 0) {
      return response[0].text ?? "Summary unavailable";
    }

    return "Summary unavailable";
  } catch (error) {
    console.error("Error generating commit summary:", error);
    return "Summary unavailable";
  }
};

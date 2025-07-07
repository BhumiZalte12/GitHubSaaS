# 🔍 GitInsight AI – GitHub-Integrated SaaS Platform

A powerful, AI-assisted platform built with **Next.js 15**, designed to help teams summarize GitHub activity, answer project-specific questions, manage meetings, and streamline productivity — all in one place.

## 🌟 Features

### 📌 GitHub Intelligence
- 🔍 **Commit Summarization**  
  Automatically summarizes repository commits using **Google Gemini API** via RAG (Retrieval-Augmented Generation).

- 💬 **AI-Powered Q&A**  
  Ask natural language questions like _"What were the key changes last week?"_ and receive intelligent, repo-specific responses.

### 👥 Collaboration Tools
- 🧑‍🤝‍🧑 **Workspace & Member Invites**  
  Create private or public workspaces. Invite team members via **Clerk Auth** with RBAC (role-based access control).

- 🗣️ **Meeting Upload & Summary**  
  Upload meetings in `.mp3`/`.mp4` formats. Transcribe and summarize using **AssemblyAI** + Gemini.

### 💳 Payments
- 🔁 **Stripe Billing**  
  Fully integrated **Stripe** subscription model to manage SaaS plans.

### 📊 Dashboard
- 📌 Project activity logs
- 📋 Real-time commit feed
- ✅ Project archiving
- 📂 Meeting history

---

## 🛠 Tech Stack

| Layer           | Technologies Used                                                             |
|----------------|--------------------------------------------------------------------------------|
| **Frontend**    | Next.js 15 (App Router), Shadcn UI, Tailwind CSS                              |
| **Auth**        | Clerk Authentication + Role-Based Access                                      |
| **AI/NLP**      | Google Gemini API (LLM), AssemblyAI (Speech-to-Text)                          |
| **Database**    | NeonDB, Prisma ORM, Drizzle ORM                                               |
| **API Layer**   | tRPC for full-stack type safety                                               |
| **Payments**    | Stripe Subscriptions, Webhooks                                                |
| **Storage**     | Firebase (Meetings), Vercel Blob API (Files)                                  |
| **DevOps**      | CI/CD via Vercel                                                              |

---

## 📦 Setup Instructions

 **Clone the repository**
   ```bash
   git clone https://github.com/BhumiZalte12/gitHubSaas.git
   cd gitHubSaas

## 🧠 Project Highlights

⏱️ Reduced manual log reading time by 70%

🔐 Role-based team collaboration

📈 Summarized 100+ commits across multiple repos

📤 Auto-transcribed meetings within seconds

💬 90%+ QA response accuracy on repo questions
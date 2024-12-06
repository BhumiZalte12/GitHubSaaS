import useProject from "@/hooks/use-project";
import React from "react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type CommitType = {
  id: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar?: string; // Optional in case the avatar is missing
  commitMessage: string;
  summary: string;
};

const CommitLog = () => {
  const { projectId, project } = useProject();
  console.log("Project ID in CommitLog:", projectId);

  const { data: commits, isLoading, error } = api.project.getCommits.useQuery(
    { projectId: projectId || "" },
    {
      enabled: !!projectId, // Only run query if projectId is available
    }
  );

  if (isLoading) return <p className="text-center text-gray-500">Loading commits...</p>;
  if (error) return <p className="text-center text-red-500">Error loading commits: {error.message}</p>;

  console.log("Commits:", commits);

  return (
    <ul className="space-y-6">
      {commits?.map((commit: CommitType, commitIdx: number) => (
        <li key={commit.id} className="flex gap-x-4 items-start">
          {/* Vertical Line for Commit History */}
          <div className="relative flex items-center">
            <div
              className={cn(
                commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center"
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200"></div>
            </div>
          </div>

          {/* Commit Author Avatar */}
          <img
            src={commit.commitAuthorAvatar || "/default-avatar.png"} // Fallback avatar
            alt={`Avatar of ${commit.commitAuthorName}`}
            className="mt-1 h-8 w-8 flex-none rounded-full bg-gray-50"
          />

          {/* Commit Information */}
          <div className="flex-auto">
            <div className="rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
              <Link
                target="_blank"
                href={`${project?.gitHubUrl}/commit/${commit.commitHash}`} // Link to GitHub commit
                className="flex items-center text-xs leading-5 text-gray-500"
              >
                <span className="font-medium text-gray-900">{commit.commitAuthorName}</span>
                <span className="inline-flex items-center ml-2">
                  committed
                  <ExternalLink className="ml-1 h-4 w-4 text-gray-400" />
                </span>
              </Link>
              <span className="block font-semibold text-gray-800">{commit.commitMessage}</span>
            </div>

            {/* Commit Summary */}
            <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
              {commit.summary}
            </pre>
          </div>
        </li>
      ))}

      {/* Empty State */}
      {commits?.length === 0 && (
        <p className="text-center text-gray-500">No commits found for this project.</p>
      )}
    </ul>
  );
};

export default CommitLog;

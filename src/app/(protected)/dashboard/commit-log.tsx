"use client";

import useProject from "@/hooks/use-project";
import React from "react";
import { api } from "@/trpc/react";

const CommitLog = () => {
  const { projectId } = useProject();

  // Use the query only if projectId is a string
  const { data: commits } = api.project.getCommits.useQuery(
    { projectId: projectId || "" },
    {
      enabled: !!projectId, // Avoid querying if projectId is null
    }
  );

  return <pre>{JSON.stringify(commits, null, 2)}</pre>;
};

export default CommitLog;

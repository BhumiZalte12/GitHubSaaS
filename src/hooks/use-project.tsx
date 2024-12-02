import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";

interface Project {
  id: string;
  name: string;
  gitHubUrl: string;
  gitHubToken?: string | null;
}

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery<Project[]>();
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    // Ensure projects exist and have at least one entry
    if (projects && projects.length > 0 && !projectId) {
      const firstProjectId = projects[0]?.id;
      if (firstProjectId) {
        setProjectId(firstProjectId);
      }
    }
  }, [projects, projectId]);

  const project = projects?.find((p) => p.id === projectId);

  return {
    projects: projects || [], // Ensure projects is always an array
    project,
    projectId,
    setProjectId,
  };
};

export default useProject;

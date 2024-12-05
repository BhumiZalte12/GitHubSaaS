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
  const [project, setProject] = useState<Project | null>(null);

  // Fetch project from localStorage or set initial projectId
  useEffect(() => {
    if (projects && projects.length > 0) {
      const storedProjectId = localStorage.getItem("projectId");
      if (storedProjectId) {
        setProjectId(storedProjectId);
      } else {
        const firstProjectId = projects[0]?.id;
        if (firstProjectId) {
          setProjectId(firstProjectId);
          localStorage.setItem("projectId", firstProjectId); // Save to localStorage
        }
      }
    }
  }, [projects]); // Runs after projects are fetched

  // Update selected project when projectId changes
  useEffect(() => {
    if (projects && projectId) {
      const selectedProject = projects.find((p) => p.id === projectId);
      setProject(selectedProject || null);
    }
  }, [projects, projectId]); // Re-renders when projectId or projects change

  // Store projectId in localStorage
  useEffect(() => {
    if (projectId) {
      localStorage.setItem("projectId", projectId);
    }
  }, [projectId]);

  return {
    projects: projects || [],
    project,
    projectId,
    setProjectId,
  };
};

export default useProject;

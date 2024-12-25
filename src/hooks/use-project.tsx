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
    // If projects are fetched and available
    if (projects && projects.length > 0) {
      const storedProjectId = localStorage.getItem("projectId");

      // If there's a projectId stored in localStorage, use it
      if (storedProjectId) {
        setProjectId(storedProjectId);
      } else {
        // Otherwise, select the first project as default and store it in localStorage
        const firstProjectId = projects[0]?.id;
        if (firstProjectId) {
          setProjectId(firstProjectId);
          localStorage.setItem("projectId", firstProjectId);
        }
      }
    }
  }, [projects]); // Runs only when the projects data is fetched or changed

  // Update selected project when projectId changes
  useEffect(() => {
    if (projects && projectId) {
      const selectedProject = projects.find((p) => p.id === projectId);
      setProject(selectedProject || null);
    }
  }, [projects, projectId]); // Re-renders when projectId or projects change

  // Store projectId in localStorage whenever it changes
  useEffect(() => {
    if (projectId) {
      localStorage.setItem("projectId", projectId);
    }
  }, [projectId]); // Only runs when projectId changes

  return {
    projects: projects || [],
    project,
    projectId,
    setProjectId,
  };
};

export default useProject;

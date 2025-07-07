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

  // Check and log if projects are being fetched correctly
  useEffect(() => {
    console.log("Projects Fetched: ", projects);
  }, [projects]);

  // Set the initial projectId from localStorage or from fetched projects after fetching the projects
  useEffect(() => {
    if (projects && projects.length > 0) {
      const storedProjectId = localStorage.getItem("projectId");
      console.log("Stored Project ID: ", storedProjectId); // Debugging log
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
  }, [projects]); // Trigger only when projects are fetched

  // Update the selected project when projectId or projects change
  useEffect(() => {
    console.log("Selected Project ID in effect: ", projectId);
    if (projects && projectId) {
      const selectedProject = projects.find((p) => p.id === projectId);
      setProject(selectedProject || null);
    }
  }, [projects, projectId]); // Ensure it runs when either projects or projectId changes

  // Debugging log to verify project updates
  useEffect(() => {
    console.log("Selected Project ID:", projectId);
    console.log("Selected Project:", project);
  }, [projectId, project]);

  // When the projectId changes, store it in localStorage
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

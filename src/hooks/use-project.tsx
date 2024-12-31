import React from "react";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

type Project = {
  id: string; // Adjust this based on your actual project structure
  name: string; // Example property
  // Add other properties of the Project type here
};

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery<Project[]>();
  const [projectId, setProjectId] = useLocalStorage<string>('dionysus-projectId', '');

  const project = projects?.find((project: Project) => project.id === projectId);

  return {
    projects,
    project,
    projectId,
    setProjectId,
  };
};

export default useProject;
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type FormInput = {
    repoUrl: string;
    projectName: string;
    githubToken?: string;
};

const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>();
    const createProject = api.project.createProject.useMutation();
    const refetch = useRefetch();

    function onSubmit(data: FormInput) {
        createProject.mutate(
            {
                gitHubUrl: data.repoUrl,
                name: data.projectName,
                gitHubToken: data.githubToken,
            },
            {
                onSuccess: () => {
                    toast.success("Project created successfully!");
                    refetch();
                    reset();
                },
                onError: () => {
                    toast.error("Failed to create project.");
                },
            }
        );
        return true;
    }

    return (
        <div className="flex items-center gap-12 h-full justify-center">
            <img src="/pic.webp" className="h-56 w-auto" alt="Image" />

            <div>
                <div>
                    <h1 className="font-semibold text-2xl">Link your GitHub Repository</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter the URL of your repository to link it to the Dionysus
                    </p>
                </div>

                <div className="h-4"></div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            {...register("projectName", { required: true })}
                            placeholder="Project Name"
                        />
                        <div className="h-2"></div>
                        <Input
                            {...register("repoUrl", { required: true })}
                            placeholder="Github URL"
                            type="url"
                            required
                        />
                        <div className="h-2"></div>
                        <Input
                            {...register("githubToken")}
                            placeholder="GitHub Token (Optional)"
                            className="mb-4"
                        />
                        <div className="h-4"></div>
                        <Button type="submit" disabled={createProject.isPending}>
                            {createProject.isPending ? "Creating..." : "Create Project"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePage;

import { Button } from "@/components/ui/button"
import useProject from "@/hooks/use-project"
import useRefetch from "@/hooks/use-refetch"
import { api } from "@/trpc/react"
import React from "react"
import toast from "react-hot-toast"

const ArchiveButton = () => {
    const archiveProject = api.project.archiveProject.useMutation()
    const { projectId } = useProject()
    const refetch = useRefetch()

    return (
        <Button
            disabled={archiveProject.isPending}
            size="sm"
            variant="destructive"
            onClick={() => {
                const confirm = window.confirm('Are you sure you want to archive this project?')
                if (confirm) {
                    archiveProject.mutate({ projectId }, {
                        onSuccess: () => {
                            toast.success("Project has been successfully archived")
                            refetch()  // Refetch to get the updated list of projects
                        },       
                        onError: (err) => {
                            toast.error("Failed to archive project")
                            console.error(err)
                        }
                    })
                }
            }}
        >
            Archive
            
        </Button>
    )
}

export default ArchiveButton

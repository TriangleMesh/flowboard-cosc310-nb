import { useGetMembers } from "@/features/members/api/use-get-members"; // TODO: uncomment after FB-3025 is merged
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {useGetTaskById} from "@/features/tasks/api/use-get-task-by-id";
import {UpdateTaskForm} from "@/features/tasks/components/update-task-form";

interface UpdateTaskFormWrapperProps {
    onCancel: () => void;
    taskId: string;
}

export const UpdateTaskFormWrapper = async ({onCancel,taskId}: UpdateTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId() as string;

    const { data: initialValues, isLoading: isLoadingTask } = useGetTaskById({ taskId: taskId });
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId }); // TODO: uncomment after FB-3025 is merged

    const projectOptions = projects?.documents.map((project: { $id: any; name: any; ImageUrl: any; }) => ({ // TODO: double check if infering type here makes any difference
        id: project.$id,
        name: project.name,
        imageUrl: project.ImageUrl,
    }));

    const memberOptions = members?.documents.map((member: { $id: any; name: any; }) => ({ // TODO: uncomment after FB-3025 is merged
        id: member.$id,
        name: member.name,
    }));

    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask;

    if (isLoading) {
        return (
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!initialValues){
        return null;
    }

    return (
        <UpdateTaskForm
            initialValues={initialValues}
            onCancel={onCancel}
            projectOptions={projectOptions ?? []}
            memberOptions={memberOptions ?? []} // TODO: uncomment after FB-3025 is merged
        />
    );
};

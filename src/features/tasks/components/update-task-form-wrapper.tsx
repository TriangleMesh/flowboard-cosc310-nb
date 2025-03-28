import {useGetMembers} from "@/features/members/api/use-get-members"; // TODO: uncomment after FB-3025 is merged
import {useGetProjects} from "@/features/projects/api/use-get-projects";
import {useWorkspaceId} from "@/features/workspaces/hooks/use-workspace-id";
import {Loader} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {UpdateTaskForm} from "@/features/tasks/components/update-task-form";
import {TaskStatus} from "@/features/tasks/types";
import {useTaskId} from "@/features/tasks/hooks/useTaskId";
import {useGetTaskById} from "@/features/tasks/api/use-get-task-by-id";

interface UpdateTaskFormWrapperProps {
    onCancel: () => void;
}

function timeToDateString(timestamp: Date) {
    let date = new Date(timestamp);

    const year = date.getUTCFullYear(); // Get the year in UTC
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(date.getUTCDate()).padStart(2, '0'); // Get the day of the month

    return `${year}-${month}-${day}`;
}

export const UpdateTaskFormWrapper = async ({onCancel}: UpdateTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId() as string;
    const taskId = useTaskId() as string;


    const {data: projects, isLoading: isLoadingProjects} = useGetProjects({workspaceId});
    const {data: members, isLoading: isLoadingMembers} = useGetMembers({workspaceId});
    const {data: originalTaskData, isLoading: isLoadingTaskData} = useGetTaskById({id: taskId});

    const projectOptions = projects?.documents.map((project: { $id: any; name: any; ImageUrl: any; }) => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.ImageUrl,
    }));

    const memberOptions = members?.documents.map((member: { $id: any; name: any; }) => ({
        id: member.$id,
        name: member.name,
    }));

    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTaskData;

    if (isLoading || !originalTaskData) {
        return (
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground"/>
                </CardContent>
            </Card>
        );
    }

    //get original task data
    // @ts-ignore
     const taskData = {
        taskId: taskId as string,
        name: originalTaskData.name,
        status: originalTaskData.status as TaskStatus,
        dueDate: timeToDateString(originalTaskData.dueDate as Date),
        assigneeId: originalTaskData.assigneeId as string,
        description: originalTaskData.description as string,
        projectId: originalTaskData.projectId as string,
    }


    return (
        <UpdateTaskForm
            onCancel={onCancel}
            projectOptions={projectOptions ?? []}
            memberOptions={memberOptions ?? []}
            initialValues={taskData}/>
    );
};

"use client";

import {ResponsiveModal} from "@/components/responsive-modal";
import {useUpdateTaskModal} from "@/features/tasks/hooks/use-update-task-modal";
import {UpdateTaskFormWrapper} from "@/features/tasks/components/update-task-form-wrapper";

export const UpdateTaskModal = () => {
    const {taskId, close} = useUpdateTaskModal();
    return (
        <ResponsiveModal open={!!taskId} onOpenChange={close}>
            {
                taskId && (<UpdateTaskFormWrapper taskId={taskId} onCancel={close}/>)
            }
        </ResponsiveModal>
    );
};

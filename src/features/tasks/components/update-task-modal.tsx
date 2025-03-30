"use client";

import {ResponsiveModal} from "@/components/responsive-modal";
import {useUpdateTaskModal} from "@/features/tasks/hooks/use-update-task-modal";
import {UpdateTaskFormWrapper} from "@/features/tasks/components/update-task-form-wrapper";

export const UpdateTaskModal = () => {
    const {isOpen, open, close} = useUpdateTaskModal();
    return (
        <ResponsiveModal open={isOpen} onOpenChange={(newOpenState) => {
            if (newOpenState) {
                open("placeholder");
            } else {
                close()
            }
        }}>
            <UpdateTaskFormWrapper onCancel={close}/>
        </ResponsiveModal>
    );
};

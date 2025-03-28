"use client";

import {ResponsiveModal} from "@/components/responsive-modal";
import {useUpdateTaskModal} from "@/features/tasks/hooks/use-update-task-modal";
import {UpdateTaskFormWrapper} from "@/features/tasks/components/update-task-form-wrapper";

export const UpdateTaskModal = () => {
    const {isOpen, setIsOpen, close} = useUpdateTaskModal();
    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            <UpdateTaskFormWrapper onCancel={close}/>
        </ResponsiveModal>
    );
};

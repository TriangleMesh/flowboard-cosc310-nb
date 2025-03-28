import {useQueryState, parseAsBoolean, parseAsString} from "nuqs";

export const useUpdateTaskModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        "update-task",
        parseAsBoolean.withDefault(false).withOptions({clearOnDefault: true})
    );

    const [taskId, setTaskId] = useQueryState(
        "task-id",
        parseAsString.withDefault("").withOptions({clearOnDefault: true})
    );

    const open = (id: string) => {
        setTaskId(id);
        setIsOpen(true);
    }

    const close = () => setIsOpen(false);

    return {
        isOpen,
        open,
        close,
        setIsOpen,
        taskId
    };
};

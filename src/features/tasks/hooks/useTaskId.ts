import {useQueryState} from "nuqs";

export const useTaskId = () => {
    const params = useQueryState("task-id"); //get task-id from url
    return params.at(0); // Use "workspaceId", not "useWorkspaceId"
};

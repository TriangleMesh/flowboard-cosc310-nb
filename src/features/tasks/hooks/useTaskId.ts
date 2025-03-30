import {useQueryState} from "nuqs";

export const useTaskId = () => {
    const params = useQueryState("taskId"); //get taskId from url
    return params.at(0);
};

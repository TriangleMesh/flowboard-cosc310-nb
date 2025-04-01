import {useGetMembers} from "@/features/members/api/use-get-members";
import {useGetProjects} from "@/features/projects/api/use-get-projects";
import {useWorkspaceId} from "@/features/workspaces/hooks/use-workspace-id";
import {ListChecksIcon, UserIcon, FolderIcon, Clock1Icon} from "lucide-react";
import {TaskPriority, TaskStatus} from "../types";
import {DatePicker} from "@/components/date-picker";
import {useTaskFilters} from "../hooks/use-task-filters";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {MemberAvatar} from "@/features/members/components/member-avatar";
import {MultiSelect} from "@/components/ui/multi-select";

interface DataFiltersProps {
    hideProjectFilter?: boolean;
}

export const DataFilters = ({hideProjectFilter}: DataFiltersProps) => {
    const workspaceId = useWorkspaceId();
    const {data: projects, isLoading: isLoadingProjects} = useGetProjects({workspaceId});
    const {data: members, isLoading: isLoadingMembers} = useGetMembers({workspaceId})

    const isLoading = isLoadingProjects || isLoadingMembers;

    const projectOptions = projects?.documents.map((project) => ({
        value: project.$id,
        label: project.name,
    }));

    const memberOptions = members?.documents.map((member) => ({
        value: member.$id,
        label: member.name,
    }));

    const [{status, assigneeId, projectId, dueDate, priority, assigneesId}, setFilters] = useTaskFilters();

    const onStatusChange = (value: string) => {
        setFilters({status: value === "all" ? null : (value as TaskStatus)});
    };

    const onAssigneesChange = (value: string[]) => {
        setFilters({ assigneesId: value.length === 0 ? null : value });
    };


    const onProjectChange = (value: string) => {
        setFilters({projectId: value === "all" ? null : value});
    };

    const onPriorityChange  = (value: string) => {
        setFilters({priority: value === "all" ? null : (value as TaskPriority) });
    };

    if (isLoading) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-2">
            {/* Status Filter */}
            <Select defaultValue={status ?? undefined} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center">
                        <ListChecksIcon className="size-4 mr-2"/>
                        <SelectValue placeholder="All statuses"/>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectSeparator/>
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                </SelectContent>
            </Select>

            <MultiSelect
                options={memberOptions.map((member) => ({
                    value: member.value,
                    label: member.label,
                    icon: () => <MemberAvatar className="size-5" name={member.label as string} />
                }))}
                type="dataFilters"
                placeholder="Select assignees"
                variant="inverted"
                defaultValue={assigneesId ?? undefined}
                animation={2}
                onValueChange={onAssigneesChange}
                renderOption={(option) => (
                    <div className="flex items-center gap-x-2" key={option.value}>
                        {option.label}
                    </div>
                )}
            />


            {/* Project Filter (if not hidden) */}
            {!hideProjectFilter && (
                <Select defaultValue={projectId ?? undefined} onValueChange={onProjectChange}>
                    <SelectTrigger className="w-full lg:w-auto h-8">
                        <div className="flex items-center">
                            <FolderIcon className="size-4 mr-2"/>
                            <SelectValue placeholder="All projects"/>
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All projects</SelectItem>
                        <SelectSeparator/>
                        {projectOptions?.map((project) => (
                            <SelectItem key={project.value} value={project.value}>
                                {project.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Due Date Picker */}
            <DatePicker
                placeholder="Due Date"
                className="h-8 w-full lg:w-auto"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(date) => {
                    setFilters({dueDate: date ? date.toISOString() : null});
                }}
            />

            {/* Priority Filter */}
            <Select defaultValue={priority ?? undefined} onValueChange={onPriorityChange}>
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center">
                        <Clock1Icon className="size-4 mr-2"/>
                        <SelectValue placeholder="All Priority"/>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All priority</SelectItem>
                    <SelectSeparator/>
                    <SelectSeparator/>
                    <SelectItem value={TaskPriority.NULL}>No Priority</SelectItem>
                    <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM_LOW}>Medium Low</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM_HIGH}>Medium High</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                    <SelectItem value={TaskPriority.CRITICAL}>Critical</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

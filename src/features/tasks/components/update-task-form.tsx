import {MemberAvatar} from "@/features/members/components/member-avatar"; // TODO: FB-3025
import {TaskPriority, TaskStatus} from "../types";
import {ProjectAvatar} from "@/features/projects/components/project-avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {z} from "zod";
import {useForm, FormProvider} from "react-hook-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DottedSeparator} from "@/components/ui/dotted-separator";
import {cn} from "@/lib/utils";

import {updateTaskSchema} from "@/features/tasks/schemas";
import {useUpdateTask} from "@/features/tasks/api/use-update-tasks";
import {Switch} from "@/components/ui/switch";
import {useCurrent} from "@/features/auth/api/use-current";
import {useGetWorkspace} from "@/features/workspaces/api/use-get-workspace-by-id";
import {DatePicker} from "@/components/date-picker";
import {MultiSelect} from "@/components/ui/multi-select";
import {Loader} from "lucide-react";

interface CreateTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string; name: string; imageUrl: string }[];
    memberOptions: { id: string; name: string }[];
    initialValues: z.infer<typeof updateTaskSchema>;
}

export const UpdateTaskForm = ({onCancel, projectOptions, memberOptions, initialValues}: CreateTaskFormProps) => {
    const {mutate, isPending} = useUpdateTask();
    const {data: currentUser, isLoading: isLoadingCurrentUser} = useCurrent();
    const {data: workspace, isLoading: isLoadingWorkspace} = useGetWorkspace(initialValues.workspaceId);

    const isAdmin = workspace?.userId === currentUser?.$id;
    console.log("isAdmin", isAdmin);

    const form = useForm<z.infer<typeof updateTaskSchema>>({
        defaultValues: initialValues,
    });

    const onSubmit = (values: z.infer<typeof updateTaskSchema>) => {
        mutate(
            {json: {...values, taskId: initialValues.$id}},
            {
                onSuccess: () => {
                    form.reset();
                    onCancel?.();
                },
            }
        );
    };

    if (isLoadingCurrentUser || isLoadingWorkspace || !currentUser || !workspace) {
        return (
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground"/>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">Update Task</CardTitle>
            </CardHeader>

            <div className="px-7">
                <DottedSeparator/>
            </div>

            <CardContent className="p-7">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            {/* Task Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Task Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter task name"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Task description Field */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Task Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter task description"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Due Date Field */}
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Due date</FormLabel>
                                        <FormControl>
                                            <DatePicker {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Assignees Field */}
                            <FormField
                                control={form.control}
                                name="assigneesId" // Changed to "assigneeIds" for multiple assignees
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Assignees</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={memberOptions.map((member) => ({
                                                    value: member.id,
                                                    label: member.name,
                                                    icon: () => <MemberAvatar className="size-5" name={member.name}/>
                                                }))}
                                                value={field.value || []}
                                                onValueChange={field.onChange}
                                                placeholder="Select assignees"
                                                type="editForm"
                                                variant="inverted"
                                                animation={2}
                                                defaultValue={initialValues.assigneesId}
                                                renderOption={(member) => (
                                                    <div className="flex items-center gap-x-2" key={member.id}>
                                                        <MemberAvatar className="size-6" name={member.name}/>
                                                        {member.name}
                                                    </div>
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Priority Field */}
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={TaskPriority.NULL}>No priority</SelectItem>
                                                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                                                <SelectItem value={TaskPriority.MEDIUM_LOW}>Medium Low</SelectItem>
                                                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                                                <SelectItem value={TaskPriority.MEDIUM_HIGH}>Medium High</SelectItem>
                                                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                                                <SelectItem value={TaskPriority.CRITICAL}>Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Status Field */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                                                <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                                                <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                                                <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                                                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Project Field */}
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projectOptions.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <ProjectAvatar
                                                                className="size-6"
                                                                name={project.name}
                                                                image={project.imageUrl}
                                                            />
                                                            {project.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Locked Field */}
                            {isAdmin && (
                                <FormField
                                    control={form.control}
                                    name="locked"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Lock Status</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={field.value} // Bind the current value of the field
                                                        onCheckedChange={field.onChange} // Update the field value when toggled
                                                    />
                                                    <span>{field.value ? "Locked" : "Unlocked"}</span> {/* Optional: Display the state */}
                                                </div>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <DottedSeparator className="py-7"/>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="lg"
                                variant="secondary"
                                onClick={onCancel}
                                disabled={isPending}
                                className={cn(!onCancel && "invisible")}
                            >
                                Cancel
                            </Button>
                            <Button disabled={isPending} type="submit" size="lg">
                                Update Task
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
};

import {createTaskSchema} from "../schemas";
import {useCreateTask} from "../api/use-create-tasks";
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
import {useWorkspaceId} from "@/features/workspaces/hooks/use-workspace-id";
import {useRouter} from "next/navigation";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm, FormProvider, Controller} from "react-hook-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DottedSeparator} from "@/components/ui/dotted-separator";
import {cn} from "@/lib/utils";
import {Switch} from "@/components/ui/switch";
import {DatePicker} from "@/components/date-picker";
import {MultiSelect} from "@/components/ui/multi-select";

interface CreateTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string; name: string; imageUrl: string }[];
    memberOptions: { id: string; name: string }[];
}

export const CreateTaskForm = ({onCancel, projectOptions, memberOptions}: CreateTaskFormProps) => {
    const workspaceId = useWorkspaceId();
    const {mutate, isPending} = useCreateTask();


    const form = useForm<z.infer<typeof createTaskSchema>>({
        resolver: zodResolver(createTaskSchema.omit({workspaceId: true})),
        // defaultValues: {workspaceId},
    });

    const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
        mutate(
            {json: {...values, workspaceId}},
            {
                onSuccess: () => {
                    form.reset();
                    onCancel?.();
                },
            }
        );
    };

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">Create a new task</CardTitle>
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

                            {/* Assignee Field */}
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Assignee</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select assignee"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {memberOptions.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <MemberAvatar className="size-6" name={member.name}/>
                                                            {member.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {/* Assignees Field */}
                            <FormField
                                control={form.control}
                                name="assigneesId" // Changed to "assigneeIds" for multiple assignees
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignees</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={memberOptions.map((member) => ({
                                                    value: member.id,
                                                    label: member.name,
                                                    icon: () => <MemberAvatar className="size-5" name={member.name} />
                                                }))}
                                                type="editForm"
                                                value={field.value || []}
                                                onValueChange={field.onChange}
                                                placeholder="Select assignees"
                                                variant="inverted"
                                                animation={2}
                                                renderOption={(member) => (
                                                    <div className="flex items-center gap-x-2" key={member.id}>
                                                        <MemberAvatar className="size-6" name={member.name} />
                                                        {member.name}
                                                    </div>
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
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
                            <FormField
                                control={form.control}
                                name="locked"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lock Status</FormLabel>
                                        <FormControl>
                                            {/* Use a Switch component for the toggle */}
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={field.value} // Bind the current value of the field
                                                    onCheckedChange={field.onChange} // Update the field value when toggled
                                                />
                                                <span>{field.value ? "Locked" : "Unlocked"}</span> {/* Optional: Display the state */}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                                Create Task
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
};

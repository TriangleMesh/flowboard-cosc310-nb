import {MemberAvatar} from "@/features/members/components/member-avatar"; // TODO: FB-3025
import {TaskStatus} from "../types";
import {ProjectAvatar} from "@/features/projects/components/project-avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {z} from "zod";
import {useForm, FormProvider, Controller} from "react-hook-form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DottedSeparator} from "@/components/ui/dotted-separator";
import {cn} from "@/lib/utils";

import {updateTaskSchema} from "@/features/tasks/schemas";
import {useUpdateTask} from "@/features/tasks/api/use-update-tasks";

interface CreateTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string; name: string; imageUrl: string }[];
    memberOptions: { id: string; name: string }[];
    initialValues: z.infer<typeof updateTaskSchema>; // 新增
}

export const UpdateTaskForm = ({onCancel, projectOptions, memberOptions, initialValues}: CreateTaskFormProps) => {
    const {mutate, isPending} = useUpdateTask();

    const form = useForm<z.infer<typeof updateTaskSchema>>({
        defaultValues: initialValues,
    });

    const onSubmit = (values: z.infer<typeof updateTaskSchema>) => {
        mutate(
            {json: {...values,}},
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

                            {/* Due Date Field */}
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Due date</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter due date yyyy-mm-dd"/>
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

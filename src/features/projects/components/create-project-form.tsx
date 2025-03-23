"use client";
import {useRef} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm, FormProvider, Controller} from "react-hook-form"; // Import Controller
import {z} from "zod";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {DottedSeparator} from "@/components/ui/dotted-separator";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import Image from "next/image"
import {ImageIcon} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createProjectSchema } from "../schemas";
import { useCreateProject } from "../api/use-create-project";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspace";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";


interface CreateProjectFormProps {
    onCancel?: () => void;
}

export const CreateProjectForm = ({onCancel}: CreateProjectFormProps) => {
    // const workspaceId = useCreateWorkspace(); // Causes projects not to be created. 
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const {mutate, isPending} = useCreateProject();
    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema.omit({workspaceId: true})),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
            workspaceId,
        }
        mutate({ form: finalValues}, {
            onSuccess: ({data}) => {
                form.reset();
                router.push(`/workspaces/${workspaceId}/projects/${data.$id}`)
            }
        });
    };

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">Create a new Project</CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                {/* Wrap the form in FormProvider */}
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            <FormField
                                name="name"
                                control={form.control}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Project Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter Project name"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Controller
                                name="image"
                                control={form.control}
                                render={({field}) => (
                                    <div className={"flex flex-col gap-y-2"}>
                                        <Input
                                            ref={inputRef}
                                            type="file"
                                            disabled={isPending}
                                            onChange={(e) => {
                                                const file = e.target.files ? e.target.files[0] : null;
                                                field.onChange(file);
                                            }}
                                        />
                                        <div className={"flex items-center gap-x-5"}>
                                            {field.value ? (
                                                <div className={"size-[72px] relative rounded-md overflow-hidden"}>
                                                    <Image alt="Workspace logo"
                                                           fill
                                                           className="object-cover"
                                                           src={field.value instanceof File ?
                                                               URL.createObjectURL(field.value) : field.value}
                                                    />
                                                </div>
                                            ) : (
                                                <Avatar className={"size-[72px]"}>
                                                    <AvatarFallback>
                                                        <ImageIcon className={"size-[36px] text-neutral-400"}/>
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={"flex flex-col"}>
                                                <p className={"text-sm"}>Project Icon</p>
                                                <p className={"text-sm text-muted-foreground"}>
                                                    JPG, PNG, SVG or JPEG, max 1mb
                                                </p>
                                                {field.value ? (
                                                <Button
                                                    type="button"
                                                    disabled={isPending}
                                                    variant="destructive" 
                                                    size="xs"
                                                    className="w-fit mt-2"
                                                    onClick={() => {
                                                        field.onChange(null);
                                                        if (inputRef.current) {
                                                            inputRef.current.value = "";
                                                        }
                                                    }}
                                                >
                                                    Remove Image
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    disabled={isPending}
                                                    variant="tertiary"
                                                    size="xs"
                                                    className="w-fit mt-2"
                                                    onClick={() => inputRef.current?.click()}
                                                >
                                                    Upload Image
                                                </Button>
                                            )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>

                        <DottedSeparator className="py-7"/>
                        <div className={"flex items-center justify-between"}>

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
                            <Button 
                                type="submit" 
                                size="lg" 
                                variant="primary" 
                                disabled={isPending}
                            >
                                Create Project
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
};

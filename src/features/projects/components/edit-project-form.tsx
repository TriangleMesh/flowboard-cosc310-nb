/* eslint-disable react/react-in-jsx-scope */
"use client";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectSchema } from "../schemas";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Project } from "../types";
import { useDeleteProject } from "../api/use-delete-project";
import { useUpdateProject } from "../api/use-update-project";



interface EditProjectFormProps {
    onCancel?: () => void;
    initialValues: Project;
}

export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => {
    const router = useRouter();
    const { mutate, isPending } = useUpdateProject();
    const {
        mutate: deleteProject,
        isPending: isDeletingProject
    } = useDeleteProject();

    // TODO: adding delete functions
    // const [DeleteDialog, confirmDelete] = useConfirm(
    //     "Delete Project",
    //     "This action cannot be undone",
    //     "destructive",
    // )


    // const { mutate: ResetInviteCode, isPending: isResettingInviteCode } = useResetInviteCode();
    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? "",
        },
    });

    // UPDATE: deleteWorkspace is commented, handleDelete is kept
    // HandleResetInviteCode is also deleted, fullInvite link is also deleted, so is handleCopyInviteLink
    // <ResetDialog /> is deleted
    // Danger zone remains, for deleting project
    // Deleted a project is irreversible and will remove all associated data
   
    // const handleDelete = async () => {
    //     // const ok = await confirmDelete();

    //     // if (!ok) return;
        
    //     deleteProject({
    //         param: { projectId: initialValues.$id },
    //     }, {
    //         onSuccess: ()=>{
    //             window.location.href = `/workspaces/${initialValues.workspaceId}`;
    //         },
        
    //     });
    // }
    return (
        <div className="flex flex-col gap-y-4">
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="grid grid-cols-3 items-center p-7">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onCancel || (() => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`))}
                        className="flex items-center gap-2 justify-self-start"
                    >
                        <ArrowLeftIcon className="size-4" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold text-center col-span-1">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeparator />
                </div>
                <CardContent className="p-7">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit((values) => {
                            const finalValues = {
                                ...values,
                                image: values.image instanceof File ? values.image : "",
                            };
                            mutate(
                                {
                                    form: finalValues,
                                    param: { projectId: initialValues.$id },
                                },
                                {
                                    onSuccess: () => {
                                        form.reset();
                                       
                                    },
                                }
                            );
                        })}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    name="name"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter project name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Controller
                                    name="image"
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2">
                                            <Input
                                                ref={inputRef}
                                                type="file"
                                                disabled={isPending}
                                                onChange={(e) => {
                                                    const file = e.target.files ? e.target.files[0] : null;
                                                    field.onChange(file);
                                                }}
                                            />
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size-[72px] relative rounded-md overflow-hidden">
                                                        <Image
                                                            alt="Workspace logo"
                                                            fill
                                                            className="object-cover"
                                                            src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[36px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p className="text-sm">Project Icon</p>
                                                    <p className="text-sm text-muted-foreground">
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

                            <DottedSeparator className="py-7" />
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
                                <Button
                                    type="submit"
                                    size="lg"
                                    variant="primary"
                                    disabled={isPending}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
};

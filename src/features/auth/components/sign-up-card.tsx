"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import {Control, useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { registerSchema } from "@/features/auth/schemas";
import { useRegister } from "../api/use-register";

const FormInput = ({
                       name,
                       type,
                       placeholder,
                       control,
                   }: {
    name: keyof z.infer<typeof registerSchema>;
    type: string;
    placeholder: string;
    control: Control<z.infer<typeof registerSchema>>;
}) => (
    <FormField
        name={name}
        control={control}
        render={({ field }) => (
            <FormItem>
                <FormControl>
                    <Input {...field} type={type} placeholder={placeholder} />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);

export const SignUpCard = () => {
    const { mutate,isPending } = useRegister();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        mutate({ json: values });
    };

    return (
        <Card>
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                    By signing up, you agree to our{" "}
                    <Link href="/privacy" className="text-blue-700 underline">
                        Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" className="text-blue-700 underline">
                        Terms of Service
                    </Link>
                </CardDescription>
            </CardHeader>

            <DottedSeparator className="px-7" />

            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormInput
                            name="name"
                            type="text"
                            placeholder="Enter your name"
                            control={form.control}
                        />
                        <FormInput
                            name="email"
                            type="email"
                            placeholder="Enter email address"
                            control={form.control}
                        />
                        <FormInput
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            control={form.control}
                        />
                        <Button disabled={isPending} size="lg" className="w-full">
                        Register
                    </Button>
                    </form>
                </Form>    
            </CardContent>

            <div className="px-7">
            
            <DottedSeparator />
        
            </div>

            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button disabled={isPending} variant="secondary" size="lg" className="w-full">
                    <FcGoogle className="mr-2" />
                    Sign Up with Google
                </Button>
                <Button disabled={isPending} variant="secondary" size="lg" className="w-full">
                    <FaGithub className="mr-2" />
                    Sign Up with GitHub
                </Button>
            </CardContent>

            <DottedSeparator />

            <CardContent className="p-7 flex items-center justify-center">
                <p>
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-blue-700 underline ml-1">
                        Sign In
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
};

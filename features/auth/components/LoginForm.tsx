"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { EyeIcon, EyeOffIcon, KeySquareIcon, MailIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { signInSchema, type SignInValues } from "@/features/auth/schema";

function LoginForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (values: SignInValues) => {
        setServerError(null);

        const { error } = await authClient.signIn.email({
            email: values.email,
            password: values.password,
        });

        if (error) {
            setServerError(error.message ?? "Invalid email or password.");
            return;
        }

        router.push("/");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 py-3">
            <Field className="gap-2">
                <FieldLabel className="text-sm px-1" htmlFor="email">Email</FieldLabel>
                <InputGroup>
                    <InputGroupInput
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        {...register("email")}
                    />
                    <InputGroupAddon>
                        <MailIcon />
                    </InputGroupAddon>
                </InputGroup>
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field className="gap-2">
                <FieldLabel className="text-sm px-1" htmlFor="password">Password</FieldLabel>
                <InputGroup>
                    <InputGroupInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...register("password")}
                    />
                    <InputGroupAddon>
                        <KeySquareIcon />
                    </InputGroupAddon>
                    <InputGroupAddon className="cursor-pointer" align="inline-end" aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupAddon>

                </InputGroup>
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>

            {serverError && <p className="text-sm text-destructive px-1">{serverError}</p>}

            <div className="mt-3 w-full">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Login"}
                </Button>
            </div>
        </form>
    );
}

export default LoginForm;
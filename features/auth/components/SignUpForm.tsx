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
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { EyeIcon, EyeOffIcon, KeySquareIcon, MailIcon, User } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpValues } from "@/features/auth/schema";

function SignUpForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (values: SignUpValues) => {
        setServerError(null);

        const { error } = await authClient.signUp.email({
            name: values.name,
            email: values.email,
            password: values.password,
        });

        if (error) {
            setServerError(error.message ?? "Something went wrong. Please try again.");
            return;
        }

        router.push("/");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 py-3">
            <Field className="gap-2">
                <FieldLabel className="text-sm px-1" htmlFor="name">Name</FieldLabel>
                <InputGroup>
                    <InputGroupInput
                        type="text"
                        id="name"
                        placeholder="Enter your Name"
                        {...register("name")}
                    />
                    <InputGroupAddon>
                        <User />
                    </InputGroupAddon>
                </InputGroup>
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

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
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            type="button"
                            size="icon-xs"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>

            <Field className="gap-2">
                <FieldLabel className="text-sm px-1" htmlFor="password-confirm">Confirm Password</FieldLabel>
                <InputGroup>
                    <InputGroupInput
                        id="password-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...register("confirmPassword")}
                    />
                    <InputGroupAddon>
                        <KeySquareIcon />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            type="button"
                            size="icon-xs"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
                {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
            </Field>

            {serverError && <p className="text-sm text-destructive px-1">{serverError}</p>}

            <div className="mt-3 w-full">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
            </div>
        </form>
    );
}

export default SignUpForm;
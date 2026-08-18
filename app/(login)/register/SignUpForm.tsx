import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { EyeOffIcon, KeySquareIcon, MailIcon, User } from "lucide-react";


function SignUpForm() {
    return (
        <div className="w-full flex flex-col gap-4 py-3">

            <Field className="gap-2">
                <FieldLabel className="text-sm px-1" htmlFor="name">Name</FieldLabel>

                <InputGroup>
                    <InputGroupInput type="text" id="name" placeholder="Enter your Name" />
                    <InputGroupAddon>
                        <User />
                    </InputGroupAddon>
                </InputGroup>


            </Field>
            <Field className="gap-2">
                <FieldLabel className="text-sm px-1" htmlFor="email">Email</FieldLabel>

                <InputGroup>
                    <InputGroupInput type="email" id="email" placeholder="Enter your email" />
                    <InputGroupAddon>
                        <MailIcon />
                    </InputGroupAddon>
                </InputGroup>
                {/* <FieldError>Enter a valid email address.</FieldError> */}

            </Field>
            <Field className="gap-2">
                <FieldLabel className="text-sm px-1" htmlFor="password">Password</FieldLabel>
                
                <InputGroup>
                    <InputGroupInput
                        id="password"
                        type="password"
                        placeholder="Enter password"
                    />
                    <InputGroupAddon>
                        <KeySquareIcon />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <EyeOffIcon />
                    </InputGroupAddon>
                </InputGroup>

            </Field>
            <Field className="gap-2">
                <FieldLabel className="text-sm px-1" htmlFor="password-confirm">Confirm Password</FieldLabel>
                <InputGroup>
                    <InputGroupInput
                        id="password-confirm"
                        type="password"
                        placeholder="Enter password"
                    />
                    <InputGroupAddon>
                        <KeySquareIcon />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <EyeOffIcon />
                    </InputGroupAddon>
                </InputGroup>

            </Field>
            <div className="mt-3 w-full">

                <Button className="w-full">Create Account</Button>
            </div>
        </div>
    );
}

export default SignUpForm;
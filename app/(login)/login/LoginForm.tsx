import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { EyeOffIcon, KeySquareIcon, MailIcon } from "lucide-react";


function LoginForm() {
    return (
        <div className="w-full flex flex-col gap-4 py-3">


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
<div className="mt-3 w-full">

            <Button className="w-full">Login</Button>
</div>
        </div>
    );
}

export default LoginForm;
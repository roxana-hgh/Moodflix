import SignUpForm from "@/app/(login)/register/SignUpForm";
import Link from "next/link";

function RegisterPage() {
    return (
        <div className="w-full px-3 py-2">
            <p className="px-1 mb-3 text-sm text-center">Create a New Account</p>
            <SignUpForm />
            <p className="text-xs text-muted-foreground mt-2 px-2">Already Have an Account?

                <Link href="/login" className="px-1  hover:underline decoration-primary">
                    <span className="text-primary">Login</span>
                </Link>
            </p>
        </div>
    );
}

export default RegisterPage;
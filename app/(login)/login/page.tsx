import LoginForm from "@/app/(login)/login/LoginForm";
import Link from "next/link";

function LoginPage() {
    return ( 
        <div className="w-full px-3 py-2">
            <p className="px-1 mb-3 text-sm text-center">Login To your Account</p>
            <LoginForm/>
            <p className="text-xs text-muted-foreground mt-2 px-2">Dont Have Any Account?

            <Link href="/register" className="px-1  hover:underline decoration-primary">
            <span className="text-primary">Sign up</span>
            </Link>
            </p>
        </div>
     );
}

export default LoginPage;
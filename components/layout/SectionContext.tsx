import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SectionContextProps {
    title: string;
    description?: string;
    buttonText?: string;
    ButtonLink?: string;
}


function SectionContext({ title, description, buttonText, ButtonLink }: SectionContextProps) {
    return (
        <div className="pb-4">
            <div className="flex justify-between flex-wrap items-start mb-2">
                <h2 className="text-lg lg:text-xl text-primary font-semibold ">{title}</h2>
                {buttonText && (
                    <Link href={ButtonLink || "#"}>
                        <Button asChild  variant="outline" size="sm" className="">
                           <span> {buttonText}</span>
                        </Button>
                    </Link>
                )}
            </div>
            {description && <p className="text-base text-muted-foreground mb-3">{description}</p>}
        </div>
    );
}

export default SectionContext;
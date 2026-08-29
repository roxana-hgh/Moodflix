import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListCardGridPreview } from "./list-card-grid-preview";
import type { ListWithPreview } from "../types";
import SectionWrapper from "@/components/layout/SectionWrapper";
import SectionContext from "@/components/layout/SectionContext";

interface RecentListsSectionProps {
    lists: ListWithPreview[];
}

export function RecentListsSection({ lists }: RecentListsSectionProps) {
    return (

        <SectionWrapper>
            <div className="  mx-auto">
                <SectionContext title="Your Lists" buttonText="View all lists" ButtonLink="lists" />
                {lists.length === 0 ? (
                    <div className="py-3 text-center">
                        <p className="text-sm text-muted-foreground">No lists yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {lists.map((list) => (
                            <ListCardGridPreview key={list.id} list={list} />
                        ))}
                    </div>
                )}
            </div>
        </SectionWrapper>

    );
}
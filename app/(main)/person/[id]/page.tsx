import { notFound } from "next/navigation";
import { getPersonDetails, getPersonCreditsStatus } from "@/features/people/queries";
import { personIdSchema } from "@/features/people/schema";
import { PersonHeader } from "@/features/people/components/person-header";
import { PersonBio } from "@/features/people/components/person-bio";
import { PersonCreditsTabs } from "@/features/people/components/person-credits-tabs";

interface PersonPageProps {
    params: Promise<{ id: string }>;
}

export default async function PersonPage({ params }: PersonPageProps) {
    const { id } = await params;
    const parsed = personIdSchema.safeParse(id);
    if (!parsed.success) notFound();

    let data;
    try {
        data = await getPersonDetails(parsed.data);
    } catch {
        notFound();
    }

    const { person, movieCredits, tvCredits } = data;
    const status = await getPersonCreditsStatus([...movieCredits, ...tvCredits]);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
            <PersonHeader person={person} />
            
            <div className="mt-10">
                <PersonCreditsTabs movieCredits={movieCredits} tvCredits={tvCredits} status={status} />
            </div>
        </div>
    );
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PersonCreditsTabs } from "@/features/people/components/person-credits-tabs";
import { PersonHeader } from "@/features/people/components/person-header";
import { getPersonDetails } from "@/features/people/queries";
import { personIdSchema } from "@/features/people/schema";

// loading.tsx is the Suspense boundary for this segment, so params can be awaited here.
export const instant = true;

async function loadPerson(id: string) {
  const parsed = personIdSchema.safeParse(id);
  return parsed.success ? getPersonDetails(parsed.data) : null;
}

export async function generateMetadata({ params }: PageProps<"/person/[id]">): Promise<Metadata> {
  const data = await loadPerson((await params).id);
  return { title: data ? `${data.person.name} | Moodflix` : "Person | Moodflix" };
}

export default async function PersonPage({ params }: PageProps<"/person/[id]">) {
  const data = await loadPerson((await params).id);
  if (!data) notFound();

  const { person, movieCredits, tvCredits } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <PersonHeader person={person} />

      <div className="mt-10">
        <PersonCreditsTabs movieCredits={movieCredits} tvCredits={tvCredits} />
      </div>
    </div>
  );
}

import Image from "next/image";
import { Badge } from "@/components/ui/badge";

import type { Person } from "../types";
import { tmdbImageUrl } from "@/utils/image";
import { PersonBio } from "@/features/people/components/person-bio";

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PersonHeader({ person }: { person: Person }) {
  const birthDate = formatDate(person.birthday);
  const deathDate = formatDate(person.deathday);

  return (
    <div className="flex flex-col gap-6 md:flex-row items-start">
      <div className="mx-auto w-40 shrink-0 overflow-hidden rounded-xl bg-muted md:mx-0 md:w-56">
        {person.profilePath ? (
          <Image
            src={tmdbImageUrl(person.profilePath, "original")}
            alt={person.name}
            width={450}
            height={750}
            className="h-auto w-full object-cover"
            priority
          />
        ) : (
          <div className="flex aspect-[2/3] w-full items-center justify-center text-4xl font-semibold text-muted-foreground">
            {person.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
        )}
      </div>

      <div className="flex-1 text-left pt-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{person.name}</h1>
        {person.knownForDepartment && (
          <Badge variant="secondary" className="mt-2">
            {person.knownForDepartment}
          </Badge>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          {birthDate && (
            <div>
              <dt className="text-muted-foreground">{person.deathday ? "Born" : "Birthday"}</dt>
              <dd className="font-medium">
                {birthDate}
                {person.age !== null && !person.deathday && ` (age ${person.age})`}
              </dd>
            </div>
          )}
          {deathDate && (
            <div>
              <dt className="text-muted-foreground">Died</dt>
              <dd className="font-medium">
                {deathDate}
                {person.age !== null && ` (age ${person.age})`}
              </dd>
            </div>
          )}
          {person.placeOfBirth && (
            <div>
              <dt className="text-muted-foreground">Place of Birth</dt>
              <dd className="font-medium">{person.placeOfBirth}</dd>
            </div>
          )}
          {person.biography && (
                <div className="mt-5 sm:col-span-3">
                    <PersonBio biography={person.biography} />
                </div>
            )}
        </dl>
      </div>
    </div>
  );
}
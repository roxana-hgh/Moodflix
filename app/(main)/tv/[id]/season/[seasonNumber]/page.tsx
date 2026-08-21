import { getSeasonDetail } from "@/features/media/queries";
import { EpisodeAccordion } from "@/features/media/components/episode-accordion";
import { SeasonHeader } from "@/features/media/components/season-header";

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ id: string; seasonNumber: string }>;
}) {
  const { id, seasonNumber } = await params;
  const season = await getSeasonDetail(Number(id), Number(seasonNumber));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <SeasonHeader season={season} />
      <EpisodeAccordion episodes={season.episodes} />
    </div>
  );
}
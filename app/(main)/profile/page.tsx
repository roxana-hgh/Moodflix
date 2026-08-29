import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/features/profile/queries";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { getUserListByType } from "@/features/lists/queries";
import { toListCardItem } from "@/features/lists/types";

import { MediaCardCompact } from "@/components/media/media-card-compact";
import { MediaCarousel } from "@/components/shared/Slider/media-carousel";
import SectionWrapper from "@/components/layout/SectionWrapper";
import SectionContext from "@/components/layout/SectionContext";

async function ProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  const [favorites, watchlist] = await Promise.all([
    getUserListByType(profile.id, "FAVORITE"),
    getUserListByType(profile.id, "WATCHLIST"),
  ]);

  return (
    <div className="h-full py-5">
      <div className="container h-full mx-auto">
        <div className="flex flex-col h-full gap-6">
          <ProfileHeader profile={profile} />
          <SectionWrapper>
        <div className="  mx-auto">
          <SectionContext title="Favorites" buttonText="See all" ButtonLink="/" />
          {favorites.length === 0 ? (
              <div className="py-3 text-center">
                <p className="text-sm text-muted-foreground">No favorites yet.</p>
              </div>
            ) : (
              <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 6, xl: 8 }} autoplay={false}>
                {favorites.map((item) => (
                  <MediaCardCompact key={item.id} {...toListCardItem(item)} />
                ))}
              </MediaCarousel>
            )}
        </div>
      </SectionWrapper>
      <SectionWrapper>
        <div className="  mx-auto">
          <SectionContext title="Watchlist" buttonText="See all" ButtonLink="/" />
          {watchlist.length === 0 ? (
             <div className="py-3 text-center">
                <p className="text-sm text-muted-foreground">No items in watchlist.</p>
              </div>
            ) : (
              <MediaCarousel itemsPerView={{ base: 2, sm: 3, md: 4, lg: 6, xl: 8 }} autoplay={false}>
                {watchlist.map((item) => (
                  <MediaCardCompact key={item.id} {...toListCardItem(item)} />
                ))}
              </MediaCarousel>
            )}
        </div>
      </SectionWrapper>

         
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
import { BannerUpload } from "./banner-upload";
import { AvatarUpload } from "./avatar-upload";
import { EditProfileDialog } from "./edit-profile-dialog";
import { GENDER_LABELS, type Profile } from "../types";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div>
      <BannerUpload bannerUrl={profile.bannerUrl} />

      <div className="px-2">
     
        <div className="flex items-end justify-between">
          <div className="-mt-8 sm:-mt-20 px-1">
            <AvatarUpload name={profile.name} avatarUrl={profile.avatarUrl} />
          </div>
          <div className="py-2">
            <EditProfileDialog profile={profile} />
          </div>
        </div>

     
        <div className="mt-3 min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">{profile.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{profile.email}</p>

          {(profile.age || profile.gender) && (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {profile.age && <span>{profile.age} years old</span>}
              {profile.gender && <span>{GENDER_LABELS[profile.gender]}</span>}
            </div>
          )}

          {profile.bio && (
            <p className="mt-3 max-w-xl text-sm text-foreground/90">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
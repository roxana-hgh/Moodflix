import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, GENDER_LABELS, type Profile } from "../types";
import { EditProfileDialog } from "@/features/profile/components/edit-profile-dialog";


interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <Avatar className="size-18 text-xl">
        <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
          {getInitials(profile.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-semibold truncate">{profile.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
          <span>{profile.age ? `${profile.age} years old` : "Age not set"}</span>
          <span>{profile.gender ? GENDER_LABELS[profile.gender] : "Gender not set"}</span>
        </div>
      </div>

      <EditProfileDialog profile={profile} />
    </div>
  );
}
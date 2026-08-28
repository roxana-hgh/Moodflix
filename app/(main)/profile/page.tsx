import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/features/profile/queries";
import { ProfileHeader } from "@/features/profile/components/profile-header";

async function ProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="h-full py-5">
      <div className="container h-full mx-auto">
        <div className="flex flex-col h-full gap-6">
          {/* <div className="flex flex-col gap-2 min-h-10 lg:min-h-10">
            <h2 className="text-lg lg:text-2xl text-primary font-semibold">Profile</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your account details.
            </p>
          </div> */}

          <ProfileHeader profile={profile} />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
import { verifySession } from "@/lib/dal";
import { getProfile } from "@/lib/data/profile";
import { ProfileForm } from "@/components/profile-form";

export default async function SettingsPage() {
  const user = await verifySession();
  const profile = await getProfile(user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Settings</p>
        <h1 className="mt-1 font-display text-3xl font-medium">Your profile</h1>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}

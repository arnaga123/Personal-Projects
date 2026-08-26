import { verifySession } from "@/lib/dal";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export default async function OnboardingPage() {
  const user = await verifySession();
  const name = (user.user_metadata?.name as string | undefined)?.split(" ")[0];

  return <OnboardingWizard name={name} />;
}

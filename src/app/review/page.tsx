import { AppShell } from "@/components/app-shell";
import { ReviewDashboard } from "@/components/review-dashboard";

export default function ReviewPage() {
  return (
    <AppShell active="/review">
      <ReviewDashboard />
    </AppShell>
  );
}

import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { type OrganizationSizeBand } from "@yoga-app/shared";

import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/shared/components/forms/form-ui";
import {
  AccountTypeToggle,
  OrganizationFields,
  type AccountType,
} from "@/features/onboarding/components";
import { useCompleteOnboarding } from "@/features/onboarding/hooks/use-complete-onboarding";
import { ApiRequestError } from "@/lib/http";

export const Route = createFileRoute("/onboarding/")({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: "/login" });
    if (context.user.onboardingCompletedAt) throw redirect({ to: "/" });
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const complete = useCompleteOnboarding();
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [orgName, setOrgName] = useState("");
  const [orgSizeBand, setOrgSizeBand] = useState<OrganizationSizeBand | "">("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);

    if (accountType === "company" && (!orgName.trim() || !orgSizeBand)) {
      setError("Please enter your organization name and team size");
      return;
    }

    complete.mutate(
      accountType === "company"
        ? { accountType, organization: { name: orgName.trim(), sizeBand: orgSizeBand as OrganizationSizeBand } }
        : { accountType },
      {
        onSuccess: (response) => {
          // Google accounts already come back with emailVerified: true — no
          // need to detour through /verify-email for those.
          const needsVerification = !user?.emailVerified;
          if (response.data?.organizationId) {
            navigate({ to: needsVerification ? "/verify-email" : "/org/members", replace: true });
          } else {
            navigate({ to: needsVerification ? "/verify-email" : "/", replace: true });
          }
        },
        onError: (err) =>
          setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Something went wrong"),
      },
    );
  }

  return (
    <div className="relative flex min-h-[88vh] items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="relative mx-auto w-fit">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shadow-lg shadow-primary/10 mx-auto">
              <Sparkles className="size-5" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">One more thing</h1>
          <p className="text-muted-foreground text-sm">
            Are you here for yourself, or setting this up for your team?
          </p>
        </div>

        <Card className="border border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl sketch-border-lg">
          <CardContent className="pt-6 pb-7 px-7">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <AccountTypeToggle value={accountType} onChange={setAccountType} />

              {accountType === "company" && (
                <OrganizationFields
                  name={orgName}
                  onNameChange={setOrgName}
                  sizeBand={orgSizeBand}
                  onSizeBandChange={setOrgSizeBand}
                />
              )}

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <SubmitButton
                loading={complete.isPending}
                label="Continue"
                loadingLabel="Setting things up…"
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

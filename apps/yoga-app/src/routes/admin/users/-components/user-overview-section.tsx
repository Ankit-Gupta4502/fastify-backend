import { Chip } from "@/components/shared/chip";
import type { AdminUserDetail } from "@yoga-app/shared";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground w-32 shrink-0 pt-0.5 font-medium">{label}</span>
      <span className="text-sm text-foreground flex-1 break-all">
        {value ?? <span className="text-muted-foreground">—</span>}
      </span>
    </div>
  );
}

const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", google: "Google",
  twitter: "Twitter / X", youtube: "YouTube", tiktok: "TikTok",
  linkedin: "LinkedIn", organic: "Organic search", direct: "Direct",
  email: "Email", referral: "Referral",
};

export function UserOverviewSection({ user: u }: { user: AdminUserDetail }) {
  const acq = u.acquisition;
  const prefs = u.preferences;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Account</p>
        <Row label="Role" value={
          <Chip variant={u.role === "admin" ? "primary" : u.role === "instructor" ? "info" : "muted"}>
            {u.role}
          </Chip>
        } />
        <Row label="Joined" value={new Date(u.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })} />
      </section>

      <section>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Acquisition</p>
        {acq ? (
          <>
            <Row label="Source" value={SOURCE_LABELS[acq.utmSource?.toLowerCase() ?? ""] ?? acq.utmSource} />
            <Row label="Medium" value={acq.utmMedium} />
            <Row label="Campaign" value={acq.utmCampaign} />
            <Row label="Referrer" value={acq.referrer} />
            <Row label="Landing page" value={acq.landingPage} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No acquisition data.</p>
        )}
      </section>

      <section>
        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Onboarding preferences</p>
        {prefs ? (
          <>
            <Row label="Gender" value={prefs.gender} />
            <Row label="Phone" value={prefs.phone} />
            <Row label="Goals" value={
              <div className="flex flex-wrap gap-1.5">
                {prefs.purposes.map((p: string) => (
                  <span key={p} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{p}</span>
                ))}
                {prefs.otherPurpose && (
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">{prefs.otherPurpose}</span>
                )}
              </div>
            } />
            <Row label="Preferred time" value={prefs.preferredTimeOfDay} />
            <Row label="Timezone" value={prefs.timezone} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">User hasn't completed onboarding yet.</p>
        )}
      </section>
    </div>
  );
}

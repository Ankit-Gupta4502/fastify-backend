import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/shared/components/misc/chip";
import type { AdminUser } from "@yoga-app/shared";

interface Props {
  user: AdminUser;
  onClose: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google",
  twitter: "Twitter / X",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  organic: "Organic search",
  direct: "Direct",
  email: "Email",
  referral: "Referral",
};

function sourceLabel(src: string | null | undefined): string {
  if (!src) return "Unknown";
  return SOURCE_LABELS[src.toLowerCase()] ?? src;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground w-32 shrink-0 pt-0.5 font-medium">{label}</span>
      <span className="text-sm text-foreground flex-1 break-all">{value ?? <span className="text-muted-foreground">—</span>}</span>
    </div>
  );
}

export function UserDetailDialog({ user: u, onClose }: Props) {
  const acq = u.acquisition;
  const prefs = u.preferences;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border/60 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border/40 shrink-0">
          <div>
            <h2 className="text-lg font-bold leading-tight">{u.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
          </div>
          <Button size="icon-sm" variant="ghost" className="rounded-xl shrink-0" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-5 space-y-6">

          {/* Account */}
          <section>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Account</p>
            <Row label="Role" value={<Chip variant={u.role === "admin" ? "primary" : u.role === "instructor" ? "info" : "muted"}>{u.role}</Chip>} />
            <Row label="Plan" value={u.planName?.replace("_", " ") ?? "No plan"} />
            <Row label="Joined" value={new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
          </section>

          {/* Acquisition */}
          <section>
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Acquisition</p>
            {acq ? (
              <>
                <Row label="Source" value={sourceLabel(acq.utmSource)} />
                <Row label="Medium" value={acq.utmMedium} />
                <Row label="Campaign" value={acq.utmCampaign} />
                <Row label="Referrer" value={acq.referrer} />
                <Row label="Landing page" value={acq.landingPage} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No acquisition data — user signed up before tracking was enabled or via direct URL with no UTM params.</p>
            )}
          </section>

          {/* Preferences */}
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
      </div>
    </div>
  );
}

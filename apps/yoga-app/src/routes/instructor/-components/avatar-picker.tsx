import { useRef } from "react";
import { Upload, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const DEFAULT_AVATARS = [
  { key: "lotus",    gradient: "from-violet-400 to-purple-600",  emoji: "🪷" },
  { key: "flame",    gradient: "from-orange-400 to-rose-500",    emoji: "🔥" },
  { key: "leaf",     gradient: "from-emerald-400 to-teal-600",   emoji: "🌿" },
  { key: "moon",     gradient: "from-slate-400 to-indigo-600",   emoji: "🌙" },
  { key: "sun",      gradient: "from-yellow-400 to-orange-500",  emoji: "☀️" },
  { key: "water",    gradient: "from-cyan-400 to-blue-600",      emoji: "💧" },
  { key: "mountain", gradient: "from-stone-400 to-neutral-600",  emoji: "🏔️" },
  { key: "star",     gradient: "from-pink-400 to-rose-600",      emoji: "⭐" },
] as const;

export type AvatarKey = (typeof DEFAULT_AVATARS)[number]["key"];

interface AvatarPickerProps {
  avatarKey: string | null;
  profileImageUrl: string | null;
  uploading: boolean;
  onAvatarSelect: (key: string) => void;
  onFileSelect: (file: File) => void;
}

export function AvatarPicker({
  avatarKey,
  profileImageUrl,
  uploading,
  onAvatarSelect,
  onFileSelect,
}: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const current = DEFAULT_AVATARS.find((a) => a.key === avatarKey);

  return (
    <div className="space-y-4">
      {/* Current avatar preview */}
      <div className="flex items-center gap-5">
        <div className="size-20 rounded-2xl overflow-hidden shrink-0 shadow-md">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" className="size-full object-cover" />
          ) : current ? (
            <div className={cn("size-full flex items-center justify-center bg-gradient-to-br text-3xl", current.gradient)}>
              {current.emoji}
            </div>
          ) : (
            <div className="size-full flex items-center justify-center bg-secondary text-muted-foreground text-2xl">
              👤
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Profile photo</p>
          <p className="text-xs text-muted-foreground">Upload a photo or pick an avatar below.</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            <Upload className="size-3.5" />
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Default avatar grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Default avatars
        </p>
        <div className="grid grid-cols-8 gap-2">
          {DEFAULT_AVATARS.map((a) => {
            const selected = avatarKey === a.key && !profileImageUrl;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => onAvatarSelect(a.key)}
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br transition-all hover:scale-110 relative",
                  a.gradient,
                  selected && "ring-2 ring-offset-2 ring-primary",
                )}
                title={a.key}
              >
                {a.emoji}
                {selected && (
                  <span className="absolute -top-1 -right-1 size-4 bg-primary rounded-full flex items-center justify-center">
                    <Check className="size-2.5 text-primary-foreground" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

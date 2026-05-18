import { useState, useEffect } from "react";
import { Plus, X, ExternalLink } from "lucide-react";
import type { InstructorProfile } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpdateInstructorProfile, useUploadAttachment } from "@/hooks/use-instructors";
import { AvatarPicker } from "./avatar-picker";

interface ProfileFormProps {
  profile: InstructorProfile;
}

const SUGGESTED_TAGS = [
  "Hatha", "Vinyasa", "Ashtanga", "Yin", "Restorative",
  "Prenatal", "Power", "Kundalini", "Meditation", "Breathwork",
];

export function ProfileForm({ profile }: ProfileFormProps) {
  const update = useUpdateInstructorProfile();
  const upload = useUploadAttachment();

  const [bio, setBio] = useState(profile.bio ?? "");
  const [tagline, setTagline] = useState(profile.tagline ?? "");
  const [years, setYears] = useState<string>(profile.yearsOfExperience?.toString() ?? "");
  const [avatarKey, setAvatarKey] = useState<string | null>(profile.avatarKey ?? null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(profile.profileImageUrl ?? null);
  const [videoLinks, setVideoLinks] = useState<string[]>(profile.videoLinks ?? []);
  const [videoInput, setVideoInput] = useState("");
  const [tags, setTags] = useState<string[]>(profile.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBio(profile.bio ?? "");
    setTagline(profile.tagline ?? "");
    setYears(profile.yearsOfExperience?.toString() ?? "");
    setAvatarKey(profile.avatarKey ?? null);
    setProfileImageUrl(profile.profileImageUrl ?? null);
    setVideoLinks(profile.videoLinks ?? []);
    setTags(profile.tags ?? []);
  }, [profile]);

  const handleFileSelect = (file: File) => {
    upload.mutate(file, {
      onSuccess: (res) => {
        setProfileImageUrl(res.data.url);
        setAvatarKey(null);
      },
    });
  };

  const handleAvatarSelect = (key: string) => {
    setAvatarKey(key);
    setProfileImageUrl(null);
  };

  const addVideoLink = () => {
    const trimmed = videoInput.trim();
    if (!trimmed || videoLinks.length >= 5) return;
    setVideoLinks((prev) => [...prev, trimmed]);
    setVideoInput("");
  };

  const removeVideoLink = (i: number) =>
    setVideoLinks((prev) => prev.filter((_, idx) => idx !== i));

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const addCustomTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        bio: bio || undefined,
        tagline: tagline || undefined,
        profileImageUrl,
        avatarKey,
        videoLinks,
        tags,
        yearsOfExperience: years ? Number(years) : null,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
      {/* Avatar */}
      <section className="space-y-3">
        <SectionLabel>Photo & Avatar</SectionLabel>
        <AvatarPicker
          avatarKey={avatarKey}
          profileImageUrl={profileImageUrl}
          uploading={upload.isPending}
          onAvatarSelect={handleAvatarSelect}
          onFileSelect={handleFileSelect}
        />
      </section>

      {/* Tagline */}
      <section className="space-y-2">
        <SectionLabel>Tagline</SectionLabel>
        <input
          className="input"
          placeholder="e.g. Helping you find stillness through movement"
          maxLength={120}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <p className="text-xs text-muted-foreground text-right">{tagline.length} / 120</p>
      </section>

      {/* Bio */}
      <section className="space-y-2">
        <SectionLabel>Bio</SectionLabel>
        <textarea
          className="input min-h-32 resize-y"
          placeholder="Tell students a bit about your background, teaching style, and what they can expect…"
          maxLength={1000}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="text-xs text-muted-foreground text-right">{bio.length} / 1000</p>
      </section>

      {/* Years of experience */}
      <section className="space-y-2">
        <SectionLabel>Years of experience</SectionLabel>
        <input
          type="number"
          className="input w-28"
          min={0}
          max={60}
          placeholder="e.g. 7"
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />
      </section>

      {/* Tags */}
      <section className="space-y-3">
        <SectionLabel>Tags</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                tags.includes(tag)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
        {/* Custom tag */}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add custom tag…"
            value={tagInput}
            maxLength={40}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
          />
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addCustomTag}>
            <Plus className="size-3.5" />
          </Button>
        </div>
        {tags.filter((t) => !SUGGESTED_TAGS.includes(t as never)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.filter((t) => !SUGGESTED_TAGS.includes(t as never)).map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-foreground">
                {tag}
                <button type="button" onClick={() => toggleTag(tag)} className="hover:text-destructive">
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Video links */}
      <section className="space-y-3">
        <SectionLabel>Video links <span className="text-muted-foreground font-normal normal-case">(YouTube, Vimeo, etc.)</span></SectionLabel>
        <div className="space-y-2">
          {videoLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
              <a href={link} target="_blank" rel="noopener noreferrer"
                className="flex-1 truncate text-primary hover:underline">{link}</a>
              <button type="button" onClick={() => removeVideoLink(i)}
                className="text-muted-foreground hover:text-destructive">
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        {videoLinks.length < 5 && (
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="https://youtube.com/watch?v=…"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVideoLink())}
            />
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addVideoLink}>
              <Plus className="size-3.5" />
            </Button>
          </div>
        )}
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" className="rounded-xl px-8" disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save profile"}
        </Button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
        {update.isError && (
          <span className="text-sm text-destructive">
            {update.error instanceof Error ? update.error.message : "Save failed"}
          </span>
        )}
      </div>
    </form>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

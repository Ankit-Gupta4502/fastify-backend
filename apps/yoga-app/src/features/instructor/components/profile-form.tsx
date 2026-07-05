import { Plus, X, ExternalLink } from "lucide-react";
import type { InstructorProfile } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { AvatarPicker } from "./avatar-picker";
import { useProfileForm } from "./use-profile-form";
import { TagsSection } from "@/features/instructor/components/tags-section";

interface ProfileFormProps {
  profile: InstructorProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const {
    bio,
    setBio,
    tagline,
    setTagline,
    years,
    setYears,
    avatarKey,
    profileImageUrl,
    videoLinks,
    videoInput,
    setVideoInput,
    tags,
    tagInput,
    setTagInput,
    saved,
    isUploading,
    isSaving,
    saveError,
    handleFileSelect,
    handleAvatarSelect,
    addVideoLink,
    removeVideoLink,
    toggleTag,
    addCustomTag,
    handleSave,
  } = useProfileForm(profile);

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
      {/* Avatar */}
      <section className="space-y-3">
        <SectionLabel>Photo & Avatar</SectionLabel>
        <AvatarPicker
          avatarKey={avatarKey}
          profileImageUrl={profileImageUrl}
          uploading={isUploading}
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
        <TagsSection
          tags={tags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          toggleTag={toggleTag}
          addCustomTag={addCustomTag}
        />
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
        <Button type="submit" className="rounded-xl px-8" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save profile"}
        </Button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
        {saveError && (
          <span className="text-sm text-destructive">{saveError}</span>
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

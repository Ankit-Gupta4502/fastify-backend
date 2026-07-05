import { useState } from "react";
import { Plus, X, ExternalLink } from "lucide-react";
import type { InstructorProfile } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { PhotoUploadField } from "./photo-upload-field";
import { TagsSection } from "@/features/instructor/components/tags-section";
import { useProfileForm } from "./use-profile-form";

interface ProfileFormProps {
  profile: InstructorProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { form, onSubmit, saved, isSaving, saveError } = useProfileForm(profile);
  const { register, watch, setValue, formState: { errors } } = form;
  const [videoInput, setVideoInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const videoLinks = watch("videoLinks");
  const tags = watch("tags");
  const tagline = watch("tagline");
  const bio = watch("bio");

  function addVideoLink() {
    const trimmed = videoInput.trim();
    if (!trimmed || videoLinks.length >= 5) return;
    setValue("videoLinks", [...videoLinks, trimmed], { shouldValidate: true });
    setVideoInput("");
  }

  function removeVideoLink(i: number) {
    setValue("videoLinks", videoLinks.filter((_, idx) => idx !== i), { shouldValidate: true });
  }

  function toggleTag(tag: string) {
    setValue(
      "tags",
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
      { shouldValidate: true },
    );
  }

  function addCustomTag() {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
    setValue("tags", [...tags, trimmed], { shouldValidate: true });
    setTagInput("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-2xl">
      {/* Photo */}
      <section className="space-y-3">
        <SectionLabel>Photo</SectionLabel>
        <PhotoUploadField
          name={profile.name}
          value={watch("profileImageUrl")}
          onChange={(url) => setValue("profileImageUrl", url, { shouldValidate: true })}
        />
      </section>

      {/* Tagline */}
      <section className="space-y-2">
        <SectionLabel>Tagline</SectionLabel>
        <Input
          placeholder="e.g. Helping you find stillness through movement"
          className={cn("rounded-xl", errors.tagline && "border-destructive focus-visible:ring-destructive/20")}
          {...register("tagline")}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-destructive">{errors.tagline?.message}</span>
          <span>{tagline.length} / 120</span>
        </div>
      </section>

      {/* Bio */}
      <section className="space-y-2">
        <SectionLabel>Bio</SectionLabel>
        <Textarea
          placeholder="Tell students a bit about your background, teaching style, and what they can expect…"
          className={cn("min-h-32 resize-y rounded-xl", errors.bio && "border-destructive focus-visible:ring-destructive/20")}
          {...register("bio")}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-destructive">{errors.bio?.message}</span>
          <span>{bio.length} / 1000</span>
        </div>
      </section>

      {/* Years of experience */}
      <section className="space-y-2">
        <SectionLabel>Years of experience</SectionLabel>
        <Input
          type="number"
          min={0}
          max={60}
          placeholder="e.g. 7"
          className={cn("rounded-xl w-28", errors.yearsOfExperience && "border-destructive focus-visible:ring-destructive/20")}
          {...register("yearsOfExperience")}
        />
        {errors.yearsOfExperience && (
          <p className="text-xs text-destructive">{errors.yearsOfExperience.message}</p>
        )}
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
        {errors.tags && <p className="text-xs text-destructive">{errors.tags.message}</p>}
      </section>

      {/* Video links */}
      <section className="space-y-3">
        <SectionLabel>
          Video links <span className="text-muted-foreground font-normal normal-case">(YouTube, Vimeo, etc.)</span>
        </SectionLabel>
        <div className="space-y-2">
          {videoLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-primary hover:underline">
                {link}
              </a>
              <button type="button" onClick={() => removeVideoLink(i)} className="text-muted-foreground hover:text-destructive">
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        {videoLinks.length < 5 && (
          <div className="flex gap-2">
            <Input
              className="rounded-xl flex-1"
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
        {errors.videoLinks && <p className="text-xs text-destructive">{errors.videoLinks.message}</p>}
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" className="rounded-xl px-8" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save profile"}
        </Button>
        {saved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
        {saveError && <span className="text-sm text-destructive">{saveError}</span>}
      </div>
    </form>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{children}</Label>;
}

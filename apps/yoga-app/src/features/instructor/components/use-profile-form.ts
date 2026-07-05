import { useState, useEffect } from "react";
import type { InstructorProfile } from "@yoga-app/shared";
import { useUpdateInstructorProfile, useUploadAttachment } from "@/features/instructor/hooks/use-instructors";

export function useProfileForm(profile: InstructorProfile) {
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

  return {
    // state
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
    // derived
    isUploading: upload.isPending,
    isSaving: update.isPending,
    saveError: update.isError
      ? update.error instanceof Error
        ? update.error.message
        : "Save failed"
      : null,
    // handlers
    handleFileSelect,
    handleAvatarSelect,
    addVideoLink,
    removeVideoLink,
    toggleTag,
    addCustomTag,
    handleSave,
  };
}

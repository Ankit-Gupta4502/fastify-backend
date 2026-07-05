import { useRef } from "react";
import { Upload } from "lucide-react";
import { InstructorAvatar } from "@/shared/components/misc/instructor-avatar";
import { useUploadAttachment } from "@/features/instructor/hooks/use-instructors";

interface PhotoUploadFieldProps {
  name: string;
  value: string | null;
  onChange: (url: string | null) => void;
}

export function PhotoUploadField({ name, value, onChange }: PhotoUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAttachment();

  return (
    <div className="flex items-center gap-5">
      <InstructorAvatar
        src={value}
        name={name}
        className="size-20 rounded-2xl shadow-md shrink-0"
        fallbackClassName="bg-secondary"
        initialsClassName="text-2xl font-bold text-muted-foreground"
      />
      <div className="space-y-1.5">
        <p className="text-sm font-semibold">Profile photo</p>
        <p className="text-xs text-muted-foreground">This is what students see on your public profile.</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
          className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
        >
          <Upload className="size-3.5" />
          {upload.isPending ? "Uploading…" : "Change photo"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            upload.mutate(file, {
              onSuccess: (res) => onChange(res.data.url),
            });
          }}
        />
      </div>
    </div>
  );
}

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import ReactPlayer from "react-player";
import { useUploadVideo } from "@/features/instructor/hooks/use-instructors";

interface VideoUploadFieldProps {
  url: string | null;
  onChange: (url: string | null, key: string | null) => void;
}

export function VideoUploadField({ url, onChange }: VideoUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadVideo();

  return (
    <div className="space-y-3">
      {url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
          <ReactPlayer src={url} controls width="100%" height="100%" />
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Remove video"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={upload.isPending}
        className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
      >
        <Upload className="size-3.5" />
        {upload.isPending ? "Uploading…" : url ? "Replace video" : "Upload intro video"}
      </button>
      {upload.isError && (
        <p className="text-xs text-destructive">
          {upload.error instanceof Error ? upload.error.message : "Upload failed"}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          upload.mutate(file, {
            onSuccess: (res) => onChange(res.data.url, res.data.key),
          });
        }}
      />
    </div>
  );
}

import { Loader2, Upload, X } from "lucide-react";
import type { CreateWorkshopBody } from "@yoga-app/shared";

interface WorkshopImageFieldProps {
  image: CreateWorkshopBody["image"];
  isUploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onClear: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WorkshopImageField({
  image,
  isUploading,
  fileRef,
  onClear,
  onFileChange,
}: WorkshopImageFieldProps) {
  return (
    <div className="flex items-center gap-3">
      {image ? (
        <div className="relative size-16 rounded-xl overflow-hidden shrink-0 border border-border">
          <img src={image} alt="Cover" className="size-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-0.5 right-0.5 size-4 bg-black/60 rounded-full flex items-center justify-center hover:bg-destructive"
          >
            <X className="size-2.5 text-white" />
          </button>
        </div>
      ) : (
        <div className="size-16 rounded-xl border border-dashed border-border bg-secondary flex items-center justify-center shrink-0">
          {isUploading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="size-4 text-muted-foreground" />
          )}
        </div>
      )}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {isUploading ? "Uploading…" : image ? "Replace image" : "Upload image"}
        </button>
        <p className="text-[10px] text-muted-foreground">JPEG, PNG, WebP or GIF · max 5 MB</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}

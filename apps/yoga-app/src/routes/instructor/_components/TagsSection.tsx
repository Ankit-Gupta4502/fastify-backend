import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUGGESTED_TAGS } from "./profile-form-config";

interface TagsSectionProps {
  tags: string[];
  tagInput: string;
  setTagInput: (value: string) => void;
  toggleTag: (tag: string) => void;
  addCustomTag: () => void;
}

export function TagsSection({
  tags,
  tagInput,
  setTagInput,
  toggleTag,
  addCustomTag,
}: TagsSectionProps) {
  const customTags = tags.filter((t) => !SUGGESTED_TAGS.includes(t as never));

  return (
    <>
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
      {/* Custom tag input */}
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
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-secondary text-foreground">
              {tag}
              <button type="button" onClick={() => toggleTag(tag)} className="hover:text-destructive">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

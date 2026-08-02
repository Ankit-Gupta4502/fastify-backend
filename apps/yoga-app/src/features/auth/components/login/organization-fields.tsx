import { Building2 } from "lucide-react";
import { ORGANIZATION_SIZE_BANDS, type OrganizationSizeBand } from "@yoga-app/shared";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { Field } from "@/features/auth/components/login/form-ui";

const SIZE_BAND_LABELS: Record<OrganizationSizeBand, string> = {
  "5-10": "5–10 members",
  "10-50": "10–50 members",
  "50-100": "50–100 members",
  "100+": "100+ members",
};

interface OrganizationFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  sizeBand: OrganizationSizeBand | "";
  onSizeBandChange: (value: OrganizationSizeBand) => void;
}

export function OrganizationFields({
  name,
  onNameChange,
  sizeBand,
  onSizeBandChange,
}: OrganizationFieldsProps) {
  return (
    <div className="space-y-4 mb-4">
      <Field label="Organization name">
        <div className="relative">
          <Building2 className={cn("absolute left-3 top-2.5 size-4 text-muted-foreground")} />
          <Input
            id="reg-org-name"
            placeholder="Acme Corp"
            className="pl-10 h-10"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
      </Field>

      <Field label="Team size">
        <Select value={sizeBand || undefined} onValueChange={(v) => onSizeBandChange(v as OrganizationSizeBand)}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent>
            {ORGANIZATION_SIZE_BANDS.map((band) => (
              <SelectItem key={band} value={band}>
                {SIZE_BAND_LABELS[band]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

import { Mail, MessageCircle } from "lucide-react";

export const CONTACT_CHANNELS = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 79826 90162",
    href: "https://wa.me/917982690162",
    color:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@bookyouryogateacher.com",
    href: "mailto:support@bookyouryogateacher.com",
    color: "text-primary bg-primary/8 border-primary/15",
  },
] as const;


import { Link } from "@tanstack/react-router";
import { Flower2, Instagram, Linkedin, Music2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

type FooterLink =
  | { label: string; to: "/" | "/login" }
  | { label: string; href: string };

const footerSections: Array<{
  title: string;
  links: FooterLink[];
}> = [
  {
    title: "Workspace",
    links: [
      { label: "Home", to: "/" },
      { label: "Login", to: "/login" },
      { label: "Features", href: "#features" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Community", href: "#" },
      { label: "Classes", href: "#" },
      { label: "Meditation playlists", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-secondary/35">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link className="inline-flex items-center gap-2 text-xl font-semibold" to="/">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Flower2 className="size-4" />
              </span>
              Solara
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              A calm, structured workspace for yoga studios, instructors, and
              practitioners to flow through planning, booking, and mindfulness.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Built with TanStack Start</Badge>
              <Badge variant="outline">Fastify API</Badge>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        to={link.to}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-4 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {year} Solara Yoga Workspace. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="#"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="#"
              aria-label="LinkedIn"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="#"
              aria-label="Music playlist"
            >
              <Music2 className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

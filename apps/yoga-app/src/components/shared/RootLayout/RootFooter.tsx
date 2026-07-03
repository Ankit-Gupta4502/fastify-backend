
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { XIcon } from "@/components/icons";

type FooterLink =
  | { label: string; to: "/" | "/pricing" | "/privacy" | "/terms" | "/contact" }
  | { label: string; href: string };

const footerSections: Array<{
  title: string;
  links: FooterLink[];
}> = [
  {
    title: "Workspace",
    links: [
      { label: "Home", to: "/" },
      { label: "Features", href: "#features" },
      { label: "Reviews", href: "#reviews" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

function scrollToHash(href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function RootFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-secondary/35">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <Link className="inline-flex items-center gap-2" to="/">
              <img src="/logo.svg" alt="" className="size-10" />
              <span className="text-sm font-bold leading-none tracking-tight">
                <span className="block text-foreground">Book Your</span>
                <span className="block text-primary font-doodle italic">Yoga Teacher</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Connect with world-class yoga instructors for personalized sessions.
              Book, practice, and grow — at your own pace, on your own schedule.
            </p>
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
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                        href={link.href}
                        onClick={(e) => {
                          if (link.href.startsWith("#")) {
                            e.preventDefault();
                            scrollToHash(link.href);
                          }
                        }}
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
          <p>© {year} Book Your Yoga Teacher. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="https://www.instagram.com/bookyouryogateacher/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="https://www.linkedin.com/company/bookyouryogateacher/about/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="https://www.facebook.com/profile.php?id=61590976971931"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Facebook className="size-4" />
            </a>
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="https://x.com/bookyouryogat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
            >
              <XIcon className="size-4" />
            </a>
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="https://www.youtube.com/@Bookyouryogateacher"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <Youtube className="size-4" />
            </a>
            <a
              className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"
              href="https://wa.me/917982690162"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { site } from "@/data/site";

interface SocialLinksProps {
  tone?: "dark" | "light";
  className?: string;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path d="M15 8.5h-2c-.55 0-1 .45-1 1V12h3l-.4 3h-2.6v7h-3v-7H7v-3h2v-2.2C9 7.6 10.6 6 13 6h2v2.5Z" />
    </svg>
  );
}

export function SocialLinks({ tone = "dark", className = "" }: SocialLinksProps) {
  const color = tone === "light" ? "text-cream" : "text-deep";

  return (
    <div className={`flex items-center gap-5 ${color} ${className}`}>
      <a
        href={site.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Suivre sur Instagram"
        className="inline-flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
      >
        <InstagramIcon />
      </a>
      <a
        href={site.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Suivre sur Facebook"
        className="inline-flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
      >
        <FacebookIcon />
      </a>
    </div>
  );
}

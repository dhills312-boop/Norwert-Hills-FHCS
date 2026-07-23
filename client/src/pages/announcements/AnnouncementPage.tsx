import {
  BookOpen,
  CalendarPlus,
  Check,
  Copy,
  ExternalLink,
  Facebook,
  Flower2,
  Gift,
  Instagram,
  MapPin,
  PlayCircle,
  Printer,
  Twitter,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import MemorialBrandHero from "@/components/MemorialBrandHero";
import { useAnnouncementFonts } from "@/hooks/use-announcement-fonts";
import "@/styles/memorial-brand.css";

interface ServiceDetails {
  viewingDate?: string;
  viewingTime?: string;
  funeralDate?: string;
  funeralTime?: string;
  location?: string;
  locationAddress?: string;
  interment?: string;
  intermentDetails?: string;
}

interface MediaGallery {
  photos?: string[];
  tributeVideoUrls?: string[];
  livestreamUrl?: string;
}

interface AnnouncementData {
  id: string;
  slug: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfBirth?: string;
  dateOfPassing?: string;
  briefObituary?: string;
  fullObituary?: string;
  epitaph?: string;
  serviceDetails?: ServiceDetails;
  portraitImagePath?: string;
  memorialSongUrl?: string;
  mediaGallery?: MediaGallery;
  isPublished: boolean;
}

interface TimelineEvent {
  id: string;
  eventYear: string;
  eventLabel: string;
  eventDescription: string | null;
}

const fallbackPortrait = "/assets/announcements/charles-braud/portrait.webp";

function GoldDivider() {
  return (
    <div className="memorial-divider" aria-hidden="true">
      <span />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="memorial-section-title">{children}</h2>;
}

function ServiceItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="memorial-service-item">
      <p className="memorial-service-label">{label}</p>
      <p className="memorial-service-value">{value}</p>
      {detail && <p className="memorial-service-detail">{detail}</p>}
    </div>
  );
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|live\/)|youtu\.be\/)([^?&/]+)/i,
  );
  return match?.[1] || "";
}

function MediaEmbed({ url, title }: { url: string; title: string }) {
  const youtubeId = getYouTubeId(url);

  if (youtubeId) {
    return (
      <div className="memorial-video-frame">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (url.includes("soundcloud.com")) {
    return (
      <iframe
        className="memorial-audio-frame"
        title={title}
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23c9a96e&auto_play=false&hide_related=true&show_comments=false`}
      />
    );
  }

  if (/\.(mp4|webm|mov)(?:$|\?)/i.test(url)) {
    return (
      <video className="memorial-native-video" controls preload="metadata">
        <source src={url} />
        Your browser does not support this memorial video.
      </video>
    );
  }

  return (
    <a className="memorial-button" href={url} target="_blank" rel="noreferrer">
      <ExternalLink size={15} />
      Open media
    </a>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="memorial-timeline" data-testid="timeline-events">
      {events.map((event) => (
        <div className="memorial-timeline-event" key={event.id}>
          <p className="memorial-timeline-year">{event.eventYear}</p>
          <span className="memorial-timeline-marker" aria-hidden="true" />
          <div>
            <h3>{event.eventLabel}</h3>
            {event.eventDescription && <p>{event.eventDescription}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function FutureAction({
  icon,
  title,
  href,
  availableLabel,
}: {
  icon: React.ReactNode;
  title: string;
  href?: string;
  availableLabel?: string;
}) {
  const content = (
    <>
      <span className="memorial-action-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{href ? availableLabel || "Available" : "Coming soon"}</small>
      </span>
    </>
  );

  if (href) {
    return (
      <Link className="memorial-action" href={href}>
        {content}
      </Link>
    );
  }

  return (
    <div className="memorial-action memorial-action-disabled" aria-disabled="true" title="Coming soon">
      {content}
    </div>
  );
}

function setOrCreateMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  const created = !element;
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
  return () => {
    if (created) element?.remove();
  };
}

export default function AnnouncementPage() {
  useAnnouncementFonts();
  const [, params] = useRoute("/announcements/:slug");
  const slug = params?.slug || "";
  const isPreview = new URLSearchParams(window.location.search).has("preview");
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const endpoint = isPreview
      ? `/api/staff/announcements/preview/${slug}`
      : `/api/public/announcements/${slug}`;

    fetch(endpoint, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Announcement not found");
        return response.json();
      })
      .then((data: AnnouncementData) => {
        setAnnouncement(data);
        const timelineEndpoint = isPreview
          ? `/api/announcements/${data.id}/timeline`
          : `/api/public/announcements/${slug}/timeline`;
        return fetch(timelineEndpoint, { credentials: "include" });
      })
      .then((response) => (response.ok ? response.json() : []))
      .then((events) => setTimelineEvents(Array.isArray(events) ? events : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isPreview, slug]);

  useEffect(() => {
    if (!announcement || isPreview) return;
    const fullName = `${announcement.deceasedFirstName} ${announcement.deceasedLastName}`;
    const pageUrl = `https://www.thenhfcs.com/announcements/${slug}`;
    const previousTitle = document.title;
    document.title = `In Loving Memory of ${fullName} | Norwert Hills`;

    const cleanupDescription = setOrCreateMeta('meta[name="description"]', {
      name: "description",
      content:
        announcement.briefObituary ||
        `View service details and share memories in honor of ${fullName}.`,
    });
    const cleanupOgTitle = setOrCreateMeta('meta[property="og:title"]', {
      property: "og:title",
      content: `In Loving Memory of ${fullName}`,
    });
    const cleanupOgImage = announcement.portraitImagePath
      ? setOrCreateMeta('meta[property="og:image"]', {
          property: "og:image",
          content: new URL(announcement.portraitImagePath, window.location.origin).href,
        })
      : () => undefined;

    const service = announcement.serviceDetails || {};
    const person: Record<string, unknown> = {
      "@type": "Person",
      name: fullName,
      ...(announcement.dateOfBirth ? { birthDate: announcement.dateOfBirth } : {}),
      ...(announcement.dateOfPassing ? { deathDate: announcement.dateOfPassing } : {}),
      ...(announcement.briefObituary ? { description: announcement.briefObituary } : {}),
      ...(announcement.portraitImagePath
        ? { image: new URL(announcement.portraitImagePath, window.location.origin).href }
        : {}),
    };
    const graph: unknown[] = [person];

    if (service.funeralDate && service.location) {
      graph.push({
        "@type": "Event",
        name: `Funeral Service for ${fullName}`,
        startDate: service.funeralDate,
        about: { "@type": "Person", name: fullName },
        organizer: {
          "@type": "Organization",
          name: "Norwert Hills Funeral & Cremation Services",
          url: "https://www.thenhfcs.com",
        },
        location: {
          "@type": "Place",
          name: service.location,
          ...(service.locationAddress ? { address: service.locationAddress } : {}),
        },
        url: pageUrl,
      });
    }

    const script = document.createElement("script");
    script.id = "announcement-structured-data";
    script.type = "application/ld+json";
    script.text = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(script);

    return () => {
      document.title = previousTitle;
      cleanupDescription();
      cleanupOgTitle();
      cleanupOgImage();
      script.remove();
    };
  }, [announcement, isPreview, slug]);

  if (loading) {
    return (
      <div className="memorial-state">
        <img src="/assets/logo-crest.png" alt="" />
        <p>Preparing Memorial</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="memorial-state">
        <img src="/assets/logo-crest.png" alt="" />
        <p>Memorial Not Found</p>
        <Link href="/">Return home</Link>
      </div>
    );
  }

  const service = announcement.serviceDetails || {};
  const gallery = announcement.mediaGallery || {};
  const fullName = `${announcement.deceasedFirstName} ${announcement.deceasedLastName}`;
  const showPreviewBanner = isPreview && !announcement.isPublished;

  const copyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  };

  const share = (platform: "facebook" | "instagram" | "x") => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`In Loving Memory of ${fullName}`);
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, "_blank", "noopener,noreferrer");
      return;
    }
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    });
  };

  const getDirections = () => {
    if (!service.locationAddress) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.locationAddress)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const addToCalendar = () => {
    if (!service.funeralDate) return;
    const compactDate = service.funeralDate.replace(/[-:]/g, "");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${compactDate}`,
      `DTEND:${compactDate}`,
      `SUMMARY:Funeral Service - ${fullName}`,
      `DESCRIPTION:Funeral service at ${service.location || "To be announced"}`,
      `LOCATION:${service.locationAddress || service.location || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    const href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = href;
    link.download = `${announcement.slug}-service.ics`;
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <main className="memorial-page">
      {showPreviewBanner && <div className="memorial-preview-banner">Staff Preview - Not Yet Published</div>}

      <div className="memorial-shell" style={{ paddingTop: showPreviewBanner ? "36px" : 0 }}>
        <MemorialBrandHero
          firstName={announcement.deceasedFirstName}
          lastName={announcement.deceasedLastName}
          portraitSrc={announcement.portraitImagePath || fallbackPortrait}
          dateOfBirth={announcement.dateOfBirth}
          dateOfPassing={announcement.dateOfPassing}
          epitaph={announcement.epitaph}
        />

        <div className="print-only hidden">
          <h1>{fullName}</h1>
          <p>{[announcement.dateOfBirth, announcement.dateOfPassing].filter(Boolean).join(" - ")}</p>
        </div>

        <div className="memorial-content announcement-print-content">
          {(service.viewingDate || service.funeralDate || service.location || service.interment) && (
            <section data-testid="section-service-info">
              <GoldDivider />
              <SectionTitle>Service Information</SectionTitle>
              <div className="memorial-service-grid">
                {service.viewingDate && (
                  <ServiceItem label="Viewing" value={service.viewingDate} detail={service.viewingTime} />
                )}
                {service.funeralDate && (
                  <ServiceItem label="Funeral Service" value={service.funeralDate} detail={service.funeralTime} />
                )}
                {service.location && (
                  <ServiceItem label="Location" value={service.location} detail={service.locationAddress} />
                )}
                {service.interment && (
                  <ServiceItem label="Interment" value={service.interment} detail={service.intermentDetails} />
                )}
              </div>
              <div className="memorial-command-row" data-print-hidden>
                {service.locationAddress && (
                  <button className="memorial-button memorial-button-primary" onClick={getDirections}>
                    <MapPin size={15} />
                    Directions
                  </button>
                )}
                {service.funeralDate && (
                  <button className="memorial-button" onClick={addToCalendar}>
                    <CalendarPlus size={15} />
                    Add Reminder
                  </button>
                )}
              </div>
            </section>
          )}

          {timelineEvents.length > 0 && (
            <section>
              <GoldDivider />
              <SectionTitle>Life Events</SectionTitle>
              <Timeline events={timelineEvents} />
            </section>
          )}

          {announcement.memorialSongUrl && (
            <section data-testid="section-music" data-print-hidden>
              <GoldDivider />
              <SectionTitle>Musical Selection</SectionTitle>
              <div className="memorial-media-section">
                <MediaEmbed url={announcement.memorialSongUrl} title={`Musical selection for ${fullName}`} />
              </div>
            </section>
          )}

          {announcement.briefObituary && (
            <section data-testid="section-obituary">
              <GoldDivider />
              <SectionTitle>Obituary</SectionTitle>
              <div className="memorial-obituary">
                {announcement.briefObituary.split("\n").map((paragraph, index) => (
                  <p key={`${paragraph.slice(0, 20)}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          <section data-print-hidden>
            <GoldDivider />
            <SectionTitle>Remember &amp; Honor</SectionTitle>
            <div className="memorial-actions">
              <FutureAction
                icon={<BookOpen size={20} />}
                title="Guestbook"
                href={announcement.fullObituary ? `/obituaries/${announcement.slug}` : undefined}
                availableLabel="Share a memory"
              />
              <FutureAction icon={<Flower2 size={20} />} title="Send Flowers" />
              <FutureAction icon={<Gift size={20} />} title="Memorial Gifts" />
            </div>
          </section>

          {gallery.photos && gallery.photos.length > 0 && (
            <section data-testid="section-gallery">
              <GoldDivider />
              <SectionTitle>Photo Gallery</SectionTitle>
              <div className="memorial-gallery">
                {gallery.photos.map((photo, index) => (
                  <button
                    className="memorial-gallery-image"
                    key={`${photo}-${index}`}
                    onClick={() => setLightboxPhoto(photo)}
                    aria-label={`Open memorial photo ${index + 1}`}
                  >
                    <img src={photo} alt={`${fullName} memorial photo ${index + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {gallery.tributeVideoUrls && gallery.tributeVideoUrls.length > 0 && (
            <section data-testid="section-tribute-videos" data-print-hidden>
              <GoldDivider />
              <SectionTitle>Tribute Videos</SectionTitle>
              <div className="memorial-media-stack">
                {gallery.tributeVideoUrls.map((videoUrl, index) => (
                  <MediaEmbed key={`${videoUrl}-${index}`} url={videoUrl} title={`${fullName} tribute ${index + 1}`} />
                ))}
              </div>
            </section>
          )}

          {gallery.livestreamUrl && (
            <section data-testid="section-livestream" data-print-hidden>
              <GoldDivider />
              <div className="memorial-media-heading">
                <PlayCircle size={20} />
                <SectionTitle>Service Video</SectionTitle>
              </div>
              <div className="memorial-media-section">
                <MediaEmbed url={gallery.livestreamUrl} title={`${fullName} service`} />
              </div>
            </section>
          )}

          <section className="memorial-share" data-testid="section-share" data-print-hidden>
            <GoldDivider />
            <SectionTitle>Share This Memorial</SectionTitle>
            <div className="memorial-command-row">
              <button className="memorial-button" onClick={() => share("facebook")} aria-label="Share on Facebook">
                <Facebook size={16} />
                Facebook
              </button>
              <button className="memorial-button" onClick={() => share("instagram")} aria-label="Share on Instagram">
                <Instagram size={16} />
                Instagram
              </button>
              <button className="memorial-button" onClick={() => share("x")} aria-label="Share on X">
                <Twitter size={16} />
                X
              </button>
              <button className="memorial-button" onClick={copyLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
              <button className="memorial-button" onClick={() => window.print()}>
                <Printer size={16} />
                Print
              </button>
            </div>
          </section>

          <footer className="memorial-footer">
            <img src="/assets/logo-crest.png" alt="Norwert Hills crest" />
            <p>"Well done, good and faithful servant."</p>
            <address>
              Norwert Hills Funeral &amp; Cremation Services
              <br />
              1601 W. Thomas St., Hammond, LA 70401
            </address>
          </footer>
        </div>
      </div>

      {lightboxPhoto && (
        <div
          className="memorial-lightbox"
          onClick={() => setLightboxPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Memorial photo"
        >
          <button onClick={() => setLightboxPhoto(null)} aria-label="Close photo">
            <X size={20} />
          </button>
          <img src={lightboxPhoto} alt={`${fullName} memorial`} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </main>
  );
}

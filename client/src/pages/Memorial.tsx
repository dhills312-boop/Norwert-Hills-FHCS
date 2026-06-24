import { CalendarPlus, Copy, ExternalLink, Facebook, Instagram, MapPin, PlayCircle } from "lucide-react";
import { useRoute } from "wouter";
import NotFound from "@/pages/not-found";
import { getMemorial } from "@/lib/memorials";
import { Button } from "@/components/ui/button";

const accentStyles = {
  gold: "rgba(201,169,110,0.35)",
  rose: "rgba(196,95,130,0.35)",
  violet: "rgba(141,106,184,0.35)",
  blue: "rgba(59,127,191,0.35)",
};

function copyLink() {
  void navigator.clipboard?.writeText(window.location.href);
}

function directionsUrl(address?: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "1601 W Thomas St Hammond LA 70401")}`;
}

function createCalendarFile(memorial: NonNullable<ReturnType<typeof getMemorial>>) {
  const parsedDate = memorial.serviceDate && Date.parse(`${memorial.serviceDate} ${memorial.serviceTime || "10:00 AM"}`);

  if (!parsedDate || Number.isNaN(parsedDate)) return;

  const start = new Date(parsedDate);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:Memorial Service - ${memorial.name}`,
    `DESCRIPTION:Norwert Hills Funeral and Cremation Services memorial for ${memorial.name}`,
    `LOCATION:${memorial.venue || ""}${memorial.address ? `, ${memorial.address}` : ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${memorial.slug}-memorial.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

function shareUrl(platform: "facebook" | "instagram") {
  const url = encodeURIComponent(window.location.href);
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  return `https://www.instagram.com/`;
}

export default function Memorial() {
  const [, params] = useRoute("/memorials/:slug");
  const memorial = getMemorial(params?.slug);

  if (!memorial) return <NotFound />;

  const accent = accentStyles[memorial.accent || "gold"];

  return (
    <main className="min-h-screen bg-[#09070c] text-[#f5f0e8]">
      <div
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: "url('/assets/texture-marble.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        className="fixed inset-0"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${accent}, transparent 34%), radial-gradient(circle at 50% 70%, rgba(201,169,110,0.16), transparent 42%)`,
        }}
      />

      <section className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-16 pt-10">
        <header className="flex items-center justify-center gap-3 text-center">
          <img src="/assets/logo-crest.png" alt="Norwert Hills crest" className="h-14 w-14 object-contain" />
          <div>
            <p className="font-serif text-xl uppercase tracking-[0.22em] text-primary">Norwert Hills</p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-primary/70">Funeral and Cremation Services</p>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="relative aspect-square rounded-full border border-primary/25 p-4 shadow-[0_0_80px_rgba(201,169,110,0.12)]">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-primary/30 bg-black">
                <img
                  src={memorial.image}
                  alt={memorial.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: memorial.imagePosition || "center" }}
                />
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="mb-4 text-xs uppercase tracking-[0.38em] text-primary/80">
              {memorial.honorific ? `${memorial.honorific} | ` : ""}In Loving Memory
            </p>
            <h1 className="font-serif text-5xl leading-tight text-[#f8f1e7] md:text-7xl">{memorial.name}</h1>
            {memorial.lifeDates && (
              <p className="mt-4 text-sm uppercase tracking-[0.24em] text-primary/85">{memorial.lifeDates}</p>
            )}
            <p className="mx-auto mt-8 max-w-2xl font-serif text-xl italic leading-8 text-[#f5f0e8]/70 lg:mx-0">
              "{memorial.scripture || "Forever loved, forever remembered."}"
            </p>

            <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
              {memorial.serviceDate && <Detail label="Date" value={memorial.serviceDate} />}
              {memorial.viewing && <Detail label="Public Viewing" value={memorial.viewing} />}
              {memorial.serviceTime && <Detail label="Service" value={memorial.serviceTime} />}
              {memorial.venue && <Detail label="Location" value={memorial.venue} />}
              {memorial.address && <Detail label="Address" value={memorial.address} />}
              {memorial.officiant && <Detail label="Officiant" value={memorial.officiant} />}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <a href={directionsUrl(memorial.address)} target="_blank" rel="noreferrer">
                  <MapPin className="mr-2 h-4 w-4" /> Directions
                </a>
              </Button>
              {memorial.serviceDate && (
                <Button
                  onClick={() => createCalendarFile(memorial)}
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary/10"
                >
                  <CalendarPlus className="mr-2 h-4 w-4" /> Add Reminder
                </Button>
              )}
              <Button onClick={copyLink} variant="outline" className="border-white/15 text-[#f5f0e8] hover:bg-white/10">
                <Copy className="mr-2 h-4 w-4" /> Copy Link
              </Button>
            </div>
          </div>
        </div>

        {memorial.youtubeEmbedUrl && (
          <section className="mx-auto mb-10 w-full max-w-4xl border-y border-primary/20 py-10">
            <div className="mb-6 flex items-center justify-center gap-3 text-primary">
              <PlayCircle className="h-5 w-5" />
              <h2 className="text-center text-xs uppercase tracking-[0.38em]">Full Service</h2>
            </div>
            <div className="overflow-hidden border border-primary/20 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <iframe
                className="aspect-video w-full"
                src={memorial.youtubeEmbedUrl}
                title={`${memorial.name} full service`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            {memorial.youtubeUrl && (
              <div className="mt-5 text-center">
                <Button asChild variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                  <a href={memorial.youtubeUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Watch on YouTube
                  </a>
                </Button>
              </div>
            )}
          </section>
        )}

        <section className="mx-auto w-full max-w-3xl border-y border-primary/20 py-10">
          <h2 className="mb-6 text-center text-xs uppercase tracking-[0.38em] text-primary">Obituary</h2>
          <p className="font-serif text-xl leading-9 text-[#f5f0e8]/72">{memorial.obituary}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-primary/50">{memorial.sourceNote}</p>
        </section>

        <footer className="pt-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/60">Share this memorial</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild size="icon" variant="outline" className="border-primary/30 text-primary" aria-label="Share on Facebook">
              <a href={shareUrl("facebook")} target="_blank" rel="noreferrer">
                <Facebook className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="icon" variant="outline" className="border-primary/30 text-primary" aria-label="Open Instagram">
              <a href={shareUrl("instagram")} target="_blank" rel="noreferrer">
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </footer>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-primary/15 bg-white/[0.03] p-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-primary/70">{label}</p>
      <p className="mt-2 font-serif text-lg leading-6 text-[#f5f0e8]/85">{value}</p>
    </div>
  );
}

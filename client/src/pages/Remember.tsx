import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Search, ArrowRight, User } from "lucide-react";
import type { PortraitCrop } from "@shared/schema";
import { portraitCropStyle } from "@/lib/portrait-crop";
import { getRememberPortrait, type RememberPortrait } from "@/lib/remember-portraits";

type PublishedAnnouncement = {
  slug: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfBirth: string | null;
  dateOfPassing: string | null;
  briefObituary: string | null;
  portraitImagePath: string | null;
  mediaGallery?: { portraitCrop?: PortraitCrop } | null;
};

function PortraitStage({
  portrait,
  fullName,
  crop,
  compact = false,
}: {
  portrait: RememberPortrait | null;
  fullName: string;
  crop?: PortraitCrop;
  compact?: boolean;
}) {
  if (!portrait) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary">
        <User className={compact ? "w-5 h-5 text-muted-foreground/40" : "w-16 h-16 text-muted-foreground/30"} />
      </div>
    );
  }

  if (portrait.mode === "photo") {
    return (
      <img
        src={portrait.src}
        alt={fullName}
        className="w-full h-full object-cover"
        style={portraitCropStyle(crop)}
        loading="lazy"
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#080909]">
      <div className="absolute inset-0 bg-[url('/assets/texture-marble.webp')] bg-cover opacity-[0.07]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(201,169,110,0.16),transparent_55%)]" />
      <div
        className={compact
          ? "absolute left-1/2 top-1/2 h-[82%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25"
          : "absolute left-1/2 top-[12%] w-[82%] aspect-square -translate-x-1/2 rounded-full border border-primary/25 shadow-[0_0_50px_rgba(201,169,110,0.08)]"}
      />
      <img
        src={portrait.src}
        alt={fullName}
        className={portrait.mode === "crest"
          ? "absolute inset-0 w-full h-full object-contain object-center"
          : "absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-[0_18px_26px_rgba(0,0,0,0.48)]"}
        style={{
          transform: `translateY(${portrait.offsetY}%) scale(${portrait.scale})`,
          transformOrigin: portrait.mode === "crest" ? "50% 50%" : "50% 100%",
        }}
        loading="lazy"
      />
      {!compact && <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-[#080909] to-transparent" />}
    </div>
  );
}
function MemorialCard({ item, index }: { item: PublishedAnnouncement; index: number }) {
  const fullName = `${item.deceasedFirstName} ${item.deceasedLastName}`;
  const dates = [item.dateOfBirth, item.dateOfPassing].filter(Boolean).join(" – ");
  const portrait = getRememberPortrait(item.slug, item.portraitImagePath);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
    >
      <Link href={`/announcements/${item.slug}`} data-testid={`card-memorial-${item.slug}`}>
        <div className="group relative flex flex-col overflow-hidden bg-card border border-white/8 hover:border-primary/30 transition-all duration-500 cursor-pointer h-full">
          <div className="relative aspect-[3/4] overflow-hidden bg-background flex-shrink-0">
            <PortraitStage
              portrait={portrait}
              fullName={fullName}
              crop={item.mediaGallery?.portraitCrop}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>

          <div className="p-6 flex flex-col gap-3 flex-grow">
            <div className="w-8 h-[1px] bg-primary/60" />
            <h3 className="font-serif text-xl text-foreground leading-snug">{fullName}</h3>
            {dates && (
              <p className="text-xs text-muted-foreground tracking-wide font-light">{dates}</p>
            )}
            {item.briefObituary && (
              <p className="text-sm text-muted-foreground/80 font-light leading-relaxed line-clamp-3 flex-grow">
                {item.briefObituary}
              </p>
            )}
            <div className="flex items-center gap-2 text-primary text-xs tracking-widest uppercase mt-2 group-hover:gap-3 transition-all">
              View Memorial <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Remember() {
  const [search, setSearch] = useState("");

  const { data: announcements = [], isLoading } = useQuery<PublishedAnnouncement[]>({
    queryKey: ["/api/public/announcements"],
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return announcements;
    const q = search.toLowerCase();
    return announcements.filter((a) =>
      `${a.deceasedFirstName} ${a.deceasedLastName}`.toLowerCase().includes(q)
    );
  }, [announcements, search]);

  const recent = filtered.slice(0, 3);
  const archive = filtered.slice(3);

  return (
    <PublicLayout>
      <section className="relative pt-40 pb-24 min-h-[420px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          <div className="absolute inset-0 bg-[url('/assets/texture-marble.webp')] opacity-5 mix-blend-overlay" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mx-auto w-10 h-[1px] bg-primary mb-8" />
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground tracking-tight mb-6">
              Remembering Lives
            </h1>
            <p className="text-muted-foreground font-light text-lg mb-12 max-w-xl mx-auto leading-relaxed">
              A curated space to honor those who have passed through our care — preserving their stories, service details, and the love of those they left behind.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-secondary border border-white/10 focus:border-primary/50 pl-11 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-colors"
                data-testid="input-memorial-search"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {isLoading ? (
        <section className="py-16 container mx-auto px-6 text-center text-muted-foreground">
          Loading memorials…
        </section>
      ) : filtered.length === 0 ? (
        <section className="py-16 container mx-auto px-6 text-center">
          <p className="text-muted-foreground font-light">
            {search ? `No memorials found matching "${search}"` : "No memorials have been published yet."}
          </p>
        </section>
      ) : (
        <>
          {recent.length > 0 && (
            <section className="py-16 bg-background">
              <div className="container mx-auto px-6">
                <div className="mb-12">
                  <span className="text-primary text-xs uppercase tracking-[0.3em] mb-3 block">Recent</span>
                  <h2 className="font-serif text-3xl text-foreground">Recent Memorials</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {recent.map((item, i) => (
                    <MemorialCard key={item.slug} item={item} index={i} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {archive.length > 0 && (
            <section className="py-16 bg-card border-t border-white/5">
              <div className="container mx-auto px-6">
                <div className="mb-10">
                  <span className="text-primary text-xs uppercase tracking-[0.3em] mb-3 block">Archive</span>
                  <h2 className="font-serif text-2xl text-foreground">All Memorials</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {archive.map((item, i) => {
                    const fullName = `${item.deceasedFirstName} ${item.deceasedLastName}`;
                    const portrait = getRememberPortrait(item.slug, item.portraitImagePath);
                    return (
                      <motion.div
                        key={item.slug}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.04 }}
                      >
                        <Link
                          href={`/announcements/${item.slug}`}
                          data-testid={`link-archive-${item.slug}`}
                          className="flex items-center justify-between py-5 group hover:bg-background/40 px-2 -mx-2 transition-colors"
                        >
                          <div className="flex items-center gap-5">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
                              <PortraitStage portrait={portrait} fullName={fullName} crop={item.mediaGallery?.portraitCrop} compact />
                            </div>
                            <div>
                              <p className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{fullName}</p>
                              {item.dateOfPassing && (
                                <p className="text-xs text-muted-foreground mt-0.5">{item.dateOfPassing}</p>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <section className="py-20 border-t border-white/5 bg-background">
        <div className="container mx-auto px-6 text-center max-w-xl">
          <p className="text-muted-foreground font-light text-sm leading-relaxed">
            These memorial pages are provided by Norwert Hills Funeral &amp; Cremation Services as a lasting tribute to the families we have served.
            If you have a loved one memorialized here and wish to make changes, please{" "}
            <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}

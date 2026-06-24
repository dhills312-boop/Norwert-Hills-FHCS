import { useRoute } from "wouter";
import NotFound from "@/pages/not-found";
import { getMemorial } from "@/lib/memorials";

export default function SocialFlyer() {
  const [, params] = useRoute("/social/flyer/:slug");
  const memorial = getMemorial(params?.slug);
  const query = new URLSearchParams(window.location.search);
  const format = query.get("format") === "story" ? "story" : "square";
  const exportMode = query.get("export") === "1";

  if (!memorial) return <NotFound />;

  const portrait = memorial.socialImage || memorial.image;
  const isStory = format === "story";
  const frameClass = isStory
    ? "h-[min(1920px,100vh)] aspect-[9/16]"
    : "aspect-square w-[min(1080px,100vw)]";
  const shellClass = exportMode
    ? "flex min-h-screen items-center justify-center overflow-hidden bg-[#09070c] text-[#f5f0e8]"
    : "flex min-h-screen items-center justify-center bg-neutral-950 p-8 text-[#f5f0e8]";

  return (
    <main className={shellClass}>
      <div className={`${frameClass} overflow-hidden bg-[#09070c] ${exportMode ? "" : "shadow-2xl"}`}>
        <div
          className={`relative flex h-full flex-col items-center justify-between text-center ${
            isStory ? "p-[8.5%]" : "p-[5.8%]"
          }`}
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 35%, rgba(201,169,110,0.18), transparent 36%), url('/assets/texture-marble.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#09070c]/78" />
          <div className={`relative z-10 flex items-center gap-3 ${isStory ? "mt-2" : ""}`}>
            <img
              src="/assets/logo-crest.png"
              alt="Norwert Hills crest"
              className={`${isStory ? "h-20 w-20" : "h-16 w-16"} object-contain`}
            />
            <div className="text-left">
              <p className={`${isStory ? "text-3xl" : "text-2xl"} font-serif uppercase tracking-[0.2em] text-primary`}>
                Norwert Hills
              </p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-primary/75">
                Funeral and Cremation Services
              </p>
            </div>
          </div>

          <div className={`relative z-10 w-full ${isStory ? "mt-10" : ""}`}>
            <div
              className={`mx-auto overflow-hidden rounded-full border-2 border-primary/45 bg-gradient-to-b from-[#2a2019] to-[#09070c] p-2 ${
                isStory ? "mb-12 aspect-square w-[64%]" : "mb-8 aspect-square w-[40%]"
              }`}
            >
              <img
                src={portrait}
                alt={memorial.name}
                className={`h-full w-full rounded-full ${memorial.socialImage ? "object-contain" : "object-cover"}`}
                style={{ objectPosition: memorial.imagePosition || "center" }}
              />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary/85">In Loving Memory</p>
            <h1
              className={`mx-auto mt-4 max-w-[88%] font-serif leading-[0.95] text-[#f8f1e7] ${
                isStory ? "text-[76px]" : "text-[clamp(44px,7vw,86px)]"
              }`}
            >
              {memorial.name}
            </h1>
            {memorial.lifeDates && (
              <p className={`${isStory ? "mt-7 text-2xl" : "mt-5 text-lg"} uppercase tracking-[0.18em] text-primary/85`}>
                {memorial.lifeDates}
              </p>
            )}
          </div>

          <div className={`relative z-10 w-full border-t border-primary/25 ${isStory ? "pt-10" : "pt-7"}`}>
            <p className={`font-serif text-[#f5f0e8]/90 ${isStory ? "text-[40px]" : "text-[clamp(22px,3vw,34px)]"}`}>
              {memorial.serviceDate || "Service details forthcoming"}
            </p>
            <p className={`${isStory ? "mt-4 text-3xl" : "mt-2 text-xl"} text-[#f5f0e8]/75`}>
              {[memorial.viewing && `Viewing ${memorial.viewing}`, memorial.serviceTime && `Service ${memorial.serviceTime}`]
                .filter(Boolean)
                .join(" | ")}
            </p>
            {memorial.venue && (
              <p className={`${isStory ? "mt-8 text-2xl" : "mt-4 text-lg"} uppercase tracking-[0.16em] text-primary`}>
                {memorial.venue}
              </p>
            )}
            {memorial.address && (
              <p className={`${isStory ? "mt-4 text-lg" : "mt-2 text-sm"} uppercase tracking-[0.12em] text-[#f5f0e8]/65`}>
                {memorial.address}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

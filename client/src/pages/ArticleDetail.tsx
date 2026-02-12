import { PublicLayout } from "@/components/layout/PublicLayout";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Clock, Calendar } from "lucide-react";

const articles: Record<string, { 
  title: string; 
  category: string; 
  date: string; 
  readTime: string; 
  image: string; 
  content: React.ReactNode 
}> = {
  "understanding-cremation": {
    title: "Understanding Cremation: A Guide for Families",
    category: "Planning",
    date: "Feb 12, 2026",
    readTime: "5 min read",
    image: "/assets/texture-marble.png",
    content: (
      <>
        <p className="lead text-xl md:text-2xl font-serif text-muted-foreground mb-8 font-light leading-relaxed">
          Cremation is a choice made by many families for deeply personal reasons. Whether guided by tradition, faith, simplicity, or personal values, understanding the cremation process can help families make informed and confident decisions during a difficult time.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">What cremation is</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          Cremation is a dignified process in which the body is respectfully cared for and reduced to cremated remains through controlled heat. These remains are returned to the family in an urn or temporary container and may be kept, buried, scattered, or memorialized according to the family’s wishes and local regulations.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">Cremation with or without ceremony</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          Cremation does not eliminate the opportunity for meaningful remembrance. Families may choose a traditional service with viewing before cremation, a memorial service afterward, or a private gathering. Some families prefer simplicity, while others incorporate religious or cultural traditions.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">Timing and considerations</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          Cremation allows flexibility in timing. Services may take place days or even weeks later, giving families time to gather, plan, and reflect. This flexibility can be especially helpful when loved ones are traveling or when planning a personalized memorial.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">Personalization options</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          Cremation offers many ways to honor a life, including memorial services, customized urns, keepsakes, scattering ceremonies, and commemorative events. Each choice can reflect the personality, values, and legacy of the individual being remembered.
        </p>
        <div className="bg-secondary/20 p-8 rounded-lg mt-12 border border-white/5">
          <p className="italic text-lg text-center font-serif text-muted-foreground">
            There is no “right” or “wrong” choice. Cremation is one of many respectful options available, and our role is to help families understand each step at their own pace.
          </p>
        </div>
        <p className="mt-8 font-light leading-relaxed text-muted-foreground">
          If you have questions about cremation or would like guidance, we are always available to talk.
        </p>
      </>
    )
  },
  "bespoke-memorials": {
    title: "The Art of the Bespoke Memorial",
    category: "Honoring",
    date: "Feb 10, 2026",
    readTime: "4 min read",
    image: "/assets/hero-chapel.png",
    content: (
      <>
        <p className="lead text-xl md:text-2xl font-serif text-muted-foreground mb-8 font-light leading-relaxed">
          A memorial is more than a service. It is a reflection of a life lived, relationships formed, and memories held by family and friends. A bespoke memorial allows space for authenticity, meaning, and quiet beauty.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">What “bespoke” means in memorials</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          A bespoke memorial is thoughtfully tailored. It may reflect a person’s passions, values, cultural heritage, faith, or sense of place. There is no template — only intention.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">Elements of a personalized tribute</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          Personalized memorials can include music, readings, imagery, symbolic objects, or unique settings. Some families choose traditional elements; others prefer something understated and modern. Both approaches can be equally meaningful.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">Environment and atmosphere</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          The setting matters. Light, space, sound, and pacing all shape how a memorial feels. Whether held in a chapel, outdoor setting, or private venue, the goal is comfort, reflection, and presence.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">Honoring without excess</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          A meaningful memorial does not need to be elaborate. Often, simplicity allows stories, emotions, and shared remembrance to take center stage.
        </p>
        <div className="bg-secondary/20 p-8 rounded-lg mt-12 border border-white/5">
          <p className="italic text-lg text-center font-serif text-muted-foreground">
            We believe the most powerful memorials are those that feel honest and unforced — shaped gently, with care, and aligned with the family’s wishes.
          </p>
        </div>
      </>
    )
  },
  "planning-ahead": {
    title: "Planning Ahead: The Gift of Peace",
    category: "Guidance",
    date: "Feb 08, 2026",
    readTime: "5 min read",
    image: "/assets/staff-interaction.png",
    content: (
      <>
        <p className="lead text-xl md:text-2xl font-serif text-muted-foreground mb-8 font-light leading-relaxed">
          Planning ahead is an act of care. It allows individuals to express their wishes clearly and offers loved ones guidance during an emotional time.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">Why people choose to plan ahead</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          Pre-planning can reduce uncertainty, ease emotional strain, and ensure personal preferences are respected. For many, it brings peace of mind knowing arrangements are in place.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">What planning ahead can include</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          Planning may involve selecting burial or cremation preferences, ceremony style, music, readings, or personal notes. It does not require final decisions — only thoughtful direction.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">Flexibility over time</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          Plans can be updated as circumstances or wishes change. Pre-planning is not about locking in details; it is about starting a conversation.
        </p>
        <h3 className="text-2xl font-serif text-foreground mt-12 mb-4">A gift to loved ones</h3>
        <p className="mb-6 font-light leading-relaxed text-muted-foreground">
          When arrangements are thoughtfully outlined, families are freed to focus on remembrance rather than logistics. Many describe this as a final act of generosity.
        </p>
        <div className="bg-secondary/20 p-8 rounded-lg mt-12 border border-white/5">
          <p className="italic text-lg text-center font-serif text-muted-foreground">
            Planning ahead is a personal choice. Whether detailed or simple, it is always guided by care, respect, and intention.
          </p>
        </div>
      </>
    )
  }
};

export default function ArticleDetail() {
  const [match, params] = useRoute("/resources/article/:id");
  const slug = params?.id || "understanding-cremation";
  const article = articles[slug];

  if (!article) {
    return (
      <PublicLayout>
        <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-4xl mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you are looking for does not exist.</p>
            <Link href="/resources">
              <Button variant="outline">Return to Resources</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl">
          <Link href="/resources">
            <a className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 text-xs uppercase tracking-widest transition-colors cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
            </a>
          </Link>

          <div className="mb-8 mt-8">
             <span className="text-primary text-xs uppercase tracking-widest px-3 py-1 border border-primary/20 rounded-full">
                {article.category}
             </span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 text-foreground leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-muted-foreground text-sm mb-12 border-b border-white/5 pb-8">
             <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {article.date}</span>
             <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {article.readTime}</span>
             <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground hover:text-foreground">
               <Share2 className="w-4 h-4 mr-2" /> Share
             </Button>
          </div>

          <div className="aspect-[21/9] w-full overflow-hidden mb-12 rounded-sm border border-white/5">
             <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
             {article.content}
          </div>
          
          <div className="mt-20 pt-10 border-t border-white/10 text-center">
             <h3 className="font-serif text-2xl mb-4">Need personalized guidance?</h3>
             <p className="text-muted-foreground mb-8 font-light">
               If you have questions or would like guidance, we are always available to talk.
             </p>
             <Link href="/contact">
               <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase text-xs tracking-widest">
                 Contact a Director
               </Button>
             </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

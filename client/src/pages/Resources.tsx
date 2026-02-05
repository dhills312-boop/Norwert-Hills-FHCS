
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Heart, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const articles = [
  {
    title: "Understanding Cremation: A Guide for Families",
    excerpt: "Exploring the process, options, and considerations when choosing cremation for a loved one.",
    category: "Planning",
    readTime: "6 min read",
    image: "/assets/texture-marble.png"
  },
  {
    title: "The Art of the Bespoke Memorial",
    excerpt: "How to craft a tribute that truly reflects the unique spirit and legacy of an individual.",
    category: "Honoring",
    readTime: "8 min read",
    image: "/assets/hero-chapel.png"
  },
  {
    title: "Planning Ahead: The Gift of Peace",
    excerpt: "The emotional and practical benefits of pre-planning funeral services.",
    category: "Guidance",
    readTime: "5 min read",
    image: "/assets/staff-interaction.png"
  }
];

export default function Resources() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-background relative overflow-hidden min-h-screen">
        <div className="absolute top-0 right-0 w-1/3 h-[50vh] bg-[url('/assets/texture-marble.png')] opacity-10 mix-blend-overlay z-0" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">Guidance & Support</span>
            <h1 className="font-serif text-5xl md:text-6xl mb-6">Educational Resources</h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              We provide these resources to help you navigate one of life's most challenging transitions with clarity and peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {articles.map((article, index) => (
              <motion.article 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden mb-6 relative rounded-sm border border-white/5">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/80 backdrop-blur-md text-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-[10px] uppercase tracking-widest mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                </div>
                <h2 className="font-serif text-2xl group-hover:text-primary transition-colors mb-4">{article.title}</h2>
                <p className="text-muted-foreground text-sm font-light leading-relaxed mb-6">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-primary text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" />
                </span>
              </motion.article>
            ))}
          </div>

          <section className="bg-secondary/30 rounded-lg p-12 border border-white/5 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mb-32 -mr-32" />
            <div className="max-w-2xl relative z-10">
              <h2 className="font-serif text-3xl mb-6">A Guide to Cremation Services</h2>
              <div className="prose prose-invert prose-sm text-muted-foreground font-light leading-loose space-y-4">
                <p>
                  Cremation has become an increasingly chosen option for families seeking flexibility and personalization. At Norwert Hills, we approach cremation with the same dignity and ceremonial weight as a traditional burial.
                </p>
                <p>
                  <strong>The Process:</strong> Cremation is a clean and respectful process where the body is reduced to bone fragments through high-temperature thermal processing. These fragments are then processed into fine particles, often referred to as cremated remains.
                </p>
                <p>
                  <strong>Options for Honoring:</strong> Choosing cremation does not mean you must forego a traditional ceremony. Many families choose to have a full funeral service with the body present before cremation, or a memorial service with the urn as the focal point.
                </p>
                <p>
                  <strong>Final Disposition:</strong> Families may choose to keep the urn in a private residence, place it in a columbarium niche, bury it in a family plot, or scatter the remains in a location of special significance.
                </p>
              </div>
              <Button variant="outline" className="mt-8 border-primary/30 text-primary hover:bg-primary/10 uppercase text-xs tracking-widest">
                Download Comprehensive Guide
              </Button>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

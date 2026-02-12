import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Heart, Clock, Download, HelpCircle, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const articles = [
  {
    title: "Understanding Cremation: A Guide for Families",
    excerpt: "Exploring the process, options, and considerations when choosing cremation for a loved one.",
    category: "Planning",
    readTime: "6 min read",
    image: "/assets/texture-marble.png",
    id: "understanding-cremation"
  },
  {
    title: "The Art of the Bespoke Memorial",
    excerpt: "How to craft a tribute that truly reflects the unique spirit and legacy of an individual.",
    category: "Honoring",
    readTime: "8 min read",
    image: "/assets/hero-chapel.png",
    id: "bespoke-memorials"
  },
  {
    title: "Planning Ahead: The Gift of Peace",
    excerpt: "The emotional and practical benefits of pre-planning funeral services.",
    category: "Guidance",
    readTime: "5 min read",
    image: "/assets/staff-interaction.png",
    id: "planning-ahead"
  }
];

export default function Resources() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-background relative overflow-hidden min-h-screen">
        <div className="absolute top-0 right-0 w-1/3 h-[50vh] bg-[url('/assets/texture-marble.png')] opacity-10 mix-blend-overlay z-0" />
        
        <div className="container mx-auto px-6 relative z-10">
          
          {/* Editorial Header */}
          <div className="max-w-4xl mb-20">
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">Guidance & Support</span>
            <h1 className="font-serif text-5xl md:text-6xl mb-6">Educational Resources</h1>
            <p className="text-muted-foreground text-xl font-light leading-relaxed max-w-2xl">
              Navigating loss is never simple. We have curated these resources to provide clarity, answer common questions, and help you make informed decisions with peace of mind.
            </p>
          </div>

          {/* Featured Resources Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 border-b border-white/5 pb-16">
            
            {/* FAQ Card */}
            <Link href="/resources/faq">
              <a className="block h-full cursor-pointer">
                <div className="bg-card border border-white/5 p-8 rounded-sm hover:border-primary/30 transition-colors group h-full flex flex-col">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">Common Questions</h3>
                  <p className="text-muted-foreground text-sm font-light leading-relaxed mb-6 flex-grow">
                    Answers to frequently asked questions about Louisiana funeral laws, rights, and planning timelines.
                  </p>
                  <div className="flex items-center text-xs uppercase tracking-widest text-primary font-medium">
                     Read FAQ <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </a>
            </Link>

            {/* Guide Download Card */}
            <div className="bg-card border border-white/5 p-8 rounded-sm hover:border-primary/30 transition-colors group h-full flex flex-col">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">Planning Guide</h3>
              <p className="text-muted-foreground text-sm font-light leading-relaxed mb-6 flex-grow">
                Download the official Louisiana Funeral Planning Guide for comprehensive consumer information.
              </p>
              <a href="/assets/cremation-guide.pdf" download="Louisiana_Funeral_Planning_Guide.pdf" className="mt-auto block w-full">
                <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground uppercase text-xs tracking-widest">
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </a>
            </div>

            {/* Pre-Planning Card */}
            <Link href="/resources/article/planning-ahead">
              <a className="block h-full cursor-pointer">
                <div className="bg-card border border-white/5 p-8 rounded-sm hover:border-primary/30 transition-colors group h-full flex flex-col">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">Start Planning</h3>
                  <p className="text-muted-foreground text-sm font-light leading-relaxed mb-6 flex-grow">
                    Learn about the emotional and practical benefits of arranging your services in advance.
                  </p>
                  <div className="flex items-center text-xs uppercase tracking-widest text-primary font-medium">
                     Read Guide <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </a>
            </Link>
          </div>

          <h2 className="font-serif text-3xl mb-12">Latest Articles</h2>

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <Link key={index} href={`/resources/article/${article.id}`}>
                <a className="block h-full cursor-pointer">
                  <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group block h-full"
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
                    <h2 className="font-serif text-2xl group-hover:text-primary transition-colors mb-4 leading-tight">{article.title}</h2>
                    <p className="text-muted-foreground text-sm font-light leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary text-xs uppercase tracking-widest group-hover:gap-3 transition-all mt-auto">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </motion.article>
                </a>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}

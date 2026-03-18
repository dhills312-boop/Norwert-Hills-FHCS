
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: publicForms } = useQuery<{ cremationIntake: string | null; consultationIntake: string | null }>({
    queryKey: ["/api/public/forms"],
    staleTime: 5 * 60 * 1000,
  });

  const consultationHref = publicForms?.consultationIntake ?? "/contact";
  const consultationExternal = !!publicForms?.consultationIntake;

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/hero-chapel.png" 
            alt="Sanctuary" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mx-auto w-16 h-1 bg-primary mb-8 rounded-full" />
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 text-foreground tracking-tight leading-[1.1]">
              Honoring Life <br/>
              <span className="italic text-primary/90">With Dignity</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed">A sanctuary of peace and reflection in the heart of North Shores. Providing bespoke funeral services tailored to honor your loved one's unique legacy.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/services">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm tracking-widest uppercase px-8 py-6 rounded-none min-w-[200px]" data-testid="button-hero-services">
                  Our Services
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/20 text-foreground hover:bg-white/5 hover:text-white text-sm tracking-widest uppercase px-8 py-6 rounded-none min-w-[200px]" data-testid="button-hero-contact">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Introduction */}
      <section className="py-24 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[url('/assets/texture-marble.png')] opacity-10 mix-blend-overlay" />
        
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative in-line block">
            <div className="absolute -bottom-6 -right-6 w-full h-full border border-primary/30 hidden md:block" />
            <div className=" relative aspect-[4/5] overflow-hidden rounded-sm z-10">
              <img src="/assets/staff-interaction.png" alt="Compassionate Care" className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
            </div>
           
          </div>
          
          <div>
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">About Norwert Hills</span>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 leading-tight">
              A Tradition of <br />
              Compassionate Care
            </h2>
            <div className="space-y-6 text-muted-foreground font-light leading-relaxed">
              <p>Since our inception, We have stood as a pillar of support for families in North Shores. We understand that saying goodbye is one of life's most profound moments, requiring sensitivity, grace, and an unwavering commitment to detail.</p>
              <p>
                Our historic chapel and reception spaces offer a serene environment for reflection, 
                while our dedicated staff ensures that every aspect of the service is handled with 
                the utmost dignity. We are here to guide you through every step, allowing you to 
                focus on what truly matters—honoring the memory of those you hold dear.
              </p>
            </div>
            <Link href="/about" className="inline-flex items-center gap-2 text-primary mt-8 hover:text-primary/80 transition-colors uppercase text-xs tracking-widest group">
              Read Our Story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
      {/* Featured Services Teaser */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6 text-center max-w-3xl mb-16">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Curated Services</h2>
          <p className="text-muted-foreground font-light">
            From traditional ceremonies to bespoke memorials, we offer a range of services designed to meet your specific needs and wishes.
          </p>
        </div>

        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: "Traditional", image: "/assets/ceremonial-detail.png", desc: "Time-honored ceremonies in our historic chapel." },
            { title: "Cremation", image: "/assets/texture-marble.png", desc: "Dignified cremation options with memorial gatherings." },
            { title: "Bespoke", image: "/assets/hero-chapel.png", desc: "Personalized tributes reflecting a unique life." }
          ].map((item, i) => (
            <Link key={i} href="/services" className="group block relative overflow-hidden aspect-[3/4]">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h3 className="font-serif text-2xl text-white mb-2">{item.title}</h3>
                <div className="h-[1px] w-12 bg-primary mb-4 transition-all group-hover:w-24" />
                <p className="text-white/80 text-sm font-light translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/services">
            <Button variant="ghost" className="text-foreground hover:text-primary uppercase tracking-widest text-xs" data-testid="button-view-services">
              View All Services
            </Button>
          </Link>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-serif text-3xl md:text-5xl mb-6">We Are Here For You</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Our compassionate staff is available 24 hours a day, 7 days a week to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="tel:9853187574">
              <Button size="lg" className="bg-primary text-primary-foreground min-w-[200px]" data-testid="button-call">
                <Phone className="mr-2 h-4 w-4" /> (985) 318-7574
              </Button>
            </a>
            {consultationExternal ? (
              <a href={consultationHref} target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 min-w-[200px]" data-testid="button-consult">
                  Schedule a Consultation
                </Button>
              </a>
            ) : (
              <Link href={consultationHref}>
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 min-w-[200px]" data-testid="button-consult">
                  Schedule a Consultation
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

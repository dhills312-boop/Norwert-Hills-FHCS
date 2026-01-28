
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";

export default function About() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-24">
            <div className="md:w-1/2">
               <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-none">
                 Our Legacy <br/>
                 <span className="text-primary italic text-4xl md:text-6xl">of Service</span>
               </h1>
               <div className="h-[1px] w-24 bg-primary mb-8" />
            </div>
            <div className="md:w-1/2 pt-4">
               <p className="text-xl text-muted-foreground font-light leading-relaxed">
                 For over a century, the Norwert family has been entrusted with the care of New Orleans' 
                 most beloved citizens. We are more than a funeral home; we are custodians of memory.
               </p>
            </div>
          </div>

          <div className="relative aspect-[21/9] w-full overflow-hidden mb-24 grayscale-[20%]">
             <img src="/assets/staff-interaction.png" alt="Staff Interaction" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1 space-y-6 text-muted-foreground font-light leading-loose">
              <h2 className="font-serif text-3xl text-foreground mb-4">A Century of Trust</h2>
              <p>
                Founded in 1924 by Augustus Norwert, our establishment began with a simple promise: 
                to treat every family as our own. This philosophy has guided us through generations, 
                allowing us to build deep, lasting relationships with the community we serve.
              </p>
              <p>
                Today, under the stewardship of the fourth generation, we continue to blend time-honored 
                traditions with modern sensibilities. We believe that a funeral is not just a time for mourning, 
                but a profound opportunity to celebrate a life well-lived through storytelling, ritual, and beauty.
              </p>
            </div>
            <div className="order-1 md:order-2">
               <div className="aspect-[4/5] bg-card p-8 border border-white/5 relative">
                 <div className="absolute top-4 left-4 right-4 bottom-4 border border-primary/20" />
                 <img src="/assets/hero-chapel.png" className="w-full h-full object-cover opacity-80" />
               </div>
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}

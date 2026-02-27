
import { PublicLayout } from "@/components/layout/PublicLayout";
import { services } from "@/lib/data";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Services() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-background relative overflow-hidden min-h-screen">
         <div className="absolute top-0 left-0 w-full h-[50vh] bg-[url('/assets/texture-marble.png')] opacity-10 mix-blend-overlay z-0" />
         
         <div className="container mx-auto px-6 relative z-10">
           <div className="text-center max-w-3xl mx-auto mb-20">
             <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">Our Offerings</span>
             <h1 className="font-serif text-5xl md:text-6xl mb-6">Services & Collections</h1>
             <p className="text-muted-foreground text-lg font-light leading-relaxed">
               We offer a comprehensive range of services, each designed to provide comfort and dignity during your time of need.
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
             {services.map((service, index) => (
               <motion.div 
                 key={service.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: index * 0.1 }}
                 viewport={{ once: true }}
                 className="group"
               >
                 <Link href={`/services/${service.id}`} className="block">
                   <div className="aspect-[16/10] overflow-hidden mb-8 relative">
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                     <img 
                       src={service.image} 
                       alt={service.title} 
                       className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                     />
                   </div>
                   <div className="flex flex-col border-t border-primary/20 pt-6">
                     <div className="flex justify-between items-baseline mb-3">
                       <h2 className="font-serif text-3xl group-hover:text-primary transition-colors">{service.title}</h2>
                       <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 group-hover:translate-x-0 duration-300">
                         <ArrowRight className="w-5 h-5" />
                       </span>
                     </div>
                     <p className="text-muted-foreground font-light leading-relaxed">
                       {service.description}
                     </p>
                   </div>
                 </Link>
               </motion.div>
             ))}
           </div>
         </div>
      </div>
    </PublicLayout>
  );
}

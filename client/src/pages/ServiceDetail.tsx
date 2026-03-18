
import { PublicLayout } from "@/components/layout/PublicLayout";
import { services } from "@/lib/data";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";

export default function ServiceDetail() {
  const [match, params] = useRoute("/services/:id");
  const service = services.find(s => s.id === params?.id);

  const { data: publicForms } = useQuery<{ cremationIntake: string | null; consultationIntake: string | null }>({
    queryKey: ["/api/public/forms"],
    staleTime: 5 * 60 * 1000,
  });

  const consultationHref = publicForms?.consultationIntake ?? "/contact";
  const consultationExternal = !!publicForms?.consultationIntake;

  if (!match || !service) {
    return <NotFound />;
  }

  return (
    <PublicLayout>
      <div className="relative h-[60vh] min-h-[500px] w-full">
        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-20 container mx-auto">
          <Link href="/services" className="inline-flex items-center text-white/70 hover:text-primary mb-8 text-sm uppercase tracking-widest transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
          </Link>
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 max-w-4xl">{service.title}</h1>
        </div>
      </div>

      <article className="py-20 bg-background">
        <div className="container mx-auto px-6 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-2 hidden md:block pt-4">
             <div className="sticky top-32 w-12 h-[1px] bg-primary" />
          </div>
          
          <div className="md:col-span-8">
            <p className="text-2xl md:text-3xl font-serif text-primary/80 mb-12 leading-relaxed italic">
              "{service.description}"
            </p>
            
            <div className="prose prose-invert prose-lg max-w-none text-muted-foreground font-light leading-loose">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-primary first-letter:float-left first-letter:mr-4 first-letter:mt-[-10px]">
                {service.longDescription}
              </p>
              <p>
                At Norwert Hills, we believe that every ceremony should be as unique as the life it celebrates. 
                Our team works tirelessly to ensure that every detail, from the ambient lighting to the floral arrangements, 
                reflects dignity and respect. We understand the importance of tradition, yet we are also committed to 
                accommodating modern preferences and personal touches that make the service truly meaningful.
              </p>
              <p>
                We invite you to schedule a private consultation with one of our directors to discuss how we can 
                tailor this service to your specific needs.
              </p>
            </div>

            <div className="mt-16 pt-16 border-t border-white/5 flex flex-col items-center text-center">
              <h3 className="font-serif text-2xl mb-6">Interested in this service?</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                {service.id === "cremation-services" && (
                  <Link href="/cremation">
                    <Button size="lg" className="bg-primary text-primary-foreground min-w-[200px] uppercase tracking-widest text-xs" data-testid="button-begin-cremation">
                      Begin Online Arrangement
                    </Button>
                  </Link>
                )}
                {consultationExternal ? (
                  <a href={consultationHref} target="_blank" rel="noreferrer">
                    <Button
                      size="lg"
                      variant={service.id === "cremation-services" ? "outline" : "default"}
                      className={service.id === "cremation-services" ? "min-w-[200px] uppercase tracking-widest text-xs border-white/10 hover:bg-white/5" : "bg-primary text-primary-foreground min-w-[200px] uppercase tracking-widest text-xs"}
                      data-testid="button-consult"
                    >
                      Schedule a Consultation
                    </Button>
                  </a>
                ) : (
                  <Link href={consultationHref}>
                    <Button
                      size="lg"
                      variant={service.id === "cremation-services" ? "outline" : "default"}
                      className={service.id === "cremation-services" ? "min-w-[200px] uppercase tracking-widest text-xs border-white/10 hover:bg-white/5" : "bg-primary text-primary-foreground min-w-[200px] uppercase tracking-widest text-xs"}
                      data-testid="button-consult"
                    >
                      Schedule a Consultation
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}

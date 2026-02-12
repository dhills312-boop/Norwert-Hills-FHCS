import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ExternalLink, MapPin } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ResourcesFAQ() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link href="/resources">
            <a className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 text-xs uppercase tracking-widest transition-colors cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
            </a>
          </Link>

          <div className="text-center mb-16 mt-8">
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">Louisiana Statutes & Rights</span>
            <h1 className="font-serif text-4xl md:text-5xl mb-6">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Navigating funeral legislation in Louisiana can be complex. We've summarized key points from the Louisiana Funeral Planning Guide to help you understand your rights and responsibilities.
            </p>
          </div>

          <div className="bg-card border border-white/5 rounded-lg p-8 md:p-12 mb-12">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Who is legally responsible for making funeral arrangements?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  According to Louisiana Statute § 37:876, authority follows this order:
                  <ol className="list-decimal ml-6 mt-4 space-y-2">
                    <li>An agent appointed by you in a notarized declaration.</li>
                    <li>Surviving spouse (if not filed for divorce).</li>
                    <li>Adult children.</li>
                    <li>Parents.</li>
                    <li>Siblings.</li>
                    <li>Next living kin.</li>
                    <li>A district court judge.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Do I have to use a funeral home in Louisiana?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Yes. Louisiana is one of only 8 states where you must legally employ a licensed funeral director to conduct a disposition. While you can care for your deceased at home, a licensed professional must be involved in the final burial or cremation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  What are the laws regarding embalming?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  There is no legal requirement for embalming in Louisiana. However, Statute 51 §103 requires either embalming or refrigeration if the disposition does not proceed within 30 hours of death.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  What are the regulations for scattering ashes?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  <p className="mb-4">Louisiana Statute 37 §880 provides specific guidelines:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Private Property:</strong> Permitted with landowner consent. Multiple persons' ashes may be commingled here.</li>
                    <li><strong>Public Land:</strong> Generally permitted unless a specific permit is required.</li>
                    <li><strong>At Sea:</strong> Governed by EPA Region 6 (Gulf of Mexico). Must be at least 3 nautical miles from shore, and a form must be submitted within 30 days.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Is a casket required for cremation?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  No. Louisiana law does not require a casket for cremation. Only a "suitable rigid container" is required, which is typically a reinforced cardboard or plywood box.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Can I purchase a casket from a third party?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Yes. Following a 2013 court case (St. Joseph Abbey), Louisiana residents can purchase caskets from any third-party seller. Under the FTC Funeral Rule, funeral homes must accept these caskets without charging additional handling fees.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  What if the deceased had no insurance and I can't afford a funeral?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Financial aid for funerals is limited and varies significantly by parish. In cases of indigence, the parish coroner may coordinate a minimal burial or cremation. Direct cremation is typically the most affordable professional option available.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="bg-secondary/30 border border-white/5 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                   <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                   <h3 className="font-serif text-xl mb-1">Download the Full Guide</h3>
                   <p className="text-muted-foreground">The complete 2026 Louisiana Funeral Planning Guide PDF.</p>
                </div>
             </div>
             <div className="flex gap-4">
               <a href="/assets/Louisiana-Funeral-Planning-Guide.pdf" download>
                 <Button className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase text-xs tracking-widest px-8">
                   Download PDF
                 </Button>
               </a>
             </div>
          </div>

          <div className="mt-16 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h4 className="font-serif text-xl mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Regulatory Authority
              </h4>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                All funeral establishments are licensed by the <strong>Louisiana State Board of Embalmers and Funeral Directors</strong>. For official inquiries or complaints, you may contact them directly.
              </p>
            </div>
            <div>
              <h4 className="font-serif text-xl mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" /> Consumer Protection
              </h4>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                The Federal Trade Commission's "Funeral Rule" ensures you have the right to choose only the goods and services you want and to receive price information over the phone or in person.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

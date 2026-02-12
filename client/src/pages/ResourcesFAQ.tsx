import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
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
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">Common Questions</span>
            <h1 className="font-serif text-4xl md:text-5xl mb-6">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Arranging funeral or cremation services can feel overwhelming, especially when decisions must be made quickly. The questions below address some of the most common concerns families have when planning services in Louisiana.
            </p>
          </div>

          <div className="bg-card border border-white/5 rounded-lg p-8 md:p-12 mb-12">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Who is legally allowed to make funeral arrangements in Louisiana?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Louisiana law establishes a clear order of authority for who may make funeral or cremation arrangements. Responsibility typically falls to a person designated in advance by the deceased, or—if no designation exists—to the surviving spouse, adult children, parents, siblings, or next of kin. In rare cases, a district court judge may make the determination.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Do I have to use a funeral home in Louisiana?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Yes. Louisiana is one of the few states that requires a licensed funeral director to be involved in the disposition of a body. While families may still participate in care and planning, a licensed funeral home must be engaged to complete burial or cremation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Are funeral homes in Louisiana regulated?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  All funeral homes in Louisiana are licensed and regulated by the Louisiana State Board of Embalmers and Funeral Directors. In addition, the Federal Trade Commission’s Funeral Rule applies, although Louisiana state law may supersede federal provisions in some areas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Is embalming required by law?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  No. Louisiana law does not require embalming. However, if disposition does not occur within approximately 30 hours, embalming or refrigeration is required. Some funeral homes may require embalming for public viewings, but families may ask about refrigeration alternatives.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Is a casket required for cremation?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  No. Louisiana law does not require a casket for cremation. A suitable rigid container, often made of reinforced cardboard or plywood, is sufficient.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  What types of cremation options are available?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Families may choose cremation with a full service, a memorial service held later, or a direct cremation without services. Direct cremation is the simplest option and allows families to plan remembrance in their own time. Additional elements, such as private viewings or upgraded urns, may be added if desired.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  What can be done with cremated remains in Louisiana?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Cremated remains may be buried, placed in a niche, kept by the family, or scattered. Ashes may be scattered on private property with permission. Scattering on public land is generally permitted unless a permit is required. Special regulations apply to sea scattering in the Gulf of Mexico, overseen by the Environmental Protection Agency.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Can ashes be scattered at sea?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Yes. Sea scattering is permitted in Louisiana waters, but it must comply with EPA regulations. Notification paperwork must be submitted after the scattering, and certain distance requirements apply.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  How do families choose between burial and cremation?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  This decision is deeply personal. Faith traditions, family wishes, environmental considerations, and financial factors often play a role. Many families find it helpful to talk openly with loved ones and consult a funeral professional for guidance, while keeping personal values at the center of the decision.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Can funeral arrangements be pre-planned in Louisiana?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Yes. Pre-planning is allowed and encouraged for families who wish to outline their preferences in advance. Plans may be made directly with a funeral home, through burial insurance, or by setting aside funds in designated accounts. Pre-planning can ease emotional and logistical burdens for loved ones.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  What if a family cannot afford funeral services?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Limited assistance may be available at the parish or state level for individuals without sufficient funds. In such cases, the coroner or parish authorities may coordinate a minimal burial or cremation. A simple cremation is typically the least expensive option.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Can a body be transported to or from Louisiana?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Yes, but transportation must be arranged through a licensed funeral director and requires specific permits and containers. Cremation at the place of death, followed by transport of cremated remains, is often a simpler alternative.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13" className="border-b border-white/10 px-2">
                <AccordionTrigger className="text-lg font-serif hover:text-primary hover:no-underline py-6 text-left">
                  Where can concerns or complaints about a funeral home be directed?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                  Concerns that cannot be resolved directly may be submitted to the Louisiana State Board of Embalmers and Funeral Directors, which oversees licensing and professional standards.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="bg-secondary/30 border border-white/5 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                   <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                   <h3 className="font-serif text-lg mb-1">Louisiana Funeral Planning Guide</h3>
                   <p className="text-sm text-muted-foreground">Official consumer guide provided by the Louisiana State Board of Embalmers and Funeral Directors.</p>
                </div>
             </div>
             <a href="/assets/cremation-guide.pdf" download="Louisiana_Funeral_Planning_Guide.pdf">
               <Button variant="outline" className="border-white/10 hover:bg-white/5 whitespace-nowrap">
                 Download PDF
               </Button>
             </a>
          </div>

          <div className="mt-12 text-center pt-8 border-t border-white/5">
             <p className="text-xs text-muted-foreground uppercase tracking-widest leading-loose">
               This FAQ is informed by: What to Consider When Arranging a Funeral or Cremation in Louisiana, published by US Funerals Online, including applicable Louisiana statutes and regulatory guidance.
             </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

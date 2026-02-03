
import { StaffLayout } from "@/components/layout/StaffLayout";
import { exampleBill, type BillData, type BillSection } from "@/lib/data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Printer, Download, Link as LinkIcon, Check, ShieldCheck, PenSquare, Share2, ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function Billing() {
  const [billData, setBillData] = useState<BillData | null>(null);
  const [isStaffMode, setIsStaffMode] = useState(true); // Toggle for demo purposes
  const { toast } = useToast();

  const handleGenerateExample = () => {
    setBillData(exampleBill);
    toast({
      title: "Example Bill Generated",
      description: "Loaded data for The Anderson Family (NH-2026-00127).",
    });
  };

  const calculateSectionTotal = (section: BillSection) => {
    return section.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotal = () => {
    if (!billData) return { subtotal: 0, tax: 0, total: 0, balance: 0, servicesTotal: 0, merchandiseTotal: 0, cashAdvancesTotal: 0, credits: 0 };
    
    const servicesTotal = calculateSectionTotal(billData.sections.services);
    const merchandiseTotal = calculateSectionTotal(billData.sections.merchandise);
    const cashAdvancesTotal = calculateSectionTotal(billData.sections.cashAdvances);
    
    const subtotal = servicesTotal + merchandiseTotal + cashAdvancesTotal;
    const tax = merchandiseTotal * billData.taxRate; // Typically tax only on merchandise
    const total = subtotal + tax;
    const credits = billData.credits.reduce((sum, item) => sum + item.amount, 0);
    const balance = total - credits;

    return { subtotal, tax, total, balance, servicesTotal, merchandiseTotal, cashAdvancesTotal, credits };
  };

  const totals = calculateTotal();

  const handleSend = (type: string) => {
    toast({
      title: "Sent Successfully",
      description: `${type} has been sent to the family.`,
    });
  };

  if (!billData) {
    return (
      <StaffLayout>
        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="bg-white/5 p-8 rounded-full">
            <FileText className="h-16 w-16 text-primary opacity-50" />
          </div>
          <h2 className="font-serif text-3xl">Statement Generator</h2>
          <p className="text-muted-foreground max-w-md">
            No active statement loaded. Generate an example bill to view the layout and functionality.
          </p>
          <Button onClick={handleGenerateExample} size="lg" className="bg-primary text-primary-foreground">
            Generate Example Bill
          </Button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="min-h-screen bg-background flex flex-col font-sans">
        
        {/* Sticky Header Strip */}
        <header className="sticky top-0 z-40 bg-card border-b border-white/10 shadow-lg">
          <div className="container mx-auto px-6 py-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <Link href="/staff/dashboard">
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-white/10 text-muted-foreground hover:text-foreground">
                       <ArrowLeft className="h-4 w-4" />
                     </Button>
                   </Link>
                   <div>
                      <h1 className="font-serif text-xl md:text-2xl leading-none mb-1">{billData.clientName}</h1>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono uppercase tracking-wider">
                        <span>{billData.statementNumber}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span>{billData.date}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          billData.status === 'In Progress' ? "bg-blue-500/10 text-blue-400" :
                          billData.status === 'Pending Signature' ? "bg-amber-500/10 text-amber-400" :
                          "bg-green-500/10 text-green-400"
                        )}>
                          {billData.status}
                        </span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <Button variant="outline" size="sm" className="hidden md:flex border-white/10 hover:bg-white/5">
                     <Printer className="w-4 h-4 mr-2" /> Print
                   </Button>
                   
                   <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                          <Share2 className="w-4 h-4 mr-2" /> Send
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Statement</DialogTitle>
                          <DialogDescription>Choose how you would like to send this document.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                           <Button variant="outline" className="justify-start" onClick={() => handleSend("Summary Link")}>
                             <LinkIcon className="mr-2 h-4 w-4" /> Send Summary Link
                           </Button>
                           <Button variant="outline" className="justify-start" onClick={() => handleSend("Receipt")}>
                             <Check className="mr-2 h-4 w-4" /> Send Receipt
                           </Button>
                           <Button variant="outline" className="justify-start" onClick={() => handleSend("Confirmation")}>
                             <ShieldCheck className="mr-2 h-4 w-4" /> Send Confirmation of Selections
                           </Button>
                        </div>
                      </DialogContent>
                   </Dialog>

                   <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                     <ShieldCheck className="w-4 h-4 mr-2" /> Finalize
                   </Button>
                </div>
             </div>
          </div>
        </header>

        {/* Microcopy & Chips */}
        <div className="bg-background border-b border-white/5 py-3">
           <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground italic">
                "This page summarizes your selections. Nothing is final until you approve."
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 max-w-full no-scrollbar">
                 <div className="bg-white/5 px-3 py-1 rounded-full text-xs border border-white/5 whitespace-nowrap">Traditional Service</div>
                 <div className="bg-white/5 px-3 py-1 rounded-full text-xs border border-white/5 whitespace-nowrap">Viewing: Chapel A</div>
                 <div className="bg-white/5 px-3 py-1 rounded-full text-xs border border-white/5 whitespace-nowrap">Casket: Mahogany</div>
              </div>
           </div>
        </div>

        <main className="flex-grow container mx-auto px-4 md:px-6 py-8">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              
              {/* LEFT COLUMN: Itemized Statement */}
              <div className="lg:col-span-2 space-y-8">
                 
                 {/* Section A: Services */}
                 <section className="bg-card rounded-lg border border-white/5 p-6 md:p-8">
                    <h3 className="font-serif text-lg md:text-xl border-b border-white/10 pb-4 mb-6 flex justify-between items-end">
                       {billData.sections.services.title}
                       <span className="font-mono text-sm text-muted-foreground font-normal">
                         ${totals.servicesTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </h3>
                    <div className="space-y-4">
                       {billData.sections.services.items.map((item) => (
                         <div key={item.id} className="flex justify-between items-start group">
                            <div className="flex items-start gap-3">
                               {isStaffMode && <PenSquare className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 mt-1 cursor-pointer hover:text-primary transition-opacity" />}
                               <span className="text-sm md:text-base text-foreground/90">{item.description}</span>
                            </div>
                            <span className="font-mono text-sm md:text-base text-muted-foreground">
                              ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                         </div>
                       ))}
                    </div>
                 </section>

                 {/* Section B: Merchandise */}
                 <section className="bg-card rounded-lg border border-white/5 p-6 md:p-8">
                    <h3 className="font-serif text-lg md:text-xl border-b border-white/10 pb-4 mb-6 flex justify-between items-end">
                       {billData.sections.merchandise.title}
                       <span className="font-mono text-sm text-muted-foreground font-normal">
                         ${totals.merchandiseTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </h3>
                    <div className="space-y-4">
                       {billData.sections.merchandise.items.map((item) => (
                         <div key={item.id} className="flex justify-between items-start group">
                            <div className="flex items-start gap-3">
                               {isStaffMode && <PenSquare className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 mt-1 cursor-pointer hover:text-primary transition-opacity" />}
                               <span className="text-sm md:text-base text-foreground/90">{item.description}</span>
                            </div>
                            <span className="font-mono text-sm md:text-base text-muted-foreground">
                              ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                         </div>
                       ))}
                    </div>
                 </section>

                 {/* Section C: Cash Advances */}
                 <section className="bg-card rounded-lg border border-white/5 p-6 md:p-8">
                    <h3 className="font-serif text-lg md:text-xl border-b border-white/10 pb-4 mb-6 flex justify-between items-end">
                       {billData.sections.cashAdvances.title}
                       <span className="font-mono text-sm text-muted-foreground font-normal">
                         ${totals.cashAdvancesTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </h3>
                    <div className="space-y-4">
                       {billData.sections.cashAdvances.items.map((item) => (
                         <div key={item.id} className="flex justify-between items-start group">
                            <div className="flex items-start gap-3">
                               {isStaffMode && <PenSquare className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 mt-1 cursor-pointer hover:text-primary transition-opacity" />}
                               <span className="text-sm md:text-base text-foreground/90">{item.description}</span>
                            </div>
                            <span className="font-mono text-sm md:text-base text-muted-foreground">
                              ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                         </div>
                       ))}
                    </div>
                 </section>

                 <div className="text-xs text-muted-foreground max-w-2xl mt-8 leading-relaxed">
                   <p className="mb-2"><strong>Disclosures:</strong></p>
                   <p>Charges are only for those items that you selected or that are required. If we are required by law or by a cemetery or crematory to use any items, we will explain the reasons in writing below.</p>
                 </div>
              </div>

              {/* RIGHT COLUMN: Summary Panel */}
              <div className="lg:col-span-1">
                 <div className="bg-neutral-900 border border-primary/20 rounded-lg p-6 md:p-8 sticky top-32 shadow-2xl">
                    <h3 className="font-serif text-xl mb-6 text-primary">Statement Summary</h3>
                    
                    <div className="space-y-3 mb-6">
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Services Selected</span>
                          <span className="font-mono text-foreground">${totals.servicesTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Merchandise Selected</span>
                          <span className="font-mono text-foreground">${totals.merchandiseTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cash Advances</span>
                          <span className="font-mono text-foreground">${totals.cashAdvancesTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                    </div>

                    <Separator className="bg-white/10 my-4" />

                    <div className="space-y-3 mb-6">
                       <div className="flex justify-between text-sm">
                          <span className="text-foreground font-medium">Subtotal</span>
                          <span className="font-mono text-foreground">${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sales Tax ({(billData.taxRate * 100).toFixed(2)}%)</span>
                          <span className="font-mono text-muted-foreground">${totals.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                       <div className="flex justify-between text-base font-medium mt-2">
                          <span className="text-foreground">Total Charges</span>
                          <span className="font-mono text-foreground">${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                    </div>

                    <div className="bg-green-900/10 border border-green-500/20 rounded-md p-4 mb-6">
                       <h4 className="text-xs uppercase tracking-wider text-green-500 mb-3 font-semibold">Credits & Payments</h4>
                       {billData.credits.map((credit) => (
                         <div key={credit.id} className="flex justify-between text-sm mb-2">
                            <span className="text-green-100/70">{credit.description}</span>
                            <span className="font-mono text-green-400">-${credit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                         </div>
                       ))}
                    </div>

                    <div className="pt-2">
                       <div className="flex justify-between items-baseline">
                          <span className="font-serif text-lg text-primary">Balance Due</span>
                          <span className="font-mono text-2xl font-bold text-primary">${totals.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                       </div>
                       <p className="text-xs text-muted-foreground mt-2 text-right">Payment due by {billData.date}</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                       <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-serif">
                         <PenSquare className="w-4 h-4 mr-2" /> Sign & Accept
                       </Button>
                       <p className="text-xs text-center text-muted-foreground mt-3">
                         Secure digital signature via JotForm
                       </p>
                    </div>
                 </div>
              </div>

           </div>
        </main>
      </div>
    </StaffLayout>
  );
}

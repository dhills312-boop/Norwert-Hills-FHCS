import { StaffLayout } from "@/components/layout/StaffLayout";
import { builderSteps } from "@/lib/data";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Edit2, FileText, ShieldAlert, Receipt, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Arrangement {
  id: string;
  familyName: string;
  selections: Record<string, string>;
  status: string;
  nextStep: string;
}

export default function Builder() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const params = new URLSearchParams(search);
  const arrangementId = params.get("arrangement");

  if (!authLoading && !isAuthenticated) {
    setLocation("/staff/login");
    return null;
  }

  const { data: arrangement } = useQuery<Arrangement>({
    queryKey: ["/api/arrangements", arrangementId],
    queryFn: async () => {
      if (!arrangementId) return null;
      const res = await fetch(`/api/arrangements/${arrangementId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!arrangementId && isAuthenticated,
  });

  useEffect(() => {
    if (arrangement?.selections && typeof arrangement.selections === 'object') {
      setSelections(arrangement.selections);
    }
  }, [arrangement]);

  const saveMutation = useMutation({
    mutationFn: async (data: { selections: Record<string, string>; status: string; nextStep: string }) => {
      if (!arrangementId) return;
      const res = await apiRequest("PATCH", `/api/arrangements/${arrangementId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arrangements"] });
    },
  });

  const currentStep = builderSteps[currentStepIndex];
  const isLastStep = currentStepIndex === builderSteps.length - 1;

  const handleSelect = (optionId: string) => {
    const newSelections = { ...selections, [currentStep.id]: optionId };
    setSelections(newSelections);

    if (arrangementId) {
      const nextStepName = isLastStep
        ? "Final Review"
        : builderSteps[currentStepIndex + 1]?.title || "Service Selection";
      saveMutation.mutate({ selections: newSelections, status: "In Progress", nextStep: nextStepName });
    }
  };

  const handleNext = () => {
    if (currentStepIndex < builderSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (arrangementId) {
      saveMutation.mutate({ selections, status: "Pending Signature", nextStep: "Final Review" });
      toast({ title: "Arrangement Saved", description: "Selections have been finalized." });
    }
  };

  const activeSelectionId = selections[currentStep.id];
  const activeOption = currentStep.options.find(o => o.id === activeSelectionId);
  const currentImage = activeOption?.image || currentStep.previewImage;
  const currentCaption = activeOption?.description || currentStep.previewCaption;

  return (
    <StaffLayout>
      <div className="h-[calc(100vh-60px)] md:h-screen w-full flex flex-col md:flex-row overflow-hidden bg-background">
        
        <div className="w-full md:w-[60%] h-[40vh] md:h-full relative overflow-hidden bg-black/90">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentImage}
               initial={{ opacity: 0, scale: 1.05 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="absolute inset-0"
             >
               <img 
                 src={currentImage} 
                 alt="Preview" 
                 className="w-full h-full object-cover opacity-70"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
             </motion.div>
           </AnimatePresence>

           <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
              <motion.div
                key={currentCaption}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-serif text-2xl md:text-4xl text-white/90 leading-relaxed italic max-w-2xl">
                  "{currentCaption}"
                </p>
                {arrangement && (
                  <p className="text-white/50 text-sm mt-4 uppercase tracking-widest">
                    {arrangement.familyName}
                  </p>
                )}
              </motion.div>
           </div>
        </div>

        <div className="w-full md:w-[40%] h-full min-h-0 overflow-y-auto bg-card border-l border-white/5 relative z-20">
          
          <div className="p-8 md:p-10 pb-4" >
             <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-mono text-primary tracking-widest uppercase">
                  Step {currentStepIndex + 1} of {builderSteps.length}
                </span>
                <div className="h-[1px] flex-grow bg-white/10" />
                {saveMutation.isPending && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
             </div>
             
             <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{currentStep.title}</h2>
             <p className="text-muted-foreground text-lg font-light leading-relaxed">
               {currentStep.whyCopy}
             </p>
          </div>

          <div className="px-8 md:px-10 py-4 space-y-4">
             {currentStep.options.map((option) => {
               const isSelected = selections[currentStep.id] === option.id;
               return (
                 <motion.div
                   key={option.id}
                   whileHover={{ scale: 1.01 }}
                   whileTap={{ scale: 0.99 }}
                   onClick={() => handleSelect(option.id)}
                   data-testid={`option-${option.id}`}
                   className={cn(
                     "cursor-pointer rounded-lg border p-5 transition-all duration-300 relative overflow-hidden",
                     isSelected 
                       ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                       : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                   )}
                 >
                   <div className="flex justify-between items-center mb-1 relative z-10">
                     <span className={cn("font-medium text-lg", isSelected ? "text-primary" : "text-foreground")}>
                       {option.name}
                     </span>
                     {isSelected && <Check className="text-primary w-5 h-5" />}
                   </div>
                   <p className="text-sm text-muted-foreground relative z-10">{option.description}</p>
                 </motion.div>
               );
             })}
          </div>

          <div className="px-8 md:px-10 py-4 border-t border-white/5 bg-background/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 uppercase tracking-wider">
               <span>Staff Controls</span>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" className="h-8 border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground text-xs" data-testid="button-add-note">
                 <Edit2 className="w-3 h-3 mr-2" /> Add Note
               </Button>
               <Button variant="outline" size="sm" className="h-8 border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground text-xs" data-testid="button-override">
                 <ShieldAlert className="w-3 h-3 mr-2" /> Override
               </Button>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-background border-t border-white/5 flex items-center justify-between">
             <Button variant="ghost" onClick={handleBack} disabled={currentStepIndex === 0} className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent" data-testid="button-back">
               <ChevronLeft className="mr-2 h-4 w-4" /> Back
             </Button>

             <div className="flex gap-2">
               {isLastStep && (
                  <Link href={arrangementId ? `/staff/billing?arrangement=${arrangementId}` : "/staff/billing"}>
                    <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" data-testid="button-statement">
                      <Receipt className="mr-2 h-4 w-4" /> Statement
                    </Button>
                  </Link>
               )}
               <Button 
                  onClick={isLastStep ? handleComplete : handleNext} 
                  disabled={!selections[currentStep.id] && !isLastStep}
                  className="bg-primary text-primary-foreground px-8 py-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  data-testid="button-continue"
               >
                 {isLastStep ? "Complete" : "Continue"}
                 {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
               </Button>
             </div>
          </div>

        </div>

        <motion.div 
           initial={false}
           animate={{ y: isSummaryOpen ? 0 : "calc(100% - 3rem)" }}
           transition={{ type: "spring", stiffness: 300, damping: 30 }}
           className="fixed bottom-0 left-0 md:left-auto md:right-0 w-full md:w-[40%] bg-zinc-900 border-t border-primary/20 shadow-2xl z-40 rounded-t-xl"
        >
           <div 
             className="h-12 flex items-center justify-between px-8 cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 transition-colors rounded-t-xl"
             onClick={() => setIsSummaryOpen(!isSummaryOpen)}
             data-testid="button-toggle-summary"
           >
              <div className="flex items-center gap-2">
                 <FileText className="w-4 h-4 text-primary" />
                 <span className="text-sm font-medium uppercase tracking-wider text-primary">Service Summary</span>
              </div>
              {isSummaryOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
           </div>
           
           <div className="p-8 h-[300px] overflow-y-auto">
              <div className="space-y-6">
                 {builderSteps.map((step, idx) => {
                    const selectionId = selections[step.id];
                    const selectedOption = step.options.find(o => o.id === selectionId);
                    const isPending = !selectionId;

                    return (
                       <div key={step.id} className="flex items-start gap-4">
                          <div className={cn(
                             "w-6 h-6 rounded-full flex items-center justify-center border text-[10px]",
                             isPending 
                               ? "border-white/10 text-muted-foreground" 
                               : "border-primary bg-primary text-primary-foreground"
                          )}>
                             {isPending ? idx + 1 : <Check className="w-3 h-3" />}
                          </div>
                          <div>
                             <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">{step.title}</span>
                             {isPending ? (
                                <span className="text-sm text-white/30 italic">Pending selection...</span>
                             ) : (
                                <span className="text-lg font-serif text-white">{selectedOption?.name}</span>
                             )}
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </motion.div>

      </div>
    </StaffLayout>
  );
}

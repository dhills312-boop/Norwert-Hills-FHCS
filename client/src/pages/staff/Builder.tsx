
import { StaffLayout } from "@/components/layout/StaffLayout";
import { builderSteps, type PackageOption } from "@/lib/data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Builder() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const currentStep = builderSteps[currentStepIndex];
  const isLastStep = currentStepIndex === builderSteps.length - 1;

  const handleSelect = (optionId: string) => {
    setSelections(prev => ({ ...prev, [currentStep.id]: optionId }));
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

  const calculateTotal = () => {
    let total = 0;
    Object.entries(selections).forEach(([stepId, optionId]) => {
      const step = builderSteps.find(s => s.id === stepId);
      const option = step?.options.find(o => o.id === optionId);
      if (option) total += option.price;
    });
    return total;
  };

  return (
    <StaffLayout>
      <div className="h-full flex flex-col">
        {/* Top Bar */}
        <div className="bg-card border-b border-white/5 p-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <h1 className="font-serif text-xl">Package Builder</h1>
             <div className="h-4 w-[1px] bg-white/10" />
             <span className="text-sm text-muted-foreground">The Anderson Family</span>
           </div>
           <div className="text-lg font-mono text-primary">
             ${calculateTotal().toLocaleString()}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          
          {/* Steps Indicator (Left) */}
          <div className="w-full md:w-64 bg-background/50 border-r border-white/5 p-6 overflow-y-auto hidden md:block">
            <div className="space-y-6 relative">
               <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-white/10 z-0" />
               {builderSteps.map((step, index) => {
                 const isCompleted = index < currentStepIndex;
                 const isCurrent = index === currentStepIndex;
                 const isSelected = selections[step.id];

                 return (
                   <div key={step.id} className="relative z-10 flex items-start gap-4">
                     <div className={cn(
                       "w-6 h-6 rounded-full flex items-center justify-center border transition-colors flex-shrink-0",
                       isCompleted || isSelected ? "bg-primary border-primary text-primary-foreground" : 
                       isCurrent ? "border-primary text-primary bg-background" : "border-white/20 text-muted-foreground bg-background"
                     )}>
                       {isCompleted || isSelected ? <Check className="w-3 h-3" /> : <span className="text-xs">{index + 1}</span>}
                     </div>
                     <div className="pt-0.5">
                       <p className={cn("text-sm font-medium transition-colors", isCurrent ? "text-primary" : "text-muted-foreground")}>{step.title}</p>
                       {isSelected && (
                         <p className="text-xs text-muted-foreground mt-1">
                           {builderSteps.find(s => s.id === step.id)?.options.find(o => o.id === selections[step.id])?.name}
                         </p>
                       )}
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>

          {/* Configuration Area */}
          <div className="flex-grow p-6 md:p-12 overflow-y-auto bg-neutral-900/50">
             <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <h2 className="font-serif text-3xl md:text-4xl mb-2">{currentStep.title}</h2>
                  <p className="text-muted-foreground">Select an option to continue.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentStep.options.map((option) => {
                    const isSelected = selections[currentStep.id] === option.id;
                    return (
                      <div 
                        key={option.id}
                        onClick={() => handleSelect(option.id)}
                        className={cn(
                          "cursor-pointer group relative overflow-hidden rounded-lg border-2 transition-all duration-300",
                          isSelected ? "border-primary bg-primary/5" : "border-white/5 bg-card hover:border-primary/30"
                        )}
                      >
                         {option.image && (
                           <div className="aspect-video w-full overflow-hidden">
                             <img src={option.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                           </div>
                         )}
                         <div className="p-6">
                           <div className="flex justify-between items-start mb-2">
                             <h3 className={cn("font-medium text-lg", isSelected ? "text-primary" : "text-foreground")}>{option.name}</h3>
                             {isSelected && <Check className="text-primary w-5 h-5" />}
                           </div>
                           <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{option.description}</p>
                           <p className="font-mono text-sm text-foreground opacity-80">${option.price.toLocaleString()}</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-card border-t border-white/5 p-4 md:p-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
             <Button 
               variant="ghost" 
               onClick={handleBack} 
               disabled={currentStepIndex === 0}
               className="text-muted-foreground hover:text-foreground"
             >
               <ChevronLeft className="mr-2 h-4 w-4" /> Back
             </Button>
             
             <div className="flex gap-4">
                <Button 
                   onClick={handleNext} 
                   disabled={!selections[currentStep.id]}
                   className="bg-primary text-primary-foreground min-w-[120px]"
                >
                  {isLastStep ? "Complete Package" : "Continue"}
                  {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
             </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

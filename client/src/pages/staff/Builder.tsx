import { StaffLayout } from "@/components/layout/StaffLayout";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Edit2, FileText, ShieldAlert, Receipt, Loader2, Plus, Trash2, Package, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ServiceCatalogItem, ArrangementSelections } from "@shared/schema";

interface PackageWithIncludes extends ServiceCatalogItem {
  includedItems: ServiceCatalogItem[];
}

interface Arrangement {
  id: string;
  familyName: string;
  selections: ArrangementSelections;
  status: string;
  nextStep: string;
}

type StepId = "package" | "merchandise" | "floral" | "add-ons" | "cash-advances" | "review";

interface BuilderStepDef {
  id: StepId;
  title: string;
  description: string;
}

export default function Builder() {
  const [selections, setSelections] = useState<ArrangementSelections>({});
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [customItemDesc, setCustomItemDesc] = useState("");
  const [customItemAmount, setCustomItemAmount] = useState("");
  const [customItemSection, setCustomItemSection] = useState("service");
  const [editingOverride, setEditingOverride] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const params = new URLSearchParams(search);
  const arrangementId = params.get("arrangement");

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

  const { data: packages = [] } = useQuery<PackageWithIncludes[]>({
    queryKey: ["/api/service-catalog/packages"],
    queryFn: async () => {
      const res = await fetch("/api/service-catalog/packages", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: catalogItems = [] } = useQuery<ServiceCatalogItem[]>({
    queryKey: ["/api/service-catalog"],
    queryFn: async () => {
      const res = await fetch("/api/service-catalog", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (arrangement?.selections && typeof arrangement.selections === "object") {
      setSelections(arrangement.selections as ArrangementSelections);
    }
  }, [arrangement]);

  const saveMutation = useMutation({
    mutationFn: async (data: { selections: ArrangementSelections; status: string; nextStep: string }) => {
      if (!arrangementId) return;
      const res = await apiRequest("PATCH", `/api/arrangements/${arrangementId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arrangements"] });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/staff/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (!authLoading && !isAuthenticated) return null;

  const selectedPackage = packages.find((p) => p.id === selections.packageId);
  const pkgCategory = selectedPackage?.category || "";
  const isBurial = pkgCategory === "burial";
  const isCremation = pkgCategory === "cremation" || pkgCategory === "direct-cremation";
  const isMemorialOnly = pkgCategory === "memorial";
  const isDirectCremation = pkgCategory === "direct-cremation";

  const allSteps: BuilderStepDef[] = [
    { id: "package", title: "Package Selection", description: "Choose a base service package that includes core services." },
    { id: "merchandise", title: isCremation ? "Urn Selection" : "Casket Selection", description: isCremation ? "Select an urn for cremated remains." : "Choose a casket that reflects tradition and preference." },
    { id: "floral", title: "Floral Arrangements", description: "Add floral tributes for the service." },
    { id: "add-ons", title: "Optional Add-Ons", description: "Toggle additional services and memorial extras." },
    { id: "cash-advances", title: "Cash Advances", description: "Third-party costs paid on the family's behalf." },
    { id: "review", title: "Review & Customize", description: "Review all selections, adjust prices, or add custom items." },
  ];

  const steps = allSteps.filter((s) => {
    if (s.id === "merchandise") {
      if (isMemorialOnly) return false;
      return true;
    }
    if (s.id === "floral" && isDirectCremation) return false;
    return true;
  });

  const safeStepIndex = Math.min(currentStepIndex, steps.length - 1);
  const currentStep = steps[safeStepIndex];
  const isLastStep = safeStepIndex === steps.length - 1;

  const caskets = catalogItems.filter((i) => i.itemType === "merchandise" && i.category === "casket");
  const urns = catalogItems.filter((i) => i.itemType === "merchandise" && i.category === "urn");
  const florals = catalogItems.filter((i) => i.itemType === "merchandise" && i.category === "floral");
  const addOns = catalogItems.filter((i) => i.itemType === "add-on");
  const cashAdvances = catalogItems.filter((i) => i.itemType === "cash-advance");

  const merchandiseItems = isCremation ? urns : caskets;

  const saveSelections = (newSelections: ArrangementSelections) => {
    setSelections(newSelections);
    if (arrangementId) {
      const nextStepName = isLastStep ? "Final Review" : steps[safeStepIndex + 1]?.title || "Package Selection";
      saveMutation.mutate({ selections: newSelections, status: "In Progress", nextStep: nextStepName });
    }
  };

  const handlePackageSelect = (pkgId: string) => {
    saveSelections({ ...selections, packageId: pkgId, merchandiseIds: [], floralIds: [], addOnIds: [], cashAdvanceIds: [] });
  };

  const handleMerchandiseToggle = (itemId: string) => {
    const current = selections.merchandiseIds || [];
    const updated = current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId];
    saveSelections({ ...selections, merchandiseIds: updated });
  };

  const handleFloralToggle = (itemId: string) => {
    const current = selections.floralIds || [];
    const updated = current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId];
    saveSelections({ ...selections, floralIds: updated });
  };

  const handleAddOnToggle = (itemId: string) => {
    const current = selections.addOnIds || [];
    const updated = current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId];
    saveSelections({ ...selections, addOnIds: updated });
  };

  const handleCashAdvanceToggle = (itemId: string) => {
    const current = selections.cashAdvanceIds || [];
    const updated = current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId];
    saveSelections({ ...selections, cashAdvanceIds: updated });
  };

  const handleAddCustomItem = () => {
    if (!customItemDesc || !customItemAmount) return;
    const amount = parseFloat(customItemAmount);
    if (isNaN(amount)) return;
    const custom = selections.customItems || [];
    saveSelections({ ...selections, customItems: [...custom, { description: customItemDesc, section: customItemSection, amount }] });
    setCustomItemDesc("");
    setCustomItemAmount("");
  };

  const handleRemoveCustomItem = (index: number) => {
    const custom = [...(selections.customItems || [])];
    custom.splice(index, 1);
    saveSelections({ ...selections, customItems: custom });
  };

  const handleOverride = (itemId: string) => {
    const val = parseFloat(overrideValue);
    if (isNaN(val)) return;
    const overrides = { ...(selections.overrides || {}), [itemId]: val };
    saveSelections({ ...selections, overrides });
    setEditingOverride(null);
    setOverrideValue("");
  };

  const handleRemoveOverride = (itemId: string) => {
    const overrides = { ...(selections.overrides || {}) };
    delete overrides[itemId];
    saveSelections({ ...selections, overrides });
  };

  const getPrice = (item: ServiceCatalogItem) => {
    if (selections.overrides?.[item.id] !== undefined) return selections.overrides[item.id];
    return parseFloat(item.defaultPrice);
  };

  const handleNext = () => {
    if (safeStepIndex < steps.length - 1) setCurrentStepIndex(safeStepIndex + 1);
  };

  const handleBack = () => {
    if (safeStepIndex > 0) setCurrentStepIndex(safeStepIndex - 1);
  };

  const handleComplete = () => {
    if (arrangementId) {
      saveMutation.mutate({ selections, status: "Pending Signature", nextStep: "Final Review" });
      toast({ title: "Arrangement Saved", description: "Selections have been finalized." });
    }
  };

  const allSelectedItems = useMemo(() => {
    const items: { item: ServiceCatalogItem; section: string }[] = [];
    if (selectedPackage) {
      selectedPackage.includedItems.forEach((i) => items.push({ item: i, section: i.itemType === "service" ? "Services" : "Merchandise" }));
    }
    (selections.merchandiseIds || []).forEach((id) => {
      const item = catalogItems.find((i) => i.id === id);
      if (item) items.push({ item, section: "Merchandise" });
    });
    (selections.floralIds || []).forEach((id) => {
      const item = catalogItems.find((i) => i.id === id);
      if (item) items.push({ item, section: "Merchandise" });
    });
    (selections.addOnIds || []).forEach((id) => {
      const item = catalogItems.find((i) => i.id === id);
      if (item) items.push({ item, section: "Add-Ons" });
    });
    (selections.cashAdvanceIds || []).forEach((id) => {
      const item = catalogItems.find((i) => i.id === id);
      if (item) items.push({ item, section: "Cash Advances" });
    });
    return items;
  }, [selectedPackage, selections, catalogItems]);

  const renderToggleList = (items: ServiceCatalogItem[], selectedIds: string[], onToggle: (id: string) => void) => (
    <div className="px-8 md:px-10 py-4 space-y-3">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => onToggle(item.id)}
            data-testid={`option-${item.id}`}
            className={cn(
              "cursor-pointer rounded-lg border p-5 transition-all duration-300",
              isSelected ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
            )}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={cn("font-medium text-lg", isSelected ? "text-primary" : "text-foreground")}>{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">${parseFloat(item.defaultPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                {isSelected && <Check className="text-primary w-5 h-5" />}
              </div>
            </div>
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
          </motion.div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep.id) {
      case "package":
        return (
          <div className="px-8 md:px-10 py-4 space-y-4">
            {packages.map((pkg) => {
              const isSelected = selections.packageId === pkg.id;
              return (
                <motion.div
                  key={pkg.id}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => handlePackageSelect(pkg.id)}
                  data-testid={`option-${pkg.id}`}
                  className={cn(
                    "cursor-pointer rounded-lg border p-5 transition-all duration-300",
                    isSelected ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn("font-medium text-lg", isSelected ? "text-primary" : "text-foreground")}>{pkg.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-muted-foreground">${parseFloat(pkg.defaultPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      {isSelected && <Check className="text-primary w-5 h-5" />}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                  {pkg.includedItems.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Includes:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.includedItems.map((item) => (
                          <span key={item.id} className="text-xs bg-white/5 text-muted-foreground px-2 py-0.5 rounded">{item.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        );

      case "merchandise":
        return renderToggleList(merchandiseItems, selections.merchandiseIds || [], handleMerchandiseToggle);

      case "floral":
        return renderToggleList(florals, selections.floralIds || [], handleFloralToggle);

      case "add-ons":
        return renderToggleList(addOns, selections.addOnIds || [], handleAddOnToggle);

      case "cash-advances":
        return renderToggleList(cashAdvances, selections.cashAdvanceIds || [], handleCashAdvanceToggle);

      case "review":
        return (
          <div className="px-8 md:px-10 py-4 space-y-6">
            {selectedPackage && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm uppercase tracking-wider text-primary font-medium">{selectedPackage.name}</span>
                </div>
                <div className="space-y-2">
                  {selectedPackage.includedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center group text-sm">
                      <span className="text-foreground/80">{item.name}</span>
                      <div className="flex items-center gap-2">
                        {selections.overrides?.[item.id] && (
                          <button onClick={() => handleRemoveOverride(item.id)} className="text-xs text-red-400 hover:text-red-300" data-testid={`remove-override-${item.id}`}>
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        {editingOverride === item.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={overrideValue}
                              onChange={(e) => setOverrideValue(e.target.value)}
                              className="w-24 h-7 text-xs"
                              data-testid={`input-override-${item.id}`}
                            />
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleOverride(item.id)} data-testid={`save-override-${item.id}`}>OK</Button>
                          </div>
                        ) : (
                          <span
                            className={cn("font-mono cursor-pointer hover:text-primary", selections.overrides?.[item.id] ? "text-amber-400" : "text-muted-foreground")}
                            onClick={() => { setEditingOverride(item.id); setOverrideValue(String(getPrice(item))); }}
                            data-testid={`price-${item.id}`}
                          >
                            ${getPrice(item).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allSelectedItems.filter((si) => !selectedPackage?.includedItems.some((inc) => inc.id === si.item.id)).length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Additional Selections</p>
                <div className="space-y-2">
                  {allSelectedItems
                    .filter((si) => !selectedPackage?.includedItems.some((inc) => inc.id === si.item.id))
                    .map((si) => (
                      <div key={si.item.id} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="text-foreground/80">{si.item.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({si.section})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingOverride === si.item.id ? (
                            <div className="flex items-center gap-1">
                              <Input type="number" value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} className="w-24 h-7 text-xs" data-testid={`input-override-${si.item.id}`} />
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleOverride(si.item.id)} data-testid={`save-override-${si.item.id}`}>OK</Button>
                            </div>
                          ) : (
                            <span
                              className={cn("font-mono cursor-pointer hover:text-primary", selections.overrides?.[si.item.id] ? "text-amber-400" : "text-muted-foreground")}
                              onClick={() => { setEditingOverride(si.item.id); setOverrideValue(String(getPrice(si.item))); }}
                              data-testid={`price-${si.item.id}`}
                            >
                              ${getPrice(si.item).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {(selections.customItems || []).length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Custom Line Items</p>
                <div className="space-y-2">
                  {(selections.customItems || []).map((ci, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRemoveCustomItem(idx)} className="text-red-400 hover:text-red-300" data-testid={`remove-custom-${idx}`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="text-foreground/80">{ci.description}</span>
                        <span className="text-xs text-muted-foreground">({ci.section})</span>
                      </div>
                      <span className="font-mono text-muted-foreground">${ci.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/5 rounded-lg p-4 border border-dashed border-white/10">
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Add Custom Line Item</p>
              <div className="flex gap-2 items-end">
                <div className="flex-grow">
                  <Input placeholder="Description" value={customItemDesc} onChange={(e) => setCustomItemDesc(e.target.value)} className="h-9 text-sm" data-testid="input-custom-desc" />
                </div>
                <select value={customItemSection} onChange={(e) => setCustomItemSection(e.target.value)} className="h-9 bg-background border border-white/10 rounded-md px-2 text-sm text-foreground" data-testid="select-custom-section">
                  <option value="service">Service</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="cash-advance">Cash Advance</option>
                </select>
                <Input type="number" placeholder="Amount" value={customItemAmount} onChange={(e) => setCustomItemAmount(e.target.value)} className="w-28 h-9 text-sm" data-testid="input-custom-amount" />
                <Button size="sm" className="h-9" onClick={handleAddCustomItem} data-testid="button-add-custom">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const previewImages: Record<StepId, string> = {
    package: "/assets/hero-chapel.png",
    merchandise: isCremation ? "/assets/texture-marble.png" : "/assets/casket-mahogany.png",
    floral: "/assets/flowers-seasonal.png",
    "add-ons": "/assets/ceremonial-detail.png",
    "cash-advances": "/assets/staff-interaction.png",
    review: "/assets/hero-chapel.png",
  };

  const previewCaptions: Record<StepId, string> = {
    package: "A dignified beginning to a meaningful farewell.",
    merchandise: isCremation ? "A lasting vessel for cherished memories." : "Craftsmanship that honors a lifetime.",
    floral: "Nature's beauty as a final tribute.",
    "add-ons": "Thoughtful touches that make the service personal.",
    "cash-advances": "Third-party services coordinated on your behalf.",
    review: "Every detail, carefully considered.",
  };

  return (
    <StaffLayout>
      <div className="h-[calc(100vh-60px)] md:h-screen w-full flex flex-col md:flex-row overflow-hidden bg-background">
        <div className="w-full md:w-[60%] h-[40vh] md:h-full relative overflow-hidden bg-black/90">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img src={previewImages[currentStep.id]} alt="Preview" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
            <motion.div key={currentStep.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="font-serif text-2xl md:text-4xl text-white/90 leading-relaxed italic max-w-2xl">
                "{previewCaptions[currentStep.id]}"
              </p>
              {arrangement && (
                <p className="text-white/50 text-sm mt-4 uppercase tracking-widest">{arrangement.familyName}</p>
              )}
            </motion.div>
          </div>
        </div>

        <div className="w-full md:w-[40%] h-full min-h-0 overflow-y-auto bg-card border-l border-white/5 relative z-20">
          <div className="p-8 md:p-10 pb-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-mono text-primary tracking-widest uppercase">
                Step {safeStepIndex + 1} of {steps.length}
              </span>
              <div className="h-[1px] flex-grow bg-white/10" />
              {saveMutation.isPending && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{currentStep.title}</h2>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">{currentStep.description}</p>
          </div>

          {renderStepContent()}

          <div className="p-6 md:p-8 bg-background border-t border-white/5 flex items-center justify-between sticky bottom-0">
            <Button variant="ghost" onClick={handleBack} disabled={safeStepIndex === 0} className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent" data-testid="button-back">
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
                disabled={currentStep.id === "package" && !selections.packageId}
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
              {steps.map((step, idx) => {
                let label = "Pending selection...";
                let completed = false;

                if (step.id === "package" && selections.packageId) {
                  label = selectedPackage?.name || "Selected";
                  completed = true;
                } else if (step.id === "merchandise" && (selections.merchandiseIds || []).length > 0) {
                  label = `${(selections.merchandiseIds || []).length} item(s) selected`;
                  completed = true;
                } else if (step.id === "floral" && (selections.floralIds || []).length > 0) {
                  label = `${(selections.floralIds || []).length} arrangement(s) selected`;
                  completed = true;
                } else if (step.id === "add-ons" && (selections.addOnIds || []).length > 0) {
                  label = `${(selections.addOnIds || []).length} add-on(s) selected`;
                  completed = true;
                } else if (step.id === "cash-advances" && (selections.cashAdvanceIds || []).length > 0) {
                  label = `${(selections.cashAdvanceIds || []).length} item(s) selected`;
                  completed = true;
                } else if (step.id === "review") {
                  label = "Final review";
                  completed = false;
                }

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border text-[10px]",
                      completed ? "border-primary bg-primary text-primary-foreground" : "border-white/10 text-muted-foreground"
                    )}>
                      {completed ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">{step.title}</span>
                      {completed ? (
                        <span className="text-lg font-serif text-white">{label}</span>
                      ) : (
                        <span className="text-sm text-white/30 italic">{label}</span>
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

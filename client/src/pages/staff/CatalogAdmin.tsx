import { StaffLayout } from "@/components/layout/StaffLayout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Package, Settings, DollarSign, Plus, Save, Loader2, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { ServiceCatalogItem } from "@shared/schema";

type TabId = "package" | "service" | "merchandise" | "add-on" | "cash-advance";

const tabs: { id: TabId; label: string }[] = [
  { id: "package", label: "Packages" },
  { id: "service", label: "Services" },
  { id: "merchandise", label: "Merchandise" },
  { id: "add-on", label: "Add-Ons" },
  { id: "cash-advance", label: "Cash Advances" },
];

export default function CatalogAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("package");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ServiceCatalogItem>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", defaultPrice: "", category: "", displayOrder: 0 });
  const { isAuthenticated, isDirector, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: catalogItems = [], isLoading } = useQuery<ServiceCatalogItem[]>({
    queryKey: ["/api/service-catalog"],
    queryFn: async () => {
      const res = await fetch("/api/service-catalog", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceCatalogItem> }) => {
      const res = await apiRequest("PATCH", `/api/service-catalog/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-catalog"] });
      toast({ title: "Updated", description: "Catalog item updated successfully." });
      setEditingId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update item.", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/service-catalog", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-catalog"] });
      toast({ title: "Created", description: "New catalog item created." });
      setIsAdding(false);
      setNewItem({ name: "", description: "", defaultPrice: "", category: "", displayOrder: 0 });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create item.", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isDirector)) {
      setLocation("/staff/dashboard");
    }
  }, [authLoading, isAuthenticated, isDirector, setLocation]);

  if (!authLoading && (!isAuthenticated || !isDirector)) return null;

  const filteredItems = catalogItems.filter((i) => i.itemType === activeTab);
  const packageItems = catalogItems.filter((i) => i.itemType === "package");

  const startEdit = (item: ServiceCatalogItem) => {
    setEditingId(item.id);
    setEditValues({ name: item.name, description: item.description, defaultPrice: item.defaultPrice, category: item.category, displayOrder: item.displayOrder });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({ id: editingId, data: editValues });
  };

  const handleCreate = () => {
    createMutation.mutate({
      itemType: activeTab,
      name: newItem.name,
      description: newItem.description,
      defaultPrice: newItem.defaultPrice,
      category: newItem.category,
      displayOrder: newItem.displayOrder,
      includedIn: [],
      isActive: true,
    });
  };

  const toggleIncludedIn = (itemId: string, packageId: string) => {
    const item = catalogItems.find((i) => i.id === itemId);
    if (!item) return;
    const current = (item.includedIn as string[]) || [];
    const updated = current.includes(packageId) ? current.filter((id) => id !== packageId) : [...current, packageId];
    updateMutation.mutate({ id: itemId, data: { includedIn: updated } });
  };

  return (
    <StaffLayout>
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-3xl text-foreground">Service Catalog</h1>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setEditingId(null); setIsAdding(false); }}
                data-testid={`tab-${tab.id}`}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-card border border-white/5 rounded-lg p-5" data-testid={`catalog-item-${item.id}`}>
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          value={editValues.name || ""}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          placeholder="Name"
                          className="h-9"
                          data-testid="input-edit-name"
                        />
                        <Input
                          value={editValues.defaultPrice || ""}
                          onChange={(e) => setEditValues({ ...editValues, defaultPrice: e.target.value })}
                          placeholder="Price"
                          type="number"
                          step="0.01"
                          className="h-9"
                          data-testid="input-edit-price"
                        />
                        <Input
                          value={editValues.category || ""}
                          onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                          placeholder="Category"
                          className="h-9"
                          data-testid="input-edit-category"
                        />
                      </div>
                      <Input
                        value={editValues.description || ""}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                        placeholder="Description"
                        className="h-9"
                        data-testid="input-edit-description"
                      />

                      {activeTab !== "package" && (
                        <div className="mt-2">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Included in Packages:</p>
                          <div className="flex flex-wrap gap-2">
                            {packageItems.map((pkg) => {
                              const isIncluded = ((item.includedIn as string[]) || []).includes(pkg.id);
                              return (
                                <button
                                  key={pkg.id}
                                  onClick={() => toggleIncludedIn(item.id, pkg.id)}
                                  data-testid={`toggle-include-${item.id}-${pkg.id}`}
                                  className={cn(
                                    "text-xs px-3 py-1.5 rounded-full border transition-all",
                                    isIncluded ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                                  )}
                                >
                                  {isIncluded && <Check className="w-3 h-3 inline mr-1" />}
                                  {pkg.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} data-testid="button-cancel-edit">
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending} data-testid="button-save-edit">
                          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between cursor-pointer" onClick={() => startEdit(item)}>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-foreground">{item.name}</span>
                          {item.category && <span className="text-xs bg-white/5 text-muted-foreground px-2 py-0.5 rounded">{item.category}</span>}
                        </div>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        {activeTab !== "package" && ((item.includedIn as string[]) || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {((item.includedIn as string[]) || []).map((pkgId) => {
                              const pkg = packageItems.find((p) => p.id === pkgId);
                              return pkg ? (
                                <span key={pkgId} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{pkg.name}</span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-lg text-foreground">{parseFloat(item.defaultPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isAdding ? (
                <div className="bg-card border border-dashed border-primary/30 rounded-lg p-5 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item Name" className="h-9" data-testid="input-new-name" />
                    <Input value={newItem.defaultPrice} onChange={(e) => setNewItem({ ...newItem, defaultPrice: e.target.value })} placeholder="Price" type="number" step="0.01" className="h-9" data-testid="input-new-price" />
                    <Input value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} placeholder="Category" className="h-9" data-testid="input-new-category" />
                  </div>
                  <Input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description" className="h-9" data-testid="input-new-description" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} data-testid="button-cancel-new">Cancel</Button>
                    <Button size="sm" onClick={handleCreate} disabled={!newItem.name || !newItem.defaultPrice || createMutation.isPending} data-testid="button-save-new">
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                      Create
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full border-dashed border-white/10 hover:bg-white/5 text-muted-foreground" onClick={() => setIsAdding(true)} data-testid="button-add-item">
                  <Plus className="w-4 h-4 mr-2" /> Add New {tabs.find((t) => t.id === activeTab)?.label.slice(0, -1) || "Item"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}

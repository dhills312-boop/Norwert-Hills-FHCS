import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Flame,
  Loader2,
  Package,
  CreditCard,
  Truck,
  Lock,
  Unlock,
  FolderOpen,
} from "lucide-react";
import type { CremationOrder, CremationEvent, CremationPhase, CremationEventType } from "@shared/schema";
import { cremationPhases } from "@shared/schema";

const phaseLabels: Record<CremationPhase, string> = {
  intake: "Intake",
  forms: "Forms",
  payment: "Payment",
  fulfillment: "Fulfillment",
  completed: "Completed",
};

const phaseIcons: Record<CremationPhase, React.ReactNode> = {
  intake: <FileText className="h-4 w-4" />,
  forms: <FileText className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  fulfillment: <Package className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
};

const eventTypeLabels: Record<string, string> = {
  ORDER_CREATED: "Order Created",
  FORM_SUBMITTED: "Form Submitted",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  REMAINS_RECEIVED: "Remains Received",
  CREMATION_SCHEDULED: "Cremation Scheduled",
  CREMATION_COMPLETED: "Cremation Completed",
  RELEASE_RECORDED: "Release Recorded",
  SHIPMENT_RECORDED: "Shipment Recorded",
  CASE_COMPLETED: "Case Completed",
};

const fulfillmentActions: { eventType: CremationEventType; label: string; icon: React.ReactNode }[] = [
  { eventType: "REMAINS_RECEIVED", label: "Remains Received", icon: <Package className="h-4 w-4" /> },
  { eventType: "CREMATION_SCHEDULED", label: "Cremation Scheduled", icon: <Clock className="h-4 w-4" /> },
  { eventType: "CREMATION_COMPLETED", label: "Cremation Completed", icon: <Flame className="h-4 w-4" /> },
  { eventType: "RELEASE_RECORDED", label: "Release Recorded", icon: <Truck className="h-4 w-4" /> },
  { eventType: "SHIPMENT_RECORDED", label: "Shipment Recorded", icon: <Truck className="h-4 w-4" /> },
];

function generateJotFormPrefillUrl(orderToken: string, serviceType: string, formName: string): string {
  const baseUrl = "https://jotform.com/TEMPLATE";
  const params = new URLSearchParams({
    order_token: orderToken,
    service_type: serviceType || "cremation",
  });
  return `${baseUrl}?${params.toString()}`;
}

export default function CremationCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/staff/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const { data: order, isLoading: orderLoading } = useQuery<CremationOrder>({
    queryKey: ["/api/cremation/orders/by-id", id],
    queryFn: async () => {
      const res = await fetch(`/api/cremation/orders/by-id/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json();
    },
    enabled: isAuthenticated && !!id,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<CremationEvent[]>({
    queryKey: ["/api/cremation/orders", id, "events"],
    queryFn: async () => {
      const res = await fetch(`/api/cremation/orders/${id}/events`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    enabled: isAuthenticated && !!id,
  });

  const logEventMutation = useMutation({
    mutationFn: async (eventType: CremationEventType) => {
      const res = await apiRequest("POST", `/api/cremation/orders/${id}/events`, { eventType });
      return res.json();
    },
    onSuccess: (_data, eventType) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cremation/orders", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/cremation/orders", id, "events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cremation/orders"] });
      toast({
        title: "Event Recorded",
        description: `${eventTypeLabels[eventType] || eventType} has been logged.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (authLoading || orderLoading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </StaffLayout>
    );
  }

  if (!order) {
    return (
      <StaffLayout>
        <div className="p-4 md:p-8 max-w-4xl mx-auto text-center text-muted-foreground">
          Order not found.
        </div>
      </StaffLayout>
    );
  }

  const currentPhase = order.currentPhase as CremationPhase;
  const currentPhaseIndex = cremationPhases.indexOf(currentPhase);
  const loggedEventTypes = new Set(events.map((e) => e.eventType));

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/staff/cremation")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="font-serif text-xl md:text-2xl text-foreground" data-testid="text-case-title">
            {order.decedentName}
          </h1>
          <Badge
            className={`text-xs border ${
              currentPhase === "completed"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-primary/20 text-primary border-primary/30"
            }`}
            data-testid="badge-current-phase"
          >
            {phaseLabels[currentPhase] || currentPhase}
          </Badge>
        </div>

        <div className="mb-8" data-testid="phase-progress">
          <div className="flex items-center justify-between">
            {cremationPhases.map((phase, idx) => {
              const isCompleted = idx < currentPhaseIndex;
              const isCurrent = idx === currentPhaseIndex;
              return (
                <div key={phase} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : isCurrent
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-card border-white/10 text-muted-foreground"
                      }`}
                      data-testid={`phase-indicator-${phase}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        phaseIcons[phase]
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        isCompleted
                          ? "text-green-400"
                          : isCurrent
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {phaseLabels[phase]}
                    </span>
                  </div>
                  {idx < cremationPhases.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        idx < currentPhaseIndex ? "bg-green-500/50" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="border-white/5 bg-card" data-testid="card-case-summary">
            <CardHeader>
              <CardTitle className="text-base font-sans">Case Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Token</span>
                <span className="font-mono text-foreground flex items-center gap-2" data-testid="text-order-token">
                  {order.orderToken.slice(0, 16)}...
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(order.orderToken, "Order token")}
                    data-testid="button-copy-token"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decedent</span>
                <span className="text-foreground" data-testid="text-decedent-name">{order.decedentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact</span>
                <span className="text-foreground" data-testid="text-contact-name">{order.contactName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground" data-testid="text-contact-email">{order.contactEmail}</span>
              </div>
              {order.contactPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground" data-testid="text-contact-phone">{order.contactPhone}</span>
                </div>
              )}
              {order.stateOfDeath && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">State of Death</span>
                  <span className="text-foreground" data-testid="text-state-of-death">{order.stateOfDeath}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground" data-testid="text-created-date">
                  {new Date(order.createdAt!).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card" data-testid="card-status-info">
            <CardHeader>
              <CardTitle className="text-base font-sans">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant="outline" data-testid="text-payment-status">
                  {order.paymentStatus || "Not started"}
                </Badge>
              </div>
              {order.paymentReference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Ref</span>
                  <span className="text-foreground font-mono text-xs" data-testid="text-payment-ref">
                    {order.paymentReference}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Compliance Packet</span>
                <div className="flex items-center gap-2" data-testid="text-packet-status">
                  {order.packetLocked ? (
                    <>
                      <Lock className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Not yet generated</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Drive Folder</span>
                {order.driveRootFolderUrl ? (
                  <a
                    href={order.driveRootFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                    data-testid="link-drive-folder"
                  >
                    <FolderOpen className="h-3 w-3" />
                    Open in Drive
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground" data-testid="text-no-drive">No folder</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {currentPhase === "forms" && (
          <Card className="border-white/5 bg-card mb-6" data-testid="card-form-links">
            <CardHeader>
              <CardTitle className="text-base font-sans">Form Links</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate prefill URLs for required cremation forms. Copy and share with the family.
              </p>
              <div className="space-y-3">
                {["Authorization for Cremation", "Identification Form", "Disposition Permit"].map(
                  (formName) => {
                    const url = generateJotFormPrefillUrl(order.orderToken, "cremation", formName);
                    return (
                      <div
                        key={formName}
                        className="flex items-center justify-between p-3 rounded-md bg-white/5"
                        data-testid={`form-link-${formName.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{formName}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(url, formName)}
                          data-testid={`button-copy-form-${formName.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {copiedUrl === formName ? "Copied!" : "Copy Link"}
                        </Button>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentPhase === "payment" && (
          <Card className="border-white/5 bg-card mb-6" data-testid="card-payment-link">
            <CardHeader>
              <CardTitle className="text-base font-sans">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a Square payment link to share with the family.
              </p>
              <Button
                onClick={() => {
                  const paymentUrl = `https://checkout.square.site/pay/${order.orderToken}`;
                  copyToClipboard(paymentUrl, "Payment link");
                }}
                data-testid="button-generate-payment-link"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Generate Payment Link
              </Button>
            </CardContent>
          </Card>
        )}

        {currentPhase === "fulfillment" && (
          <Card className="border-white/5 bg-card mb-6" data-testid="card-fulfillment-actions">
            <CardHeader>
              <CardTitle className="text-base font-sans">Fulfillment Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Record operational milestones as they occur.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fulfillmentActions.map((action) => {
                  const isLogged = loggedEventTypes.has(action.eventType);
                  return (
                    <Button
                      key={action.eventType}
                      variant={isLogged ? "secondary" : "outline"}
                      className={`justify-start ${isLogged ? "opacity-60" : ""}`}
                      onClick={() => logEventMutation.mutate(action.eventType)}
                      disabled={logEventMutation.isPending}
                      data-testid={`button-action-${action.eventType.toLowerCase().replace(/_/g, "-")}`}
                    >
                      {isLogged ? (
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
                      ) : (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {action.label}
                      {isLogged && <span className="ml-auto text-xs text-green-400">Done</span>}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-white/5 bg-card" data-testid="card-event-timeline">
          <CardHeader>
            <CardTitle className="text-base font-sans">Event Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No events recorded yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
                <div className="space-y-4">
                  {[...events].reverse().map((event) => (
                    <div
                      key={event.id}
                      className="relative pl-10"
                      data-testid={`event-${event.id}`}
                    >
                      <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-sm font-medium text-foreground" data-testid={`text-event-type-${event.id}`}>
                            {eventTypeLabels[event.eventType] || event.eventType}
                          </span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <span data-testid={`text-event-actor-${event.id}`}>
                              {event.actorType === "system"
                                ? "System"
                                : event.actorType === "staff"
                                ? "Staff"
                                : "Family"}
                            </span>
                            {event.details &&
                              Object.keys(event.details as Record<string, unknown>).length > 0 && (
                                <span className="ml-2" data-testid={`text-event-details-${event.id}`}>
                                  {JSON.stringify(event.details)}
                                </span>
                              )}
                          </div>
                        </div>
                        <span
                          className="text-xs text-muted-foreground whitespace-nowrap ml-4"
                          data-testid={`text-event-date-${event.id}`}
                        >
                          {new Date(event.createdAt!).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}

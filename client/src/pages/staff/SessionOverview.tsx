import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, useLocation, Link } from "wouter";
import { useState } from "react";
import {
  ArrowLeft, FileText, Send, Tablet, Copy, CheckCircle2, Clock, AlertTriangle,
  XCircle, Loader2, ShieldCheck, ChevronRight, ExternalLink, ClipboardCheck,
  FileCheck, FolderOpen, Pen, ToggleLeft, ToggleRight, Landmark, ScrollText
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface FormTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  jotformId: string | null;
  jotformUrl: string | null;
  pdfPath: string | null;
  pandadocTemplateId: string | null;
  pandadocRecipientRole: string | null;
  authWorkflowGroup: string | null;
  requiredForServiceTypes: string[];
  sortOrder: number;
}

interface FormInstanceEnriched {
  id: string;
  arrangementId: string;
  templateId: string;
  status: string;
  formUrl: string | null;
  sentVia: string | null;
  sentTo: string | null;
  sentAt: string | null;
  completedAt: string | null;
  pandadocDocumentId: string | null;
  externalLink: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  createdAt: string;
  template: FormTemplate | null;
}

interface Arrangement {
  id: string;
  familyName: string;
  email: string | null;
  phone: string | null;
  status: string;
  nextStep: string;
  scheduledTime: string | null;
  selections: Record<string, string> | null;
  notes: string | null;
  caseToken: string | null;
  createdAt: string;
}

interface SessionDocChecklist {
  id?: string;
  arrangementId?: string;
  documentReceived: boolean;
  filedToCase: boolean;
  certificateSubmitted: boolean;
  certificateApproved: boolean;
  ssnPurged: boolean;
  notes: string | null;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string; bg: string }> = {
  not_sent: { icon: Clock, color: "text-muted-foreground", label: "Not Sent", bg: "bg-muted/20" },
  sent: { icon: Send, color: "text-amber-400", label: "Sent", bg: "bg-amber-950/20" },
  completed: { icon: CheckCircle2, color: "text-green-400", label: "Completed", bg: "bg-green-950/20" },
  error: { icon: XCircle, color: "text-red-400", label: "Error", bg: "bg-red-950/20" },
};

function buildJotformUrl(fi: FormInstanceEnriched, arrangement: Arrangement): string | null {
  const tmpl = fi.template;
  if (!tmpl) return null;
  const jotformId = tmpl.jotformId || "";
  const baseUrl = tmpl.jotformUrl;

  const serviceType = arrangement.selections?.["service-type"] || "";
  const caseToken = arrangement.caseToken || arrangement.id;

  const params = new URLSearchParams({
    case_token: caseToken,
    session_id: arrangement.id,
    family_display_name: arrangement.familyName,
    service_type: serviceType,
  });

  // Prefer template-level base URL, then a real Jotform ID, then fall back to stored instance URL.
  // Always return something so Copy Link is available even for placeholder forms.
  if (baseUrl) return `${baseUrl}?${params}`;
  if (jotformId && !jotformId.startsWith("PLACEHOLDER")) return `https://jotform.com/${jotformId}?${params}`;

  // Placeholder: return a URL with the placeholder ID so staff can at least see the structure.
  // Copy Link will warn the user; Open on Tablet is suppressed for placeholder URLs.
  return `https://jotform.com/${jotformId || "NOT_CONFIGURED"}?${params}`;
}

function FormItemCard({
  fi,
  arrangement,
  onSend,
  onOpenTablet,
  onCopyLink,
  onMarkComplete,
  onOpenDocument,
  onSendPandaDoc,
}: {
  fi: FormInstanceEnriched;
  arrangement: Arrangement;
  onSend: () => void;
  onOpenTablet: () => void;
  onCopyLink: () => void;
  onMarkComplete: () => void;
  onOpenDocument: () => void;
  onSendPandaDoc: () => void;
}) {
  const tmpl = fi.template;
  const sc = statusConfig[fi.status] || statusConfig.not_sent;
  const StatusIcon = sc.icon;
  const isJotform = tmpl?.type === "jotform";
  const isPandaDoc = tmpl?.type === "pandadoc";
  const jotformUrl = isJotform ? buildJotformUrl(fi, arrangement) : null;
  const pandadocLink = fi.externalLink;
  const isRequired = tmpl?.requiredForServiceTypes?.includes("all") || tmpl?.requiredForServiceTypes?.length === 0 || true;

  return (
    <div
      className={`rounded-xl border border-white/5 p-4 ${sc.bg}`}
      data-testid={`form-instance-${fi.id}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon className={`h-4 w-4 flex-shrink-0 ${sc.color}`} />
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground leading-tight" data-testid={`form-name-${fi.id}`}>
              {tmpl?.name || "Unknown Form"}
            </p>
            {fi.sentAt && (
              <p className="text-xs text-muted-foreground mt-0.5" data-testid={`form-sent-info-${fi.id}`}>
                Sent {fi.sentVia ? `via ${fi.sentVia}` : ""} · {new Date(fi.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            )}
            {fi.completedAt && (
              <p className="text-xs text-green-400/80 mt-0.5">
                Completed {new Date(fi.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            )}
            {isPandaDoc && fi.recipientName && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Recipient: {fi.recipientName}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-xs flex-shrink-0 ${sc.color} border-current`}
          data-testid={`form-status-${fi.id}`}
        >
          {sc.label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {isJotform && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs border-white/10 hover:bg-white/5 flex-1 sm:flex-none"
              onClick={onSend}
              data-testid={`button-send-${fi.id}`}
            >
              <Send className="h-3 w-3 mr-1.5" /> Send Link
            </Button>
            {/* Open on Tablet only for real (non-placeholder) form IDs */}
            {jotformUrl && tmpl?.jotformId && !tmpl.jotformId.startsWith("PLACEHOLDER") && !tmpl?.jotformId.includes("NOT_CONFIGURED") && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs border-white/10 hover:bg-white/5"
                onClick={onOpenTablet}
                data-testid={`button-tablet-${fi.id}`}
              >
                <Tablet className="h-3 w-3 mr-1.5" /> Open on Tablet
              </Button>
            )}
            {/* Copy Link always shown for Jotform forms */}
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs border-white/10 hover:bg-white/5"
              onClick={onCopyLink}
              data-testid={`button-copy-${fi.id}`}
            >
              <Copy className="h-3 w-3 mr-1.5" /> Copy Link
            </Button>
          </>
        )}

        {isPandaDoc && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs border-white/10 hover:bg-white/5 flex-1 sm:flex-none"
              onClick={onSendPandaDoc}
              data-testid={`button-send-pandadoc-${fi.id}`}
            >
              <Pen className="h-3 w-3 mr-1.5" /> Send for Signature
            </Button>
            {pandadocLink && (
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs border-white/10 hover:bg-white/5"
                onClick={onOpenDocument}
                data-testid={`button-open-doc-${fi.id}`}
              >
                <ExternalLink className="h-3 w-3 mr-1.5" /> Open Document
              </Button>
            )}
          </>
        )}

        <Button
          size="sm"
          variant={fi.status === "completed" ? "default" : "outline"}
          className={`h-9 text-xs ${fi.status === "completed" ? "bg-green-900 text-green-100 border-green-800" : "border-white/10 hover:bg-white/5"}`}
          onClick={onMarkComplete}
          data-testid={`button-complete-${fi.id}`}
        >
          <CheckCircle2 className="h-3 w-3 mr-1.5" />
          {fi.status === "completed" ? "Completed" : "Mark Complete"}
        </Button>
      </div>

      {isPandaDoc && tmpl?.pandadocTemplateId && (
        <p className="text-xs text-muted-foreground/50 mt-2 font-mono">
          Template: {tmpl.pandadocTemplateId}
        </p>
      )}
    </div>
  );
}

function ChecklistToggle({
  label,
  description,
  checked,
  onToggle,
  sensitive,
  testId,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  sensitive?: boolean;
  testId: string;
}) {
  return (
    <button
      className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors text-left ${
        checked
          ? sensitive ? "border-amber-800/40 bg-amber-950/20" : "border-green-800/30 bg-green-950/15"
          : "border-white/5 bg-background/20 hover:bg-white/3"
      }`}
      onClick={onToggle}
      data-testid={testId}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${checked ? (sensitive ? "text-amber-200" : "text-green-300") : "text-foreground"}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {checked
        ? <ToggleRight className={`h-6 w-6 flex-shrink-0 ${sensitive ? "text-amber-400" : "text-green-400"}`} />
        : <ToggleLeft className="h-6 w-6 flex-shrink-0 text-muted-foreground" />}
    </button>
  );
}

export default function SessionOverview() {
  const [, params] = useRoute("/staff/sessions/:id");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const sessionId = params?.id || "";

  const [sendModal, setSendModal] = useState<{ open: boolean; fi: FormInstanceEnriched | null }>({ open: false, fi: null });
  const [pandadocModal, setPandadocModal] = useState<{ open: boolean; fi: FormInstanceEnriched | null }>({ open: false, fi: null });
  const [sendChannel, setSendChannel] = useState<"email" | "sms">("email");
  const [sendDestination, setSendDestination] = useState("");
  const [pandadocRecipientName, setPandadocRecipientName] = useState("");
  const [pandadocRecipientEmail, setPandadocRecipientEmail] = useState("");
  const [pandadocDocId, setPandadocDocId] = useState("");
  const [directorOverride, setDirectorOverride] = useState(false);

  const { data: arrangement, isLoading: arrLoading } = useQuery<Arrangement>({
    queryKey: [`/api/arrangements/${sessionId}`],
    enabled: isAuthenticated && !!sessionId,
  });

  const { data: formInstances = [], isLoading: formsLoading } = useQuery<FormInstanceEnriched[]>({
    queryKey: [`/api/arrangements/${sessionId}/forms`],
    enabled: isAuthenticated && !!sessionId,
  });

  const { data: checklist } = useQuery<SessionDocChecklist | null>({
    queryKey: [`/api/arrangements/${sessionId}/checklist`],
    enabled: isAuthenticated && !!sessionId,
  });

  const defaultChecklist: SessionDocChecklist = {
    documentReceived: false,
    filedToCase: false,
    certificateSubmitted: false,
    certificateApproved: false,
    ssnPurged: false,
    notes: null,
    ...(checklist || {}),
  };

  const sendMutation = useMutation({
    mutationFn: async ({ fi, channel, destination }: { fi: FormInstanceEnriched; channel: string; destination: string }) => {
      const url = buildJotformUrl(fi, arrangement!);
      await apiRequest("PATCH", `/api/form-instances/${fi.id}`, {
        status: "sent",
        sentVia: channel,
        sentTo: destination,
        externalLink: url,
      });
      await apiRequest("POST", `/api/arrangements/${sessionId}/comm-events`, {
        channel,
        destination,
        templateId: fi.templateId,
        details: `Sent ${fi.template?.name || "form"} link`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/arrangements/${sessionId}/forms`] });
      setSendModal({ open: false, fi: null });
      setSendDestination("");
      toast({ title: "Form link sent", description: "The form link has been sent." });
    },
    onError: () => toast({ title: "Error", description: "Failed to send form link.", variant: "destructive" }),
  });

  const pandadocSendMutation = useMutation({
    mutationFn: async ({ fi, name, email, docId }: { fi: FormInstanceEnriched; name: string; email: string; docId: string }) => {
      const link = docId ? `https://app.pandadoc.com/documents/${docId}` : undefined;
      await apiRequest("PATCH", `/api/form-instances/${fi.id}`, {
        status: docId ? "sent" : fi.status,
        recipientName: name,
        recipientEmail: email,
        pandadocDocumentId: docId || undefined,
        externalLink: link,
        sentVia: "pandadoc",
        sentTo: email,
        ...(docId ? { sentAt: new Date().toISOString() } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/arrangements/${sessionId}/forms`] });
      setPandadocModal({ open: false, fi: null });
      setPandadocRecipientName("");
      setPandadocRecipientEmail("");
      setPandadocDocId("");
      toast({ title: "Authorization saved", description: "Recipient and document ID recorded." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save authorization.", variant: "destructive" }),
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (fi: FormInstanceEnriched) => {
      const newStatus = fi.status === "completed" ? "not_sent" : "completed";
      await apiRequest("PATCH", `/api/form-instances/${fi.id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/arrangements/${sessionId}/forms`] });
      toast({ title: "Status updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update status.", variant: "destructive" }),
  });

  const checklistMutation = useMutation({
    mutationFn: async (data: Partial<SessionDocChecklist>) => {
      await apiRequest("PATCH", `/api/arrangements/${sessionId}/checklist`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/arrangements/${sessionId}/checklist`] });
    },
    onError: () => toast({ title: "Error", description: "Failed to update checklist.", variant: "destructive" }),
  });

  const handleCopyLink = (fi: FormInstanceEnriched) => {
    const url = buildJotformUrl(fi, arrangement!);
    if (!url) return toast({ title: "No link", description: "Form URL not configured yet.", variant: "destructive" });
    const isPlaceholder = fi.template?.jotformId?.startsWith("PLACEHOLDER") || fi.template?.jotformId?.includes("NOT_CONFIGURED");
    navigator.clipboard.writeText(url);
    if (isPlaceholder) {
      toast({ title: "Link copied (form not active)", description: "Add the real Form ID in Form Templates settings before sending.", variant: "destructive" });
    } else {
      toast({ title: "Link copied", description: "Form link copied to clipboard." });
    }
  };

  const handleOpenTablet = (fi: FormInstanceEnriched) => {
    const url = buildJotformUrl(fi, arrangement!);
    if (!url) return toast({ title: "No link", description: "Form URL not configured yet.", variant: "destructive" });
    window.open(url, "_blank");
  };

  const toggleChecklist = (field: keyof SessionDocChecklist) => {
    if (field === "notes") return;
    const current = Boolean(defaultChecklist[field]);
    checklistMutation.mutate({ [field]: !current });
  };

  if (authLoading) {
    return (
      <StaffLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!isAuthenticated) {
    setLocation("/staff/login");
    return null;
  }

  if (arrLoading || formsLoading) {
    return (
      <StaffLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  if (!arrangement) {
    return (
      <StaffLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Session not found.</p>
          <Link href="/staff/dashboard">
            <Button variant="link" className="mt-4 text-primary">Back to Dashboard</Button>
          </Link>
        </div>
      </StaffLayout>
    );
  }

  const serviceType = arrangement.selections?.["service-type"] || "";
  const isCremation = serviceType.toLowerCase().includes("cremation");

  const intakeForms = formInstances.filter(fi => fi.template?.category === "intake" || (!fi.template?.category && fi.template?.type === "jotform"));
  const authForms = formInstances.filter(fi => fi.template?.category === "authorization" || fi.template?.type === "pandadoc");

  const requiredAuthKeys = isCremation
    ? ["Authorization for Removal and Transfer", "Cremation Authorization", "Terms & Conditions"]
    : ["Authorization for Removal and Transfer", "Authorization to Embalm", "Terms & Conditions"];

  const isRequiredAuth = (fi: FormInstanceEnriched) =>
    requiredAuthKeys.some(k => fi.template?.name?.includes(k.split(" ")[0]));

  const allIntakeComplete = intakeForms.length === 0 || intakeForms.every(fi => fi.status === "sent" || fi.status === "completed");
  const allAuthComplete = authForms.length === 0 || authForms.filter(isRequiredAuth).every(fi => fi.status === "completed");
  const canProceedToBuilder = (allIntakeComplete && allAuthComplete) || directorOverride;

  const progressSteps = [
    { key: "new", label: "New" },
    { key: "forms_sent", label: "Forms Sent" },
    { key: "forms_completed", label: "Forms Done" },
    { key: "pending_signature", label: "Pending Sig." },
    { key: "ready_for_service", label: "Ready" },
    { key: "completed", label: "Complete" },
  ];

  const currentStepIndex = allAuthComplete ? 4
    : allIntakeComplete ? 3
    : formInstances.some(fi => fi.status === "sent") ? 1
    : 0;

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto pb-20">

        <div className="flex items-start gap-3 mb-5">
          <Link href="/staff/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground mt-0.5" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl md:text-3xl text-foreground truncate" data-testid="text-session-title">
              {arrangement.familyName}
            </h1>
            <p className="text-muted-foreground text-sm mb-2">
              {arrangement.scheduledTime || "Not scheduled"} · {serviceType || "Service type TBD"}
            </p>
            {arrangement.caseToken && (
              <button
                className="inline-flex items-center gap-2 bg-background/40 border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors group"
                onClick={() => {
                  navigator.clipboard.writeText(arrangement.caseToken!);
                  toast({ title: "Case token copied", description: arrangement.caseToken! });
                }}
                data-testid="button-copy-case-token"
                title="Click to copy case token"
              >
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest">Case Token</span>
                <span className="font-mono text-sm font-semibold text-primary tracking-wider" data-testid="text-case-token">
                  {arrangement.caseToken}
                </span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            )}
          </div>
          <Badge
            variant="outline"
            className="text-xs border-primary/30 text-primary flex-shrink-0 mt-1"
            data-testid="text-session-status"
          >
            {arrangement.status}
          </Badge>
        </div>

        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1" data-testid="workflow-progress">
          {progressSteps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-shrink-0">
              <div className={`flex flex-col items-center`}>
                <div className={`h-2.5 w-2.5 rounded-full border-2 ${
                  i <= currentStepIndex ? "bg-primary border-primary" : "bg-transparent border-white/20"
                }`} />
                <span className={`text-[10px] mt-1 whitespace-nowrap ${
                  i <= currentStepIndex ? "text-primary" : "text-muted-foreground/50"
                }`}>{step.label}</span>
              </div>
              {i < progressSteps.length - 1 && (
                <div className={`h-0.5 w-8 mx-0.5 mb-3 flex-shrink-0 ${
                  i < currentStepIndex ? "bg-primary" : "bg-white/10"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">

          <Card className="border-white/5 bg-card" data-testid="section-intake">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-1">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <h2 className="font-serif text-lg">Intake & Information</h2>
                {allIntakeComplete && intakeForms.length > 0 && (
                  <Badge className="bg-green-900 text-green-100 border-none ml-auto text-xs">All Sent</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4">Jotform intake forms to be completed by or with the family</p>

              {intakeForms.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No intake forms configured for this session.</p>
              ) : (
                <div className="space-y-3">
                  {intakeForms.map(fi => (
                    <FormItemCard
                      key={fi.id}
                      fi={fi}
                      arrangement={arrangement}
                      onSend={() => {
                        setSendModal({ open: true, fi });
                        setSendChannel(arrangement.email ? "email" : "sms");
                        setSendDestination(arrangement.email || arrangement.phone || "");
                      }}
                      onOpenTablet={() => handleOpenTablet(fi)}
                      onCopyLink={() => handleCopyLink(fi)}
                      onMarkComplete={() => markCompleteMutation.mutate(fi)}
                      onOpenDocument={() => {
                        if (fi.externalLink) window.open(fi.externalLink, "_blank");
                      }}
                      onSendPandaDoc={() => {
                        setPandadocModal({ open: true, fi });
                        setPandadocRecipientName(arrangement.familyName);
                        setPandadocRecipientEmail(arrangement.email || "");
                        setPandadocDocId(fi.pandadocDocumentId || "");
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card" data-testid="section-authorizations">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-1">
                <ScrollText className="h-5 w-5 text-primary flex-shrink-0" />
                <h2 className="font-serif text-lg">Legal Authorizations</h2>
                {allAuthComplete && authForms.length > 0 && (
                  <Badge className="bg-green-900 text-green-100 border-none ml-auto text-xs">All Signed</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-1">PandaDoc documents requiring family signature</p>

              {isCremation && (
                <div className="flex items-center gap-2 mb-4 mt-2 text-xs text-amber-300/80 bg-amber-950/20 border border-amber-800/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Cremation case — Authorization for Removal &amp; Cremation Authorization required</span>
                </div>
              )}
              {!isCremation && serviceType && (
                <div className="flex items-center gap-2 mb-4 mt-2 text-xs text-sky-300/80 bg-sky-950/20 border border-sky-800/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Authorization for Removal &amp; Authorization to Embalm required for this service type</span>
                </div>
              )}

              {authForms.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No authorization documents configured for this session.</p>
              ) : (
                <div className="space-y-3">
                  {authForms.map(fi => {
                    const required = isRequiredAuth(fi);
                    return (
                      <div key={fi.id} className="relative">
                        {required && fi.status !== "completed" && (
                          <span className="absolute -top-1.5 left-3 text-[10px] text-amber-400 font-medium z-10">Required</span>
                        )}
                        <FormItemCard
                          fi={fi}
                          arrangement={arrangement}
                          onSend={() => {
                            setSendModal({ open: true, fi });
                            setSendChannel("email");
                            setSendDestination(arrangement.email || "");
                          }}
                          onOpenTablet={() => {
                            if (fi.externalLink) window.open(fi.externalLink, "_blank");
                          }}
                          onCopyLink={() => handleCopyLink(fi)}
                          onMarkComplete={() => markCompleteMutation.mutate(fi)}
                          onOpenDocument={() => {
                            if (fi.externalLink) window.open(fi.externalLink, "_blank");
                          }}
                          onSendPandaDoc={() => {
                            setPandadocModal({ open: true, fi });
                            setPandadocRecipientName(fi.recipientName || arrangement.familyName);
                            setPandadocRecipientEmail(fi.recipientEmail || arrangement.email || "");
                            setPandadocDocId(fi.pandadocDocumentId || "");
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card" data-testid="section-documents">
            <CardContent className="p-5">
              <div className="flex items-center gap-2.5 mb-1">
                <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                <h2 className="font-serif text-lg">Documents & Filing</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Track document receipt, filing, and certificate workflow status</p>

              <div className="space-y-2" data-testid="checklist-items">
                <ChecklistToggle
                  label="Jotform PDFs Received"
                  description="Completed form PDFs received from staging folder"
                  checked={defaultChecklist.documentReceived}
                  onToggle={() => toggleChecklist("documentReceived")}
                  testId="toggle-document-received"
                />
                <ChecklistToggle
                  label="Filed to Case"
                  description="All documents filed to the case folder"
                  checked={defaultChecklist.filedToCase}
                  onToggle={() => toggleChecklist("filedToCase")}
                  testId="toggle-filed-to-case"
                />
                <ChecklistToggle
                  label="Death Certificate Submitted"
                  description="Application submitted to vital records"
                  checked={defaultChecklist.certificateSubmitted}
                  onToggle={() => toggleChecklist("certificateSubmitted")}
                  testId="toggle-certificate-submitted"
                />
                <ChecklistToggle
                  label="Death Certificate Approved"
                  description="Certificate returned and approved"
                  checked={defaultChecklist.certificateApproved}
                  onToggle={() => toggleChecklist("certificateApproved")}
                  testId="toggle-certificate-approved"
                />

                <Separator className="my-3 bg-white/5" />
                <p className="text-xs font-medium text-amber-400/80 uppercase tracking-wide px-1">SSN Handling</p>
                <ChecklistToggle
                  label="SSN Purged"
                  description="Social Security Number securely purged after death certificate filing"
                  checked={defaultChecklist.ssnPurged}
                  onToggle={() => toggleChecklist("ssnPurged")}
                  sensitive
                  testId="toggle-ssn-purged"
                />
              </div>

              <div className="mt-4">
                <Label className="text-xs text-muted-foreground mb-1.5 block">Document Notes</Label>
                <Textarea
                  className="bg-background/30 border-white/10 text-sm resize-none min-h-[80px]"
                  placeholder="Any notes about document status, missing items, special handling..."
                  value={defaultChecklist.notes || ""}
                  onChange={(e) => {
                    clearTimeout((window as any).__notesTimer);
                    (window as any).__notesTimer = setTimeout(() => {
                      checklistMutation.mutate({ notes: e.target.value });
                    }, 800);
                  }}
                  data-testid="input-document-notes"
                />
              </div>
            </CardContent>
          </Card>

          {user?.role === "director" && !canProceedToBuilder && (
            <Card className="border-white/5 bg-card" data-testid="director-override-section">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Director Override</p>
                    <p className="text-xs text-muted-foreground">Skip form requirements to access Package Builder</p>
                  </div>
                  <Button
                    size="sm"
                    variant={directorOverride ? "default" : "outline"}
                    className={directorOverride ? "bg-primary text-primary-foreground" : "border-white/10"}
                    onClick={() => setDirectorOverride(!directorOverride)}
                    data-testid="button-director-override"
                  >
                    {directorOverride ? "Enabled" : "Override"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <Link href={canProceedToBuilder ? `/staff/builder?arrangement=${sessionId}` : "#"}>
            <Button
              className={`w-full h-12 text-base ${canProceedToBuilder ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
              disabled={!canProceedToBuilder}
              data-testid="button-package-builder"
            >
              <Landmark className="h-4 w-4 mr-2" />
              Package Builder
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href={`/staff/sessions/${sessionId}/announcement`}>
              <Button
                variant="outline"
                className="w-full h-11 border-white/10 hover:bg-white/5 text-sm"
                data-testid="button-manage-announcement"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Announcement
              </Button>
            </Link>
            <Link href={`/staff/cremation`}>
              <Button
                variant="outline"
                className="w-full h-11 border-white/10 hover:bg-white/5 text-sm"
                data-testid="button-cremation"
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Cremation
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={sendModal.open} onOpenChange={(open) => setSendModal({ open, fi: open ? sendModal.fi : null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Send Form Link</DialogTitle>
          </DialogHeader>
          {sendModal.fi && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send <span className="text-foreground font-medium">{sendModal.fi.template?.name}</span> to the {arrangement.familyName}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sendChannel === "email" ? "default" : "outline"}
                  className={sendChannel === "email" ? "bg-primary text-primary-foreground" : "border-white/10"}
                  onClick={() => { setSendChannel("email"); setSendDestination(arrangement.email || ""); }}
                  data-testid="button-channel-email"
                >Email</Button>
                <Button
                  size="sm"
                  variant={sendChannel === "sms" ? "default" : "outline"}
                  className={sendChannel === "sms" ? "bg-primary text-primary-foreground" : "border-white/10"}
                  onClick={() => { setSendChannel("sms"); setSendDestination(arrangement.phone || ""); }}
                  data-testid="button-channel-sms"
                >SMS</Button>
              </div>
              <div className="space-y-2">
                <Label>{sendChannel === "email" ? "Email Address" : "Phone Number"}</Label>
                <Input
                  value={sendDestination}
                  onChange={(e) => setSendDestination(e.target.value)}
                  placeholder={sendChannel === "email" ? "email@example.com" : "555-123-4567"}
                  data-testid="input-send-destination"
                />
              </div>
              {arrangement.caseToken && (
                <div className="flex items-center justify-between gap-2 bg-background/30 border border-white/5 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-0.5">Included in link</p>
                    <p className="text-xs font-mono">
                      <span className="text-muted-foreground">case_token=</span>
                      <span className="text-primary font-semibold">{arrangement.caseToken}</span>
                    </p>
                  </div>
                </div>
              )}
              {sendModal.fi.template?.jotformId?.startsWith("PLACEHOLDER") && (
                <div className="text-xs text-amber-300/80 bg-amber-950/20 border border-amber-800/20 rounded-lg px-3 py-2">
                  Form ID not yet configured. Link will be recorded but form is not active.
                </div>
              )}
              <DialogFooter>
                <Button
                  className="bg-primary text-primary-foreground"
                  disabled={!sendDestination.trim() || sendMutation.isPending}
                  onClick={() => sendMutation.mutate({ fi: sendModal.fi!, channel: sendChannel, destination: sendDestination.trim() })}
                  data-testid="button-confirm-send"
                >
                  {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Link
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={pandadocModal.open} onOpenChange={(open) => setPandadocModal({ open, fi: open ? pandadocModal.fi : null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Send for Signature</DialogTitle>
          </DialogHeader>
          {pandadocModal.fi && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure PandaDoc recipient for <span className="text-foreground font-medium">{pandadocModal.fi.template?.name}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {pandadocModal.fi.template?.pandadocTemplateId && (
                  <div className="text-xs font-mono text-muted-foreground bg-background/30 border border-white/5 rounded px-3 py-2">
                    <span className="text-muted-foreground/60 block mb-0.5">Template ID</span>
                    {pandadocModal.fi.template.pandadocTemplateId}
                  </div>
                )}
                {arrangement.caseToken && (
                  <button
                    className="text-xs font-mono text-left bg-background/30 border border-primary/20 rounded px-3 py-2 hover:bg-primary/5 transition-colors group"
                    onClick={() => {
                      navigator.clipboard.writeText(arrangement.caseToken!);
                      toast({ title: "Case token copied" });
                    }}
                    data-testid="button-copy-token-pandadoc"
                  >
                    <span className="text-muted-foreground/60 block mb-0.5">Merge Field: case_token</span>
                    <span className="text-primary font-semibold">{arrangement.caseToken}</span>
                    <Copy className="h-2.5 w-2.5 inline ml-1.5 text-muted-foreground group-hover:text-primary" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Authorizing Agent Name</Label>
                  <Input
                    value={pandadocRecipientName}
                    onChange={(e) => setPandadocRecipientName(e.target.value)}
                    placeholder="Full name of authorizing family member"
                    data-testid="input-recipient-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Email Address</Label>
                  <Input
                    type="email"
                    value={pandadocRecipientEmail}
                    onChange={(e) => setPandadocRecipientEmail(e.target.value)}
                    placeholder="email@example.com"
                    data-testid="input-recipient-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">PandaDoc Document ID <span className="text-muted-foreground">(optional — paste after sending)</span></Label>
                  <Input
                    value={pandadocDocId}
                    onChange={(e) => setPandadocDocId(e.target.value)}
                    placeholder="Document ID from PandaDoc"
                    data-testid="input-pandadoc-doc-id"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Send the document directly in PandaDoc using the template above. Return here to record the document ID and update status.
              </p>
              <DialogFooter>
                <Button
                  className="bg-primary text-primary-foreground"
                  disabled={!pandadocRecipientName.trim() || !pandadocRecipientEmail.trim() || pandadocSendMutation.isPending}
                  onClick={() => pandadocSendMutation.mutate({
                    fi: pandadocModal.fi!,
                    name: pandadocRecipientName.trim(),
                    email: pandadocRecipientEmail.trim(),
                    docId: pandadocDocId.trim(),
                  })}
                  data-testid="button-confirm-pandadoc"
                >
                  {pandadocSendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pen className="h-4 w-4 mr-2" />}
                  Save &amp; Record
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StaffLayout>
  );
}

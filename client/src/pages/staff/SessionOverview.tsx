import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRoute, useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import {
  ArrowLeft, FileText, Send, Tablet, Copy, Download, Printer,
  CheckCircle2, Clock, AlertTriangle, XCircle, Loader2, ShieldCheck, ChevronRight
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormTemplate {
  id: string;
  name: string;
  jotformId: string | null;
  pdfPath: string | null;
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
  createdAt: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  not_sent: { icon: Clock, color: "text-muted-foreground", label: "Not Sent" },
  sent: { icon: Send, color: "text-amber-400", label: "Sent" },
  completed: { icon: CheckCircle2, color: "text-green-400", label: "Completed" },
  error: { icon: XCircle, color: "text-red-400", label: "Error" },
};

export default function SessionOverview() {
  const [, params] = useRoute("/staff/sessions/:id");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const sessionId = params?.id || "";

  const [sendModal, setSendModal] = useState<{ open: boolean; formInstance: FormInstanceEnriched | null }>({ open: false, formInstance: null });
  const [sendChannel, setSendChannel] = useState<"email" | "sms">("email");
  const [sendDestination, setSendDestination] = useState("");
  const [directorOverride, setDirectorOverride] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/staff/login");
  }, [authLoading, isAuthenticated, setLocation]);

  const { data: arrangement, isLoading: arrLoading } = useQuery<Arrangement>({
    queryKey: [`/api/arrangements/${sessionId}`],
    enabled: isAuthenticated && !!sessionId,
  });

  const { data: formInstances = [], isLoading: formsLoading } = useQuery<FormInstanceEnriched[]>({
    queryKey: [`/api/arrangements/${sessionId}/forms`],
    enabled: isAuthenticated && !!sessionId,
  });

  const sendMutation = useMutation({
    mutationFn: async ({ fi, channel, destination }: { fi: FormInstanceEnriched; channel: string; destination: string }) => {
      await apiRequest("PATCH", `/api/form-instances/${fi.id}`, {
        status: "sent",
        sentVia: channel,
        sentTo: destination,
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
      setSendModal({ open: false, formInstance: null });
      setSendDestination("");
      toast({ title: "Form link sent", description: "The form link has been sent successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send form link.", variant: "destructive" });
    },
  });

  if (authLoading || arrLoading || formsLoading) {
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

  const allSentOrCompleted = formInstances.length > 0 && formInstances.every(fi => fi.status === "sent" || fi.status === "completed");
  const allCompleted = formInstances.length > 0 && formInstances.every(fi => fi.status === "completed");
  const canProceed = allSentOrCompleted || directorOverride;

  const handleCopyLink = (url: string) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast({ title: "Link copied", description: "Form link copied to clipboard." });
  };

  const handleDownload = async (templateId: string) => {
    try {
      const res = await fetch(`/api/form-templates/${templateId}/download`, { credentials: "include" });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "form.pdf";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast({ title: "Not Available", description: "PDF not available for this form.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to download form.", variant: "destructive" });
    }
  };

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/staff/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground" data-testid="text-session-title">{arrangement.familyName}</h1>
            <p className="text-muted-foreground text-sm">
              Session · {arrangement.scheduledTime || "Not scheduled"} · {arrangement.status}
            </p>
          </div>
        </div>

        <Card className="border-white/5 bg-card mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-lg" data-testid="text-forms-title">Required Forms</h2>
              {allCompleted && (
                <Badge className="bg-green-900 text-green-100 border-none ml-auto">All Complete</Badge>
              )}
            </div>

            {!canProceed && formInstances.length > 0 && (
              <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-800/30 rounded-lg p-3 mb-4" data-testid="banner-forms-required">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-200 font-medium">Forms must be sent before proceeding</p>
                  <p className="text-xs text-amber-200/70 mt-0.5">All required forms must be sent to the client before accessing the Package Builder.</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {formInstances.map((fi) => {
                const sc = statusConfig[fi.status] || statusConfig.not_sent;
                const StatusIcon = sc.icon;
                return (
                  <div
                    key={fi.id}
                    className="bg-background/30 rounded-lg p-4 border border-white/5"
                    data-testid={`form-instance-${fi.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${sc.color}`} />
                        <span className="font-medium text-sm" data-testid={`form-name-${fi.id}`}>{fi.template?.name || "Unknown Form"}</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${sc.color} border-current`} data-testid={`form-status-${fi.id}`}>
                        {sc.label}
                      </Badge>
                    </div>

                    {fi.sentAt && (
                      <p className="text-xs text-muted-foreground mb-2" data-testid={`form-sent-info-${fi.id}`}>
                        Sent via {fi.sentVia} to {fi.sentTo} · {new Date(fi.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-white/10 hover:bg-white/5"
                        onClick={() => {
                          setSendModal({ open: true, formInstance: fi });
                          setSendChannel(arrangement.email ? "email" : "sms");
                          setSendDestination(arrangement.email || arrangement.phone || "");
                        }}
                        data-testid={`button-send-${fi.id}`}
                      >
                        <Send className="h-3 w-3 mr-1.5" /> Send
                      </Button>
                      {fi.formUrl && (
                        <Link href={fi.formUrl.startsWith("/") ? fi.formUrl : "#"}>
                          <Button size="sm" variant="outline" className="text-xs border-white/10 hover:bg-white/5" data-testid={`button-tablet-${fi.id}`}>
                            <Tablet className="h-3 w-3 mr-1.5" /> Fill on Tablet
                          </Button>
                        </Link>
                      )}
                      {fi.formUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-white/10 hover:bg-white/5"
                          onClick={() => handleCopyLink(fi.formUrl!)}
                          data-testid={`button-copy-${fi.id}`}
                        >
                          <Copy className="h-3 w-3 mr-1.5" /> Copy Link
                        </Button>
                      )}
                      {fi.template?.pdfPath && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-white/10 hover:bg-white/5"
                          onClick={() => handleDownload(fi.templateId)}
                          data-testid={`button-download-${fi.id}`}
                        >
                          <Download className="h-3 w-3 mr-1.5" /> Download
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-white/10 hover:bg-white/5"
                        onClick={() => window.print()}
                        data-testid={`button-print-${fi.id}`}
                      >
                        <Printer className="h-3 w-3 mr-1.5" /> Print
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {user?.role === "director" && !allSentOrCompleted && (
              <div className="mt-4 flex items-center gap-3 p-3 border border-white/5 rounded-lg bg-background/20" data-testid="director-override-section">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Director Override</p>
                  <p className="text-xs text-muted-foreground">Skip form requirements to proceed</p>
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
            )}
          </CardContent>
        </Card>

        <Link href={canProceed ? `/staff/builder?arrangement=${sessionId}` : "#"}>
          <Button
            className={`w-full ${canProceed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
            disabled={!canProceed}
            data-testid="button-package-builder"
          >
            Package Builder
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      <Dialog open={sendModal.open} onOpenChange={(open) => setSendModal({ open, formInstance: open ? sendModal.formInstance : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Send Form Link</DialogTitle>
          </DialogHeader>
          {sendModal.formInstance && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send <span className="text-foreground font-medium">{sendModal.formInstance.template?.name}</span> to the {arrangement.familyName}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sendChannel === "email" ? "default" : "outline"}
                  className={sendChannel === "email" ? "bg-primary text-primary-foreground" : "border-white/10"}
                  onClick={() => {
                    setSendChannel("email");
                    setSendDestination(arrangement.email || "");
                  }}
                  data-testid="button-channel-email"
                >
                  Email
                </Button>
                <Button
                  size="sm"
                  variant={sendChannel === "sms" ? "default" : "outline"}
                  className={sendChannel === "sms" ? "bg-primary text-primary-foreground" : "border-white/10"}
                  onClick={() => {
                    setSendChannel("sms");
                    setSendDestination(arrangement.phone || "");
                  }}
                  data-testid="button-channel-sms"
                >
                  SMS
                </Button>
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
              <DialogFooter>
                <Button
                  className="bg-primary text-primary-foreground"
                  disabled={!sendDestination.trim() || sendMutation.isPending}
                  onClick={() => {
                    if (sendModal.formInstance) {
                      sendMutation.mutate({
                        fi: sendModal.formInstance,
                        channel: sendChannel,
                        destination: sendDestination.trim(),
                      });
                    }
                  }}
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
    </StaffLayout>
  );
}

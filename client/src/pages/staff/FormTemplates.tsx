import { useState } from "react";
import { useLocation } from "wouter";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2, FileText, ExternalLink, CheckCircle, AlertTriangle, Info, Copy, ChevronDown, ChevronUp,
} from "lucide-react";

interface FormTemplate {
  id: string;
  name: string;
  type: "jotform" | "pandadoc";
  category: string | null;
  jotformId: string | null;
  jotformUrl: string | null;
  pandadocTemplateId: string | null;
}

function isPlaceholder(val: string | null | undefined) {
  return !val || val.startsWith("PLACEHOLDER") || val.trim() === "";
}

function TemplateBadge({ tmpl }: { tmpl: FormTemplate }) {
  const configured =
    tmpl.type === "jotform"
      ? !isPlaceholder(tmpl.jotformId) || !isPlaceholder(tmpl.jotformUrl)
      : !isPlaceholder(tmpl.pandadocTemplateId);
  return configured ? (
    <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-700/30 text-[10px]">
      <CheckCircle className="h-2.5 w-2.5 mr-1" /> Configured
    </Badge>
  ) : (
    <Badge className="bg-amber-900/20 text-amber-400 border-amber-700/30 text-[10px]">
      <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Setup required
    </Badge>
  );
}

function JotformTemplateCard({ tmpl }: { tmpl: FormTemplate }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formId, setFormId] = useState(isPlaceholder(tmpl.jotformId) ? "" : (tmpl.jotformId ?? ""));
  const [formUrl, setFormUrl] = useState(tmpl.jotformUrl ?? "");

  const mutation = useMutation({
    mutationFn: (data: { jotformId?: string; jotformUrl?: string }) =>
      apiRequest("PATCH", `/api/admin/form-templates/${tmpl.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/form-templates"] });
      toast({ title: "Saved", description: `${tmpl.name} updated.` });
      setOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  const resolvedBase = formUrl.trim() || (formId.trim() && !isPlaceholder(formId) ? `https://jotform.com/${formId.trim()}` : null);
  const sampleUrl = `${resolvedBase ?? "https://jotform.com/YOUR_FORM_ID"}?case_token=NHXXXXXX&session_id=UUID&family_display_name=Family+Name&service_type=burial&assigned_staff=Staff+Name`;

  return (
    <Card className="bg-card border-white/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
            <CardTitle className="text-sm font-medium truncate">{tmpl.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <TemplateBadge tmpl={tmpl} />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={() => setOpen(!open)}
              data-testid={`button-toggle-${tmpl.id}`}
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!open && (
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {isPlaceholder(tmpl.jotformId) && isPlaceholder(tmpl.jotformUrl)
              ? "No form ID or URL configured"
              : (tmpl.jotformUrl || `jotform.com/${tmpl.jotformId}`)}
          </p>
        )}
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 pt-0">
          <div className="bg-blue-950/20 border border-blue-800/20 rounded-lg p-3 text-xs text-blue-300/80 space-y-1">
            <p className="font-semibold flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Setup instructions</p>
            <ol className="list-decimal ml-4 space-y-1 text-blue-300/70">
              <li>In Jotform, create a new form for this category.</li>
              <li>Add a <strong>Hidden Field</strong> named <code className="bg-white/5 px-1 rounded">case_token</code> and set its source to <strong>URL Parameter</strong> → parameter name <code className="bg-white/5 px-1 rounded">case_token</code>.</li>
              <li>Do the same for <code className="bg-white/5 px-1 rounded">session_id</code>, <code className="bg-white/5 px-1 rounded">family_display_name</code>, <code className="bg-white/5 px-1 rounded">service_type</code>, and <code className="bg-white/5 px-1 rounded">assigned_staff</code>.</li>
              <li>Copy the form ID or full URL and paste it below.</li>
              <li>Configure the Jotform webhook to POST to <code className="bg-white/5 px-1 rounded">/api/webhooks/jotform</code>.</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Jotform Form ID</Label>
            <Input
              value={formId}
              onChange={e => setFormId(e.target.value)}
              placeholder="e.g. 250471234567890"
              className="font-mono text-sm"
              data-testid={`input-jotform-id-${tmpl.id}`}
            />
            <p className="text-[11px] text-muted-foreground">Paste just the numeric ID from your Jotform URL.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Full Form URL <span className="text-muted-foreground/50">(overrides ID if set)</span></Label>
            <Input
              value={formUrl}
              onChange={e => setFormUrl(e.target.value)}
              placeholder="https://jotform.com/250471234567890"
              className="font-mono text-sm"
              data-testid={`input-jotform-url-${tmpl.id}`}
            />
          </div>

          <div className="bg-background/30 border border-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {resolvedBase ? "Sample link (what the family receives)" : "URL structure (add your Form ID above to fill this in)"}
              </p>
              <button
                className="text-muted-foreground hover:text-primary"
                onClick={() => { navigator.clipboard.writeText(sampleUrl); toast({ title: "Copied" }); }}
                data-testid={`button-copy-sample-${tmpl.id}`}
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs font-mono text-muted-foreground break-all">{sampleUrl}</p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({
                jotformId: formId.trim() || undefined,
                jotformUrl: formUrl.trim() || undefined,
              })}
              data-testid={`button-save-${tmpl.id}`}
            >
              {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
              Save
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {!isPlaceholder(tmpl.jotformId) && (
              <a
                href={`https://jotform.com/${tmpl.jotformId}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto"
              >
                <Button size="sm" variant="outline" className="border-white/10 text-xs">
                  <ExternalLink className="h-3 w-3 mr-1.5" /> Open in Jotform
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function PandaDocTemplateCard({ tmpl }: { tmpl: FormTemplate }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState(isPlaceholder(tmpl.pandadocTemplateId) ? "" : (tmpl.pandadocTemplateId ?? ""));

  const mutation = useMutation({
    mutationFn: (data: { pandadocTemplateId?: string }) =>
      apiRequest("PATCH", `/api/admin/form-templates/${tmpl.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/form-templates"] });
      toast({ title: "Saved", description: `${tmpl.name} updated.` });
      setOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to save.", variant: "destructive" }),
  });

  return (
    <Card className="bg-card border-white/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-violet-400 flex-shrink-0" />
            <CardTitle className="text-sm font-medium truncate">{tmpl.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <TemplateBadge tmpl={tmpl} />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={() => setOpen(!open)}
              data-testid={`button-toggle-${tmpl.id}`}
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!open && (
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {isPlaceholder(tmpl.pandadocTemplateId) ? "No template ID configured" : tmpl.pandadocTemplateId}
          </p>
        )}
      </CardHeader>

      {open && (
        <CardContent className="space-y-4 pt-0">
          <div className="bg-violet-950/20 border border-violet-800/20 rounded-lg p-3 text-xs text-violet-300/80 space-y-1">
            <p className="font-semibold flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Setup instructions</p>
            <ol className="list-decimal ml-4 space-y-1 text-violet-300/70">
              <li>In PandaDoc, open the template for <strong>{tmpl.name}</strong>.</li>
              <li>Copy the Template ID from the URL or template settings.</li>
              <li>Add a merge field named <code className="bg-white/5 px-1 rounded">case_token</code> to the document so it can be traced back to this system.</li>
              <li>Paste the Template ID below and save.</li>
              <li>Configure PandaDoc's webhook to POST to <code className="bg-white/5 px-1 rounded">/api/webhooks/pandadoc</code> on <strong>document.completed</strong>.</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">PandaDoc Template ID</Label>
            <Input
              value={templateId}
              onChange={e => setTemplateId(e.target.value)}
              placeholder="e.g. msFnEpzL3squWhW6P7Ldnd"
              className="font-mono text-sm"
              data-testid={`input-pandadoc-id-${tmpl.id}`}
            />
            <p className="text-[11px] text-muted-foreground">Found in PandaDoc → Templates → open template → URL or settings panel.</p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate({ pandadocTemplateId: templateId.trim() || undefined })}
              data-testid={`button-save-${tmpl.id}`}
            >
              {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
              Save
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function FormTemplates() {
  const { isDirector, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: templates = [], isLoading } = useQuery<FormTemplate[]>({
    queryKey: ["/api/admin/form-templates"],
    enabled: isDirector,
  });

  if (authLoading) {
    return (
      <StaffLayout>
        <div className="p-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </StaffLayout>
    );
  }

  if (!isAuthenticated || !isDirector) {
    setLocation("/staff/login");
    return null;
  }

  const jotformTemplates = templates.filter(t => t.type === "jotform");
  const pandadocTemplates = templates.filter(t => t.type === "pandadoc");
  const configured = templates.filter(t =>
    t.type === "jotform"
      ? !isPlaceholder(t.jotformId) || !isPlaceholder(t.jotformUrl)
      : !isPlaceholder(t.pandadocTemplateId)
  ).length;

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="font-serif text-2xl md:text-3xl text-foreground mb-1" data-testid="text-page-title">
            Form Templates
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure the Jotform and PandaDoc templates used across all client sessions.
            Set up each form once — it applies to every new session automatically.
          </p>
          {templates.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {configured} of {templates.length} templates configured
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">Intake Forms</h2>
                <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">Jotform</Badge>
              </div>
              <div className="space-y-3">
                {jotformTemplates.map(t => (
                  <JotformTemplateCard key={t.id} tmpl={t} />
                ))}
                {jotformTemplates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No Jotform templates found.</p>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">Authorization Documents</h2>
                <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">PandaDoc</Badge>
              </div>
              <div className="space-y-3">
                {pandadocTemplates.map(t => (
                  <PandaDocTemplateCard key={t.id} tmpl={t} />
                ))}
                {pandadocTemplates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No PandaDoc templates found.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}

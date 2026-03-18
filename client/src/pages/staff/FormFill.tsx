import { StaffLayout } from "@/components/layout/StaffLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { useRoute, Link } from "wouter";

export default function FormFill() {
  const [, params] = useRoute("/staff/sessions/:id/forms/:templateId/fill");
  const sessionId = params?.id || "";
  const templateId = params?.templateId || "";

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/staff/sessions/${sessionId}`}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" data-testid="button-back-form">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-foreground" data-testid="text-form-fill-title">Fill Form</h1>
            <p className="text-muted-foreground text-sm">On-tablet form entry</p>
          </div>
        </div>

        <Card className="border-white/5 bg-card">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-primary/40 mx-auto mb-4" />
            <h2 className="font-serif text-xl mb-2" data-testid="text-placeholder-title">Form Entry Placeholder</h2>
            <p className="text-muted-foreground text-sm mb-4">
              This page will display the embedded Jotform once a live Jotform ID is configured for this template.
            </p>
            <p className="text-xs text-muted-foreground">
              Session: {sessionId} · Template: {templateId}
            </p>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}

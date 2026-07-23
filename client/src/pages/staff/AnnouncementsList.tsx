import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ExternalLink, Copy, Check, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { MemorialStatusBadge } from "@/components/MemorialStatusBadge";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementData {
  id: string;
  slug: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfBirth?: string;
  dateOfPassing?: string;
  isPublished: boolean;
  memorialStatus: string;
  createdAt: string;
}

function AnnouncementCard({
  a,
  isDirector,
  copiedId,
  onCopy,
  onStatus,
  isPending,
}: {
  a: AnnouncementData;
  isDirector: boolean;
  copiedId: string | null;
  onCopy: (slug: string, id: string) => void;
  onStatus: (id: string, status: string) => void;
  isPending: boolean;
}) {
  return (
    <Card key={a.id} className="border-white/5 bg-card hover:border-primary/30 transition-colors" data-testid={`card-announcement-${a.id}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-serif text-xl mb-1" data-testid={`text-name-${a.id}`}>{a.deceasedFirstName} {a.deceasedLastName}</h3>
            <p className="text-xs text-muted-foreground">
              {a.dateOfPassing ? `Passed: ${a.dateOfPassing}` : 'No date set'}
            </p>
          </div>
          <MemorialStatusBadge status={a.memorialStatus || 'draft'} />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href={`/staff/announcements/${a.id}`}>
            <Button variant="outline" size="sm" className="border-white/10 text-xs" data-testid={`button-edit-${a.id}`}>Edit</Button>
          </Link>
          <a href={`/announcements/${a.slug}${a.memorialStatus === 'published' ? '' : '?preview'}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-white/10 text-xs" data-testid={`button-preview-${a.id}`}>
              <ExternalLink className="h-3 w-3 mr-1" />
              {a.memorialStatus === 'published' ? 'View' : 'Preview'}
            </Button>
          </a>
          <Button variant="outline" size="sm" className="border-white/10 text-xs" onClick={() => onCopy(a.slug, a.id)} data-testid={`button-copy-${a.id}`}>
            {copiedId === a.id ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copiedId === a.id ? 'Copied' : 'Copy Link'}
          </Button>
          {a.memorialStatus !== 'published' && a.memorialStatus !== 'archived' && (
            isDirector ? (
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/30 text-xs"
                onClick={() => onStatus(a.id, 'published')}
                disabled={isPending}
                data-testid={`button-publish-${a.id}`}
              >
                Publish
              </Button>
            ) : a.memorialStatus !== 'review' ? (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-800/50 text-amber-400 hover:bg-amber-950/30 text-xs"
                onClick={() => onStatus(a.id, 'review')}
                disabled={isPending}
                data-testid={`button-submit-review-${a.id}`}
              >
                Submit for Review
              </Button>
            ) : null
          )}
          {a.memorialStatus === 'published' && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-zinc-400 hover:bg-zinc-900 text-xs"
              onClick={() => onStatus(a.id, 'archived')}
              disabled={isPending}
              data-testid={`button-archive-${a.id}`}
            >
              Archive
            </Button>
          )}
          {a.memorialStatus === 'archived' && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-muted-foreground hover:bg-muted/20 text-xs"
              onClick={() => onStatus(a.id, 'draft')}
              disabled={isPending}
              data-testid={`button-restore-${a.id}`}
            >
              Restore to Draft
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnnouncementsList() {
  const { isAuthenticated, isLoading: authLoading, isDirector } = useAuth();
  const [, setLocation] = useLocation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPublished, setShowPublished] = useState(true);
  const { toast } = useToast();

  const { data: announcements = [], isLoading } = useQuery<AnnouncementData[]>({
    queryKey: ['/api/announcements'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation('/staff/login');
  }, [authLoading, isAuthenticated, setLocation]);

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest('PATCH', `/api/announcements/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    },
  });

  const handleCopy = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/announcements/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatus = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  const pending = announcements.filter(a => a.memorialStatus !== 'published' && a.memorialStatus !== 'archived');
  const completed = announcements.filter(a => a.memorialStatus === 'published' || a.memorialStatus === 'archived');

  if (!isAuthenticated && !authLoading) return null;

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground" data-testid="text-announcements-title">Announcements</h1>
            <p className="text-muted-foreground text-sm">Manage obituary announcements</p>
          </div>
          <Link href="/staff/announcements/new">
            <Button className="bg-primary text-primary-foreground" data-testid="button-new-announcement">
              <Plus className="h-4 w-4 mr-1" /> New Announcement
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-muted-foreground text-lg">No announcements yet.</p>
            <Link href="/staff/announcements/new">
              <Button className="bg-primary text-primary-foreground">Create First Announcement</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              {pending.length > 0 ? (
                <>
                  <div className="flex items-center gap-3">
                    <h2
                      className="text-[10px] font-medium tracking-[0.22em] uppercase"
                      style={{ color: "rgba(201,169,110,0.7)" }}
                      data-testid="text-section-pending"
                    >
                      In Progress
                    </h2>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] text-muted-foreground">{pending.length}</span>
                  </div>
                  <div className="space-y-3">
                    {pending.map(a => (
                      <AnnouncementCard
                        key={a.id}
                        a={a}
                        isDirector={isDirector}
                        copiedId={copiedId}
                        onCopy={handleCopy}
                        onStatus={handleStatus}
                        isPending={statusMutation.isPending}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 border border-white/5 rounded-md">
                  <p className="text-sm text-muted-foreground">No announcements in progress.</p>
                  <Link href="/staff/announcements/new">
                    <Button size="sm" className="bg-primary mt-3">Create New</Button>
                  </Link>
                </div>
              )}
            </div>

            {completed.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2
                    className="text-[10px] font-medium tracking-[0.22em] uppercase"
                    style={{ color: "rgba(201,169,110,0.7)" }}
                    data-testid="text-section-published"
                  >
                    Published Memorials
                  </h2>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] text-muted-foreground mr-1">{completed.length}</span>
                  <button
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPublished(v => !v)}
                    data-testid="button-toggle-published"
                  >
                    {showPublished ? (
                      <><ChevronUp className="h-3 w-3" /> Hide</>
                    ) : (
                      <><ChevronDown className="h-3 w-3" /> Show</>
                    )}
                  </button>
                </div>

                {showPublished && (
                  <div className="space-y-3">
                    {completed.map(a => (
                      <AnnouncementCard
                        key={a.id}
                        a={a}
                        isDirector={isDirector}
                        copiedId={copiedId}
                        onCopy={handleCopy}
                        onStatus={handleStatus}
                        isPending={statusMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}

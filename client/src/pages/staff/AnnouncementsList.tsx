import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface AnnouncementData {
  id: string;
  slug: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfBirth?: string;
  dateOfPassing?: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AnnouncementsList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: announcements = [], isLoading } = useQuery<AnnouncementData[]>({
    queryKey: ['/api/announcements'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation('/staff/login');
  }, [authLoading, isAuthenticated, setLocation]);

  const handleCopy = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/announcements/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
          <div className="space-y-4">
            {announcements.map((a) => (
              <Card key={a.id} className="border-white/5 bg-card hover:border-primary/30 transition-colors" data-testid={`card-announcement-${a.id}`}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-serif text-xl mb-1" data-testid={`text-name-${a.id}`}>{a.deceasedFirstName} {a.deceasedLastName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {a.dateOfPassing ? `Passed: ${a.dateOfPassing}` : 'No date set'}
                      </p>
                    </div>
                    <Badge variant={a.isPublished ? 'default' : 'outline'} className={a.isPublished ? 'bg-green-900 text-green-100 border-none' : 'text-muted-foreground border-white/10'}>
                      {a.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/staff/announcements/${a.id}`}>
                      <Button variant="outline" size="sm" className="border-white/10 text-xs" data-testid={`button-edit-${a.id}`}>Edit</Button>
                    </Link>
                    <Button variant="outline" size="sm" className="border-white/10 text-xs" onClick={() => handleCopy(a.slug, a.id)} data-testid={`button-copy-${a.id}`}>
                      {copiedId === a.id ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copiedId === a.id ? 'Copied' : 'Copy Link'}
                    </Button>
                    {a.isPublished && (
                      <a href={`/announcements/${a.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="border-white/10 text-xs" data-testid={`button-view-${a.id}`}>
                          <ExternalLink className="h-3 w-3 mr-1" /> View
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
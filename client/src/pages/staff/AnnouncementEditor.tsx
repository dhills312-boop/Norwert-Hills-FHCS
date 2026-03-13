import { StaffLayout } from "@/components/layout/StaffLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { ArrowLeft, Save, Eye, Copy, Check, Loader2, Trash2, Plus, ExternalLink } from "lucide-react";

interface ServiceDetails {
  viewingDate?: string;
  viewingTime?: string;
  funeralDate?: string;
  funeralTime?: string;
  location?: string;
  locationAddress?: string;
  interment?: string;
  intermentDetails?: string;
}

interface MediaGallery {
  photos?: string[];
  tributeVideoUrls?: string[];
  livestreamUrl?: string;
}

interface AnnouncementData {
  id: string;
  arrangementId?: string;
  slug: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfBirth?: string;
  dateOfPassing?: string;
  briefObituary?: string;
  fullObituary?: string;
  epitaph?: string;
  serviceDetails?: ServiceDetails;
  portraitImagePath?: string;
  memorialSongUrl?: string;
  mediaGallery?: MediaGallery;
  isPublished: boolean;
}

function slugify(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

export default function AnnouncementEditor() {
  const [, params] = useRoute('/staff/announcements/:id');
  const announcementId = params?.id;
  const isNew = announcementId === 'new';

  const [, paramsArr] = useRoute('/staff/sessions/:id/announcement');
  const arrangementId = paramsArr?.id;

  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [copiedAnn, setCopiedAnn] = useState(false);
  const [copiedObit, setCopiedObit] = useState(false);

  const [form, setForm] = useState({
    deceasedFirstName: '',
    deceasedLastName: '',
    slug: '',
    dateOfBirth: '',
    dateOfPassing: '',
    briefObituary: '',
    fullObituary: '',
    epitaph: '',
    portraitImagePath: '',
    memorialSongUrl: '',
    isPublished: false,
    arrangementId: arrangementId || '',
    serviceDetails: {
      viewingDate: '',
      viewingTime: '',
      funeralDate: '',
      funeralTime: '',
      location: '',
      locationAddress: '',
      interment: '',
      intermentDetails: '',
    } as ServiceDetails,
    mediaGallery: {
      photos: [] as string[],
      tributeVideoUrls: [] as string[],
      livestreamUrl: '',
    } as MediaGallery,
  });

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const { data: existingAnnouncement, isLoading: loadingExisting } = useQuery<AnnouncementData | null>({
    queryKey: ['/api/announcements/by-arrangement', arrangementId],
    queryFn: async () => {
      if (!arrangementId) return null;
      const res = await fetch(`/api/announcements/by-arrangement/${arrangementId}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!arrangementId && isAuthenticated,
  });

  const { data: editAnnouncement, isLoading: loadingEdit } = useQuery<AnnouncementData | null>({
    queryKey: ['/api/announcements', announcementId],
    queryFn: async () => {
      if (!announcementId || isNew) return null;
      const res = await fetch(`/api/announcements/${announcementId}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!announcementId && !isNew && isAuthenticated,
  });

  const dataToLoad = editAnnouncement || existingAnnouncement;

  useEffect(() => {
    if (dataToLoad) {
      setForm({
        deceasedFirstName: dataToLoad.deceasedFirstName || '',
        deceasedLastName: dataToLoad.deceasedLastName || '',
        slug: dataToLoad.slug || '',
        dateOfBirth: dataToLoad.dateOfBirth || '',
        dateOfPassing: dataToLoad.dateOfPassing || '',
        briefObituary: dataToLoad.briefObituary || '',
        fullObituary: dataToLoad.fullObituary || '',
        epitaph: dataToLoad.epitaph || '',
        portraitImagePath: dataToLoad.portraitImagePath || '',
        memorialSongUrl: dataToLoad.memorialSongUrl || '',
        isPublished: dataToLoad.isPublished || false,
        arrangementId: dataToLoad.arrangementId || arrangementId || '',
        serviceDetails: {
          viewingDate: dataToLoad.serviceDetails?.viewingDate || '',
          viewingTime: dataToLoad.serviceDetails?.viewingTime || '',
          funeralDate: dataToLoad.serviceDetails?.funeralDate || '',
          funeralTime: dataToLoad.serviceDetails?.funeralTime || '',
          location: dataToLoad.serviceDetails?.location || '',
          locationAddress: dataToLoad.serviceDetails?.locationAddress || '',
          interment: dataToLoad.serviceDetails?.interment || '',
          intermentDetails: dataToLoad.serviceDetails?.intermentDetails || '',
        },
        mediaGallery: {
          photos: dataToLoad.mediaGallery?.photos || [],
          tributeVideoUrls: dataToLoad.mediaGallery?.tributeVideoUrls || [],
          livestreamUrl: dataToLoad.mediaGallery?.livestreamUrl || '',
        },
      });
    }
  }, [dataToLoad, arrangementId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation('/staff/login');
  }, [authLoading, isAuthenticated, setLocation]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = {
        ...data,
        slug: data.slug || slugify(data.deceasedFirstName, data.deceasedLastName),
        arrangementId: data.arrangementId || null,
      };
      if (dataToLoad) {
        const res = await apiRequest('PATCH', `/api/announcements/${dataToLoad.id}`, payload);
        return res.json();
      } else {
        const res = await apiRequest('POST', '/api/announcements', payload);
        return res.json();
      }
    },
    onSuccess: (data: AnnouncementData) => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: 'Saved', description: 'Announcement has been saved.' });
      if (!dataToLoad) {
        setLocation(`/staff/announcements/${data.id}`);
      }
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message || 'Failed to save', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!dataToLoad) return;
      await apiRequest('DELETE', `/api/announcements/${dataToLoad.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: 'Deleted', description: 'Announcement has been deleted.' });
      setLocation('/staff/announcements');
    },
  });

  const handleAutoSlug = () => {
    if (form.deceasedFirstName && form.deceasedLastName) {
      setForm(f => ({ ...f, slug: slugify(f.deceasedFirstName, f.deceasedLastName) }));
    }
  };

  const handleSave = () => saveMutation.mutate(form);

  const handleCopy = (type: 'announcement' | 'obituary') => {
    const sl = form.slug || slugify(form.deceasedFirstName, form.deceasedLastName);
    const url = type === 'announcement'
      ? `${window.location.origin}/announcements/${sl}`
      : `${window.location.origin}/obituaries/${sl}`;
    navigator.clipboard.writeText(url);
    if (type === 'announcement') { setCopiedAnn(true); setTimeout(() => setCopiedAnn(false), 2000); }
    else { setCopiedObit(true); setTimeout(() => setCopiedObit(false), 2000); }
  };

  const isLoading = loadingExisting || loadingEdit;

  if (!isAuthenticated && !authLoading) return null;

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href={arrangementId ? `/staff/sessions/${arrangementId}` : '/staff/announcements'}>
            <Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-2xl text-foreground" data-testid="text-editor-title">
              {dataToLoad ? 'Edit Announcement' : 'New Announcement'}
            </h1>
            {dataToLoad && form.isPublished && (
              <span className="text-xs text-green-400">Published</span>
            )}
          </div>
          <div className="flex gap-2">
            {dataToLoad && (
              <Button variant="destructive" size="sm" onClick={() => { if (confirm('Delete this announcement?')) deleteMutation.mutate(); }} data-testid="button-delete-announcement">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-primary" data-testid="button-save-announcement">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-6">
            <Card className="border-white/5 bg-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-lg text-foreground mb-2">Deceased Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={form.deceasedFirstName} onChange={e => setForm(f => ({ ...f, deceasedFirstName: e.target.value }))} onBlur={handleAutoSlug} data-testid="input-first-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={form.deceasedLastName} onChange={e => setForm(f => ({ ...f, deceasedLastName: e.target.value }))} onBlur={handleAutoSlug} data-testid="input-last-name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} placeholder="January 1, 1950" data-testid="input-dob" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Passing</Label>
                    <Input value={form.dateOfPassing} onChange={e => setForm(f => ({ ...f, dateOfPassing: e.target.value }))} placeholder="March 10, 2026" data-testid="input-dop" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Epitaph / Subtitle</Label>
                  <Input value={form.epitaph} onChange={e => setForm(f => ({ ...f, epitaph: e.target.value }))} placeholder="Beloved Father · Grandfather · Friend" data-testid="input-epitaph" />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <div className="flex gap-2">
                    <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="john-doe" data-testid="input-slug" />
                    <Button variant="outline" size="sm" onClick={handleAutoSlug} className="border-white/10">Auto</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">/announcements/{form.slug || '...'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-lg text-foreground mb-2">Portrait & Media</h2>
                <div className="space-y-2">
                  <Label>Portrait Image URL</Label>
                  <Input value={form.portraitImagePath} onChange={e => setForm(f => ({ ...f, portraitImagePath: e.target.value }))} placeholder="/assets/announcements/charles-braud/portrait.png" data-testid="input-portrait" />
                </div>
                <div className="space-y-2">
                  <Label>Memorial Song URL (SoundCloud or YouTube)</Label>
                  <Input value={form.memorialSongUrl} onChange={e => setForm(f => ({ ...f, memorialSongUrl: e.target.value }))} placeholder="https://soundcloud.com/..." data-testid="input-song-url" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-lg text-foreground mb-2">Service Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Viewing Date</Label>
                    <Input value={form.serviceDetails.viewingDate || ''} onChange={e => setForm(f => ({ ...f, serviceDetails: { ...f.serviceDetails, viewingDate: e.target.value } }))} placeholder="March 13, 2026" data-testid="input-viewing-date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Viewing Time</Label>
                    <Input value={form.serviceDetails.viewingTime || ''} onChange={e => setForm(f => ({ ...f, serviceDetails: { ...f.serviceDetails, viewingTime: e.target.value } }))} placeholder="9:00 AM – 10:00 AM" data-testid="input-viewing-time" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Funeral Date</Label>
                    <Input value={form.serviceDetails.funeralDate || ''} onChange={e => setForm(f => ({ ...f, serviceDetails: { ...f.serviceDetails, funeralDate: e.target.value } }))} placeholder="March 13, 2026" data-testid="input-funeral-date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Funeral Time</Label>
                    <Input value={form.serviceDetails.funeralTime || ''} onChange={e => setForm(f => ({ ...f, serviceDetails: { ...f.serviceDetails, funeralTime: e.target.value } }))} placeholder="10:00 AM" data-testid="input-funeral-time" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input value={form.serviceDetails.location || ''} onChange={e => setForm(f => ({ ...f, serviceDetails: { ...f.serviceDetails, location: e.target.value } }))} placeholder="Providence Baptist Church" data-testid="input-location" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location Address</Label>
                    <Input value={form.serviceDetails.locationAddress || ''} onChange={e => setForm(f => ({ ...f, serviceDetails: { ...f.serviceDetails, locationAddress: e.target.value } }))} placeholder="240 Pine St., Laplace, LA 70068" data-testid="input-location-address" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Interment</Label>
                    <Input value={form.serviceDetails.interment || ''} onChange={e => setForm(f => ({ ...f, serviceDetails: { ...f.serviceDetails, interment: e.target.value } }))} placeholder="To Follow" data-testid="input-interment" />
                  </div>
                  <div className="space-y-2">
                    <Label>Interment Details</Label>
                    <Input value={form.serviceDetails.intermentDetails || ''} onChange={e => setForm(f => ({ ...f, serviceDetails: { ...f.serviceDetails, intermentDetails: e.target.value } }))} placeholder="Immediately following service" data-testid="input-interment-details" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-lg text-foreground mb-2">Obituary Text</h2>
                <div className="space-y-2">
                  <Label>Brief Obituary (shown on announcement page)</Label>
                  <textarea
                    value={form.briefObituary}
                    onChange={e => setForm(f => ({ ...f, briefObituary: e.target.value }))}
                    rows={5}
                    className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="A brief obituary for the announcement page..."
                    data-testid="textarea-brief-obituary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full Obituary (shown on obituary page)</Label>
                  <textarea
                    value={form.fullObituary}
                    onChange={e => setForm(f => ({ ...f, fullObituary: e.target.value }))}
                    rows={10}
                    className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="The full obituary text for the dedicated obituary page..."
                    data-testid="textarea-full-obituary"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-lg text-foreground mb-2">Media Gallery</h2>
                <div className="space-y-3">
                  <Label>Photos</Label>
                  {(form.mediaGallery.photos || []).map((photo, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input value={photo} onChange={e => {
                        const photos = [...(form.mediaGallery.photos || [])];
                        photos[i] = e.target.value;
                        setForm(f => ({ ...f, mediaGallery: { ...f.mediaGallery, photos } }));
                      }} className="flex-1" data-testid={`input-photo-${i}`} />
                      <Button variant="ghost" size="icon" onClick={() => {
                        const photos = (form.mediaGallery.photos || []).filter((_, j) => j !== i);
                        setForm(f => ({ ...f, mediaGallery: { ...f.mediaGallery, photos } }));
                      }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input value={newPhotoUrl} onChange={e => setNewPhotoUrl(e.target.value)} placeholder="Photo URL..." className="flex-1" data-testid="input-new-photo" />
                    <Button variant="outline" size="sm" onClick={() => {
                      if (newPhotoUrl.trim()) {
                        setForm(f => ({ ...f, mediaGallery: { ...f.mediaGallery, photos: [...(f.mediaGallery.photos || []), newPhotoUrl.trim()] } }));
                        setNewPhotoUrl('');
                      }
                    }} className="border-white/10" data-testid="button-add-photo"><Plus className="h-4 w-4 mr-1" /> Add</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Tribute Video URLs</Label>
                  {(form.mediaGallery.tributeVideoUrls || []).map((vid, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input value={vid} onChange={e => {
                        const tributeVideoUrls = [...(form.mediaGallery.tributeVideoUrls || [])];
                        tributeVideoUrls[i] = e.target.value;
                        setForm(f => ({ ...f, mediaGallery: { ...f.mediaGallery, tributeVideoUrls } }));
                      }} className="flex-1" data-testid={`input-video-${i}`} />
                      <Button variant="ghost" size="icon" onClick={() => {
                        const tributeVideoUrls = (form.mediaGallery.tributeVideoUrls || []).filter((_, j) => j !== i);
                        setForm(f => ({ ...f, mediaGallery: { ...f.mediaGallery, tributeVideoUrls } }));
                      }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="YouTube URL..." className="flex-1" data-testid="input-new-video" />
                    <Button variant="outline" size="sm" onClick={() => {
                      if (newVideoUrl.trim()) {
                        setForm(f => ({ ...f, mediaGallery: { ...f.mediaGallery, tributeVideoUrls: [...(f.mediaGallery.tributeVideoUrls || []), newVideoUrl.trim()] } }));
                        setNewVideoUrl('');
                      }
                    }} className="border-white/10" data-testid="button-add-video"><Plus className="h-4 w-4 mr-1" /> Add</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Livestream URL</Label>
                  <Input value={form.mediaGallery.livestreamUrl || ''} onChange={e => setForm(f => ({ ...f, mediaGallery: { ...f.mediaGallery, livestreamUrl: e.target.value } }))} placeholder="YouTube livestream URL..." data-testid="input-livestream" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-card">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-lg text-foreground mb-2">Publishing & Links</h2>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                      className="rounded border-white/20 bg-background"
                      data-testid="checkbox-publish"
                    />
                    <span className="text-sm text-foreground">Published (visible to public)</span>
                  </label>
                </div>

                {form.slug && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex-1">Announcement: /announcements/{form.slug}</span>
                      <Button variant="outline" size="sm" className="border-white/10" onClick={() => handleCopy('announcement')} data-testid="button-copy-announcement-url">
                        {copiedAnn ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copiedAnn ? 'Copied' : 'Copy'}
                      </Button>
                      <Link href={`/announcements/${form.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="border-white/10" data-testid="button-preview-announcement">
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex-1">Obituary: /obituaries/{form.slug}</span>
                      <Button variant="outline" size="sm" className="border-white/10" onClick={() => handleCopy('obituary')} data-testid="button-copy-obituary-url">
                        {copiedObit ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copiedObit ? 'Copied' : 'Copy'}
                      </Button>
                      <Link href={`/obituaries/${form.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="border-white/10" data-testid="button-preview-obituary">
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pb-8">
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-primary" data-testid="button-save-bottom">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save Announcement
              </Button>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
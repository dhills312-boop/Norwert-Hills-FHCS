import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';

const logoImage = '/assets/announcements/charles-braud/logo.png';

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

interface AnnouncementData {
  id: string;
  slug: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfBirth?: string;
  dateOfPassing?: string;
  fullObituary?: string;
  epitaph?: string;
  portraitImagePath?: string;
  serviceDetails?: ServiceDetails;
  isPublished: boolean;
}

interface CondolenceMessage {
  id: string;
  visitorName: string;
  message: string;
  createdAt: string;
}

export default function ObituaryPage() {
  const [, params] = useRoute('/obituaries/:slug');
  const slug = params?.slug || '';
  const isPreview = new URLSearchParams(window.location.search).has('preview');
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [condolences, setCondolences] = useState<CondolenceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const obituaryEndpoint = isPreview
      ? `/api/staff/announcements/preview/${slug}`
      : `/api/public/obituaries/${slug}`;
    Promise.all([
      fetch(obituaryEndpoint, { credentials: 'include' }).then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); }),
      fetch(`/api/public/announcements/${slug}/condolences`).then(r => r.ok ? r.json() : []),
    ])
      .then(([data, msgs]) => { setAnnouncement(data); setCondolences(msgs); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug, isPreview]);

  const handleSubmitCondolence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/announcements/${slug}/condolences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorName: visitorName.trim(), message: message.trim() }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setCondolences(prev => [newMsg, ...prev]);
        setVisitorName('');
        setMessage('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#09070c' }}>
        <div style={{ color: '#c9a96e', fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '0.3em' }}>LOADING...</div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#09070c' }}>
        <div className="text-center">
          <div style={{ color: '#c9a96e', fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '0.3em', marginBottom: '16px' }}>OBITUARY NOT FOUND</div>
          <Link href="/"><span style={{ color: 'rgba(245,240,232,0.4)', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', cursor: 'pointer' }}>Return Home</span></Link>
        </div>
      </div>
    );
  }

  const portraitSrc = announcement.portraitImagePath || '/assets/announcements/charles-braud/portrait.png';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#09070c' }}>
      <div className="relative mx-auto" style={{ maxWidth: '780px' }}>
        <div className="pt-12 pb-8 text-center px-6">
          <div className="w-[60px] h-[60px] mx-auto flex items-center justify-center mb-4">
            <img src={logoImage} alt="Norwert Hills" className="w-12 h-12 object-contain" style={{ filter: 'brightness(1.2) contrast(1.1)' }} />
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '8.5px', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '32px' }}>NORWERT HILLS</div>

          <div className="w-[160px] h-[160px] rounded-full overflow-hidden mx-auto mb-6" style={{ border: '2px solid rgba(201,169,110,0.25)', boxShadow: '0 0 40px rgba(201,169,110,0.2)' }}>
            <img src={portraitSrc} alt={`${announcement.deceasedFirstName} ${announcement.deceasedLastName}`} className="w-full h-full object-cover" data-testid="img-obituary-portrait" />
          </div>

          {(announcement.dateOfBirth || announcement.dateOfPassing) && (
            <div className="mb-3" style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>
              {announcement.dateOfBirth} {announcement.dateOfBirth && announcement.dateOfPassing && '·'} {announcement.dateOfPassing}
            </div>
          )}

          <h1 className="mb-2" data-testid="text-obituary-name">
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontStyle: 'italic', fontSize: '42px', letterSpacing: '0.06em', color: '#e8cfa0' }}>{announcement.deceasedFirstName}</span>{' '}
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, fontSize: '42px', letterSpacing: '0.06em', color: '#f5f0e8' }}>{announcement.deceasedLastName}</span>
          </h1>

          {announcement.epitaph && (
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontStyle: 'italic', color: 'rgba(245,240,232,0.45)' }}>{announcement.epitaph}</div>
          )}
        </div>

        <div className="px-6 sm:px-12">
          <div className="flex items-center justify-center my-8">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 100%)' }} />
            <div className="mx-4 w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent 0%, rgba(201,169,110,0.18) 100%)' }} />
          </div>

          {announcement.fullObituary && (
            <div className="mb-12" data-testid="section-full-obituary">
              <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>OBITUARY</h2>
              <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '17px', color: 'rgba(245,240,232,0.58)', lineHeight: '1.9', textAlign: 'justify' }}>
                {announcement.fullObituary.split('\n').map((p, i) => {
                  if (i === 0 && p.length > 0) {
                    return (
                      <p key={i}>
                        <span className="float-left mr-2 leading-none" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '3.4rem', color: '#c9a96e', lineHeight: '0.8' }}>{p[0]}</span>
                        {p.slice(1)}
                      </p>
                    );
                  }
                  return <p key={i} className={i > 0 ? 'mt-4' : ''}>{p}</p>;
                })}
              </div>
            </div>
          )}

          <div className="mb-12 flex justify-center">
            <Link href={`/announcements/${announcement.slug}`}>
              <span className="flex items-center gap-2 px-6 py-3 transition-all hover:bg-opacity-70 cursor-pointer" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)', textTransform: 'uppercase' }} data-testid="link-announcement">
                VIEW SERVICE DETAILS & ANNOUNCEMENT
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-center my-8">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 100%)' }} />
            <div className="mx-4 w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent 0%, rgba(201,169,110,0.18) 100%)' }} />
          </div>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-2 px-6 py-3 transition-all hover:bg-opacity-70" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)', textTransform: 'uppercase' }} data-testid="button-send-flowers">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 0 0 4.6 9c0 5.4 7.4 12 7.4 12s7.4-6.6 7.4-12A3.6 3.6 0 0 0 15 4.7C14.4 3.6 13.2 3 12 3z"></path></svg>
              SEND FLOWERS
            </a>
            <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-2 px-6 py-3 transition-all hover:bg-opacity-70" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)', textTransform: 'uppercase' }} data-testid="button-sympathy-gifts">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path></svg>
              SYMPATHY GIFTS
            </a>
          </div>

          <div className="flex items-center justify-center my-8">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 100%)' }} />
            <div className="mx-4 w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent 0%, rgba(201,169,110,0.18) 100%)' }} />
          </div>

          <div className="mb-12" data-testid="section-guestbook">
            <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>GUESTBOOK</h2>

            <form onSubmit={handleSubmitCondolence} className="mb-8 p-6 rounded" style={{ backgroundColor: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)' }}>
              <div className="mb-4">
                <label style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.2em', color: '#c9a96e', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>YOUR NAME</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={e => setVisitorName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded"
                  style={{ backgroundColor: 'rgba(9,7,12,0.8)', border: '1px solid rgba(201,169,110,0.18)', color: '#f5f0e8', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', outline: 'none' }}
                  data-testid="input-condolence-name"
                />
              </div>
              <div className="mb-4">
                <label style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.2em', color: '#c9a96e', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>YOUR MESSAGE</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded resize-none"
                  style={{ backgroundColor: 'rgba(9,7,12,0.8)', border: '1px solid rgba(201,169,110,0.18)', color: '#f5f0e8', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', outline: 'none' }}
                  data-testid="input-condolence-message"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 transition-all hover:bg-opacity-70"
                  style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: 'rgba(201,169,110,0.2)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)', textTransform: 'uppercase', opacity: submitting ? 0.5 : 1 }}
                  data-testid="button-submit-condolence"
                >
                  {submitting ? 'SENDING...' : submitted ? 'SENT!' : 'LEAVE A MESSAGE'}
                </button>
              </div>
            </form>

            {condolences.length > 0 && (
              <div className="space-y-4">
                {condolences.map(c => (
                  <div key={c.id} className="p-5 rounded" style={{ backgroundColor: 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.1)' }} data-testid={`condolence-${c.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '0.15em', color: '#c9a96e' }}>{c.visitorName}</span>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '13px', fontStyle: 'italic', color: 'rgba(245,240,232,0.25)' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: 'rgba(245,240,232,0.5)', lineHeight: '1.7' }}>{c.message}</p>
                  </div>
                ))}
              </div>
            )}

            {condolences.length === 0 && (
              <p className="text-center py-8" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontStyle: 'italic', color: 'rgba(245,240,232,0.25)' }}>Be the first to leave a message of condolence.</p>
            )}
          </div>

          <div className="text-center pb-[60px] pt-8" style={{ borderTop: '1px solid rgba(201,169,110,0.18)' }}>
            <div className="w-[44px] h-[44px] rounded-full mx-auto flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(9,7,12,0.55)', border: '1px solid #c9a96e' }}>
              <img src={logoImage} alt="Norwert Hills" className="w-8 h-8 object-contain" />
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', color: 'rgba(201,169,110,0.2)', textTransform: 'uppercase' }}>
              NORWERT HILLS FUNERAL & CREMATION SERVICES<br />1601 W. Thomas St., Hammond, LA 70401
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
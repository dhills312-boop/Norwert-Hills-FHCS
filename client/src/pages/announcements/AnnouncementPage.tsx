import { Facebook, Instagram, Twitter, Copy, Check } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRoute, Link } from 'wouter';

const logoImage = '/assets/announcements/charles-braud/logo.png';
const backgroundImage = '/assets/announcements/charles-braud/background.png';

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

function StarField() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: '#c9a96e',
            opacity: 0.3,
            animation: `announcement-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite alternate, announcement-float ${star.duration * 2}s ease-in-out ${star.delay}s infinite alternate`,
            boxShadow: '0 0 4px rgba(201,169,110,0.5)'
          }}
        />
      ))}
    </div>
  );
}

function YouTubeAudioPlayer({ videoId }: { videoId: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const containerRef = useRef<string>(`yt-player-${videoId}-${Math.random().toString(36).slice(2)}`);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      document.head.appendChild(tag);
    }

    const initPlayer = () => {
      if (!(window as any).YT?.Player) {
        setTimeout(initPlayer, 200);
        return;
      }
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        height: '0',
        width: '0',
        videoId,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0 },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration());
          },
          onStateChange: (e: any) => {
            if (e.data === 1) {
              setPlaying(true);
              intervalRef.current = setInterval(() => {
                const t = e.target.getCurrentTime();
                const d = e.target.getDuration();
                setCurrentTime(t);
                setProgress(d > 0 ? (t / d) * 100 : 0);
              }, 250);
            } else {
              setPlaying(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          },
        },
      });
    };

    if ((window as any).YT?.Player) initPlayer();
    else {
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [playing]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    playerRef.current.seekTo(pct * duration, true);
    setProgress(pct * 100);
    setCurrentTime(pct * duration);
  }, [duration]);

  return (
    <div className="rounded" style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.18)', padding: '16px 20px' }} data-testid="embed-youtube-audio">
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div id={containerRef.current} />
      </div>
      <div className="flex items-center gap-4">
        <button onClick={togglePlay} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)' }} data-testid="button-yt-play">
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a96e"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9a96e"><path d="M8 5v14l11-7L8 5z"/></svg>
          )}
        </button>
        <div className="flex-1 space-y-1">
          <div className="cursor-pointer h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(201,169,110,0.12)' }} onClick={handleSeek} data-testid="progress-bar">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: '#c9a96e' }} />
          </div>
          <div className="flex justify-between">
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(201,169,110,0.6)' }}>{formatTime(currentTime)}</span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(201,169,110,0.6)' }}>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.5)" strokeWidth="1.5"><path d="M9 18V5l12 7-12 7z"/></svg>
        </div>
      </div>
    </div>
  );
}

function renderSongEmbed(url: string) {
  if (url.includes('soundcloud.com')) {
    const encodedUrl = encodeURIComponent(url);
    return (
      <iframe
        width="100%"
        height="166"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodedUrl}&color=%231c2334&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
        data-testid="embed-soundcloud"
      />
    );
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else {
      const match = url.match(/[?&]v=([^&]+)/);
      videoId = match?.[1] || '';
    }
    if (videoId) {
      return (
        <YouTubeAudioPlayer videoId={videoId} />
      );
    }
  }
  return null;
}

export default function AnnouncementPage() {
  const [, params] = useRoute('/announcements/:slug');
  const slug = params?.slug || '';
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/announcements/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => { setAnnouncement(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [slug]);

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
          <div style={{ color: '#c9a96e', fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '0.3em', marginBottom: '16px' }}>ANNOUNCEMENT NOT FOUND</div>
          <Link href="/">
            <span style={{ color: 'rgba(245,240,232,0.4)', fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', cursor: 'pointer' }}>Return Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const sd = announcement.serviceDetails || {};
  const portraitSrc = announcement.portraitImagePath || '/assets/announcements/charles-braud/portrait.png';

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`In Loving Memory of ${announcement.deceasedFirstName} ${announcement.deceasedLastName}`);
    if (platform === 'Facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    else if (platform === 'Twitter') window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
    else if (platform === 'Instagram') {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied! Open Instagram and paste it in your story or post.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGetDirections = () => {
    const address = sd.locationAddress || '';
    if (!address) return;
    const encodedAddress = encodeURIComponent(address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) window.open(`maps://maps.google.com/maps?daddr=${encodedAddress}&ll=`);
    else window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
  };

  const handleAddToCalendar = () => {
    const event = {
      title: `Funeral Service - ${announcement.deceasedFirstName} ${announcement.deceasedLastName}`,
      description: `Funeral service at ${sd.location || 'TBD'}`,
      location: sd.locationAddress || sd.location || '',
      startDate: sd.funeralDate || '',
      endDate: sd.funeralDate || '',
    };
    const icsContent = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART:${(event.startDate || '').replace(/[-:]/g, '')}`,
      `DTEND:${(event.endDate || '').replace(/[-:]/g, '')}`,
      `SUMMARY:${event.title}`, `DESCRIPTION:${event.description}`, `LOCATION:${event.location}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\n');
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const urlObj = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlObj;
    link.download = 'funeral-service.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlObj);
  };

  const gallery = announcement.mediaGallery || {};

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#09070c' }}>
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.15, transform: 'scale(1.1)', animation: 'announcement-slow-zoom 60s ease-in-out infinite alternate', zIndex: 0 }} />
      <StarField />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(9,7,12,0.7) 70%, #09070c 100%)', zIndex: 2 }} />

      <div className="relative mx-auto" style={{ maxWidth: '780px', zIndex: 3 }}>
        <div className="relative h-[680px] overflow-hidden">
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
            <div className="w-[80px] h-[80px] mx-auto flex items-center justify-center mb-2" style={{ backgroundColor: 'transparent' }}>
              <img src={logoImage} alt="Norwert Hills" className="w-16 h-16 object-contain" style={{ filter: 'brightness(1.2) contrast(1.1)' }} />
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '8.5px', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>NORWERT HILLS</div>
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
            <div className="relative">
              <div className="absolute" style={{ width: '450px', height: '450px', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', background: 'radial-gradient(ellipse 65% 55% at 50% 35%, rgba(201,169,110,0.7) 0%, rgba(201,169,110,0.35) 25%, rgba(201,169,110,0.12) 50%, transparent 80%)', animation: 'announcement-halo-pulse 4s ease-in-out infinite alternate', filter: 'blur(25px)', zIndex: 0 }} />
              <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden" style={{ border: '2px solid rgba(201,169,110,0.25)', boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.4)', zIndex: 1 }}>
                <img src={portraitSrc} alt={`${announcement.deceasedFirstName} ${announcement.deceasedLastName}`} className="w-full h-full object-cover" data-testid="img-portrait" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-16 left-0 right-0 text-center px-12">
            {(announcement.dateOfBirth || announcement.dateOfPassing) && (
              <div className="mb-4" style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>
                {announcement.dateOfBirth} {announcement.dateOfBirth && announcement.dateOfPassing && '·'} {announcement.dateOfPassing}
              </div>
            )}
            <h1 className="mb-2 whitespace-nowrap" data-testid="text-deceased-name">
              <span className="text-[40px] sm:text-[60px]" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.06em', color: '#e8cfa0' }}>{announcement.deceasedFirstName}</span>{' '}
              <span className="text-[40px] sm:text-[60px]" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, letterSpacing: '0.06em', color: '#f5f0e8' }}>{announcement.deceasedLastName}</span>
            </h1>
            {announcement.epitaph && (
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontStyle: 'italic', color: 'rgba(245,240,232,0.45)' }}>{announcement.epitaph}</div>
            )}
          </div>
        </div>

        <div className="relative px-6 sm:px-12" style={{ background: 'radial-gradient(ellipse at 20% 100%, rgba(90,50,8,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(40,20,55,0.15) 0%, transparent 50%), #09070c' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(65deg, transparent 0%, rgba(201,169,110,0.07) 50%, transparent 100%), linear-gradient(115deg, transparent 0%, rgba(201,169,110,0.07) 50%, transparent 100%)', mixBlendMode: 'overlay' }} />

          <div className="relative flex items-center justify-center my-[52px]">
            <div className="absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)' }} />
            <div className="relative w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
          </div>

          {(sd.viewingDate || sd.funeralDate || sd.location || sd.interment) && (
            <div className="mb-[52px]" data-testid="section-service-info">
              <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>SERVICE INFORMATION</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ backgroundColor: 'rgba(201,169,110,0.18)' }}>
                {sd.viewingDate && (
                  <div className="p-7 text-center" style={{ backgroundColor: 'rgba(9,7,12,0.85)' }}>
                    <div className="mb-2" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>VIEWING</div>
                    <div className="mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '19px', fontWeight: 300, color: '#f5f0e8' }}>{sd.viewingDate}</div>
                    {sd.viewingTime && <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', fontStyle: 'italic', color: 'rgba(245,240,232,0.4)' }}>{sd.viewingTime}</div>}
                  </div>
                )}
                {sd.funeralDate && (
                  <div className="p-7 text-center" style={{ backgroundColor: 'rgba(9,7,12,0.85)' }}>
                    <div className="mb-2" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>FUNERAL SERVICE</div>
                    <div className="mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '19px', fontWeight: 300, color: '#f5f0e8' }}>{sd.funeralDate}</div>
                    {sd.funeralTime && <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', fontStyle: 'italic', color: 'rgba(245,240,232,0.4)' }}>{sd.funeralTime}</div>}
                  </div>
                )}
                {sd.location && (
                  <div className="p-7 text-center" style={{ backgroundColor: 'rgba(9,7,12,0.85)' }}>
                    <div className="mb-2" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>LOCATION</div>
                    <div className="mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '19px', fontWeight: 300, color: '#f5f0e8' }}>{sd.location}</div>
                    {sd.locationAddress && <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', fontStyle: 'italic', color: 'rgba(245,240,232,0.4)' }}>{sd.locationAddress}</div>}
                  </div>
                )}
                {sd.interment && (
                  <div className="p-7 text-center" style={{ backgroundColor: 'rgba(9,7,12,0.85)' }}>
                    <div className="mb-2" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>INTERMENT</div>
                    <div className="mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '19px', fontWeight: 300, color: '#f5f0e8' }}>{sd.interment}</div>
                    {sd.intermentDetails && <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', fontStyle: 'italic', color: 'rgba(245,240,232,0.4)' }}>{sd.intermentDetails}</div>}
                  </div>
                )}
              </div>
            </div>
          )}

          {sd.locationAddress && (
            <div className="mb-[52px] flex justify-center">
              <button onClick={handleGetDirections} className="flex items-center gap-2 px-6 py-3 transition-all hover:bg-opacity-70" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)', textTransform: 'uppercase' }} data-testid="button-get-directions">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                GET DIRECTIONS
              </button>
            </div>
          )}

          {sd.funeralDate && (
            <div className="mb-[52px] flex justify-center">
              <button onClick={handleAddToCalendar} className="flex items-center gap-2 px-6 py-3 transition-all hover:bg-opacity-70" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)', textTransform: 'uppercase' }} data-testid="button-add-calendar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ADD TO CALENDAR
              </button>
            </div>
          )}

          {announcement.memorialSongUrl && (
            <>
              <div className="relative flex items-center justify-center my-[52px]">
                <div className="absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)' }} />
                <div className="relative w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
              </div>
              <div className="mb-[52px]" data-testid="section-music">
                <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>MUSICAL SELECTION</h2>
                {renderSongEmbed(announcement.memorialSongUrl)}
              </div>
            </>
          )}

          {announcement.briefObituary && (
            <>
              <div className="relative flex items-center justify-center my-[52px]">
                <div className="absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)' }} />
                <div className="relative w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
              </div>
              <div className="mb-[52px]" data-testid="section-obituary">
                <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>OBITUARY</h2>
                <div style={{ fontFamily: 'EB Garamond, serif', fontSize: '17px', color: 'rgba(245,240,232,0.58)', lineHeight: '1.9', textAlign: 'justify' }}>
                  {announcement.briefObituary.split('\n').map((p, i) => <p key={i} className={i > 0 ? 'mt-4' : ''}>{p}</p>)}
                </div>
              </div>
            </>
          )}

          {announcement.fullObituary && (
            <div className="mb-[52px] flex justify-center">
              <Link href={`/obituaries/${announcement.slug}`}>
                <span className="flex items-center gap-2 px-6 py-3 transition-all hover:bg-opacity-70 cursor-pointer" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: 'rgba(201,169,110,0.15)', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)', textTransform: 'uppercase' }} data-testid="link-full-obituary">
                  VIEW FULL OBITUARY & GUESTBOOK
                </span>
              </Link>
            </div>
          )}

          {gallery.photos && gallery.photos.length > 0 && (
            <>
              <div className="relative flex items-center justify-center my-[52px]">
                <div className="absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)' }} />
                <div className="relative w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
              </div>
              <div className="mb-[52px]" data-testid="section-gallery">
                <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>PHOTO GALLERY</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gallery.photos.map((photo, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded" style={{ border: '1px solid rgba(201,169,110,0.18)' }}>
                      <img src={photo} alt={`Memorial photo ${i + 1}`} className="w-full h-full object-cover" data-testid={`img-gallery-${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {gallery.tributeVideoUrls && gallery.tributeVideoUrls.length > 0 && (
            <>
              <div className="relative flex items-center justify-center my-[52px]">
                <div className="absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)' }} />
                <div className="relative w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
              </div>
              <div className="mb-[52px]" data-testid="section-tribute-videos">
                <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>TRIBUTE VIDEOS</h2>
                <div className="space-y-4">
                  {gallery.tributeVideoUrls.map((videoUrl, i) => (
                    <div key={i}>{renderSongEmbed(videoUrl)}</div>
                  ))}
                </div>
              </div>
            </>
          )}

          {gallery.livestreamUrl && (
            <>
              <div className="relative flex items-center justify-center my-[52px]">
                <div className="absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)' }} />
                <div className="relative w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
              </div>
              <div className="mb-[52px]" data-testid="section-livestream">
                <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>LIVESTREAM</h2>
                {renderSongEmbed(gallery.livestreamUrl)}
              </div>
            </>
          )}

          <div className="mb-[52px]" data-testid="section-share">
            <h2 className="text-center mb-7" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.38em', color: '#c9a96e', textTransform: 'uppercase' }}>SHARE THIS MEMORIAL</h2>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button onClick={() => handleShare('Facebook')} className="flex items-center gap-2 px-4 py-2.5" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: '#1877f2', color: 'white', textTransform: 'uppercase' }} data-testid="button-share-facebook"><Facebook size={14} /> FACEBOOK</button>
              <button onClick={() => handleShare('Instagram')} className="flex items-center gap-2 px-4 py-2.5" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', color: 'white', textTransform: 'uppercase' }} data-testid="button-share-instagram"><Instagram size={14} /> INSTAGRAM</button>
              <button onClick={() => handleShare('Twitter')} className="flex items-center gap-2 px-4 py-2.5" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: '#000000', color: 'white', textTransform: 'uppercase' }} data-testid="button-share-x"><Twitter size={14} />X</button>
              <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2.5 transition-all" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', backgroundColor: copied ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,255,0.03)', color: '#c9a96e', border: `1px solid ${copied ? 'rgba(201,169,110,0.4)' : 'rgba(201,169,110,0.18)'}`, textTransform: 'uppercase' }} data-testid="button-copy-link">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'COPIED!' : 'COPY LINK'}</button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-[52px]">
            <div className="absolute left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)' }} />
            <div className="relative w-[6px] h-[6px] transform rotate-45" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.4)' }} />
          </div>

          <div className="text-center pb-[60px] pt-8" style={{ borderTop: '1px solid rgba(201,169,110,0.18)' }}>
            <div className="w-[44px] h-[44px] rounded-full mx-auto flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(9,7,12,0.55)', border: '1px solid #c9a96e' }}>
              <img src={logoImage} alt="Norwert Hills" className="w-8 h-8 object-contain" />
            </div>
            <p className="mb-6 max-w-md mx-auto" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', fontStyle: 'italic', color: 'rgba(245,240,232,0.2)', lineHeight: '1.8' }}>"Well done, good and faithful servant."</p>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', color: 'rgba(201,169,110,0.2)', textTransform: 'uppercase' }}>
              NORWERT HILLS FUNERAL & CREMATION SERVICES<br />1601 W. Thomas St., Hammond, LA 70401
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
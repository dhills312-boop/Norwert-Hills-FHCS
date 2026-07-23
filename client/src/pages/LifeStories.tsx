import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useAnnouncementFonts } from '@/hooks/use-announcement-fonts';
import type { PortraitCrop } from '@shared/schema';
import { portraitCropStyle } from '@/lib/portrait-crop';

interface FeaturedAnnouncement {
  slug: string;
  deceasedFirstName: string;
  deceasedLastName: string;
  dateOfBirth?: string;
  dateOfPassing?: string;
  briefObituary?: string;
  portraitImagePath?: string;
  mediaGallery?: { portraitCrop?: PortraitCrop };
}

export default function LifeStories() {
  useAnnouncementFonts();
  const [featured, setFeatured] = useState<FeaturedAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/announcements/featured')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setFeatured(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#09070c' }}>
        <div className="relative overflow-hidden" style={{ minHeight: '340px', background: 'linear-gradient(to bottom, rgba(9,7,12,0.3) 0%, #09070c 100%)' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.06) 0%, transparent 65%)' }} />
          <div className="relative z-10 text-center pt-24 pb-16 px-8">
            <div className="mb-5" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.42em', color: '#c9a96e', textTransform: 'uppercase' }}>NORWERT HILLS</div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '54px', fontWeight: 300, color: '#f5f0e8', letterSpacing: '0.04em', lineHeight: '1.15' }} data-testid="text-life-stories-title">
              Life Stories
            </h1>
            <div className="mt-6 mx-auto" style={{ width: '40px', height: '1px', backgroundColor: 'rgba(201,169,110,0.4)' }} />
            <p className="mt-6 mx-auto max-w-xl" style={{ fontFamily: 'EB Garamond, serif', fontSize: '17px', color: 'rgba(245,240,232,0.45)', lineHeight: '1.8' }}>
              Stories of remarkable lives — cherished memories, milestones, and the quiet moments that defined who they were.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16">
          {loading && (
            <div className="text-center py-24" data-testid="loading-indicator">
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(201,169,110,0.4)', textTransform: 'uppercase' }}>Loading...</div>
            </div>
          )}

          {!loading && featured.length < 2 && (
            <div className="text-center py-24" data-testid="coming-soon-message">
              <div className="relative inline-block mb-10">
                <div className="w-[5px] h-[5px] rotate-45 mx-auto" style={{ backgroundColor: '#c9a96e', boxShadow: '0 0 12px rgba(201,169,110,0.5)' }} />
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '24px' }}>
                COMING SOON
              </div>
              <p className="max-w-md mx-auto" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(245,240,232,0.35)', lineHeight: '1.8' }}>
                Featured life stories will appear here as families share their remembrances with us.
              </p>
              <div className="mt-12">
                <Link href="/remember">
                  <span className="inline-block px-8 py-3 cursor-pointer transition-colors" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.25)', textTransform: 'uppercase' }} data-testid="link-memorial-gallery">
                    VISIT MEMORIAL GALLERY
                  </span>
                </Link>
              </div>
            </div>
          )}

          {!loading && featured.length >= 2 && (
            <div data-testid="featured-grid">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {featured.slice(0, 2).map((item) => (
                  <FeaturedCard key={item.slug} item={item} large />
                ))}
              </div>
              {featured.length > 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featured.slice(2).map((item) => (
                    <FeaturedCard key={item.slug} item={item} large={false} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center pb-20" data-testid="footer-remember-link">
          <div className="relative flex items-center justify-center mb-12">
            <div className="absolute left-0 right-0 max-w-xs mx-auto h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.18), transparent)' }} />
            <div className="relative w-[5px] h-[5px] rotate-45" style={{ backgroundColor: 'rgba(201,169,110,0.4)' }} />
          </div>
          <Link href="/remember">
            <span className="text-sm cursor-pointer transition-colors" style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.3em', color: 'rgba(201,169,110,0.4)', textTransform: 'uppercase' }}>
              ← RETURN TO MEMORIAL GALLERY
            </span>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

function FeaturedCard({ item, large }: { item: FeaturedAnnouncement; large: boolean }) {
  const fullName = `${item.deceasedFirstName} ${item.deceasedLastName}`;
  const portraitSrc = item.portraitImagePath || '/assets/announcements/charles-braud/portrait.webp';

  return (
    <Link href={`/announcements/${item.slug}`}>
      <div
        className="group relative overflow-hidden cursor-pointer"
        style={{
          height: large ? '480px' : '320px',
          border: '1px solid rgba(201,169,110,0.12)',
        }}
        data-testid={`card-featured-${item.slug}`}
      >
        <img
          src={portraitSrc}
          alt={fullName}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
          style={portraitCropStyle(item.mediaGallery?.portraitCrop)}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(9,7,12,0.1) 0%, rgba(9,7,12,0.2) 40%, rgba(9,7,12,0.88) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-7">
          {(item.dateOfBirth || item.dateOfPassing) && (
            <div className="mb-2" style={{ fontFamily: 'Cinzel, serif', fontSize: '7px', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>
              {item.dateOfBirth}{item.dateOfBirth && item.dateOfPassing ? ' · ' : ''}{item.dateOfPassing}
            </div>
          )}
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: large ? '32px' : '24px', fontWeight: 300, color: '#f5f0e8', letterSpacing: '0.04em', lineHeight: '1.2', marginBottom: '10px' }} data-testid={`text-featured-name-${item.slug}`}>
            {fullName}
          </h2>
          {item.briefObituary && (
            <p
              style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: '14px',
                color: 'rgba(245,240,232,0.5)',
                lineHeight: '1.6',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as any,
                overflow: 'hidden',
              }}
            >
              {item.briefObituary}
            </p>
          )}
          <div className="mt-4" style={{ fontFamily: 'Cinzel, serif', fontSize: '7px', letterSpacing: '0.3em', color: 'rgba(201,169,110,0.5)', textTransform: 'uppercase' }}>
            READ THEIR STORY →
          </div>
        </div>
      </div>
    </Link>
  );
}

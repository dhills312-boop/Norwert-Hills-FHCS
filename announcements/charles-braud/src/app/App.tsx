import { Music, Facebook, Instagram, Twitter, Link2, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import logoImage from 'figma:asset/5a66b8abf02e4f57eeb09eb7543a1efc3232d4b4.png';
import backgroundImage from 'figma:asset/828e66bd4d46b1649ab15200c1f2666e0a65911a.png';
import portraitImage from 'figma:asset/4ee2aa5ae60c2104a642ec4c59d5c375d04b207b.png';

// Star particle component
function StarField() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate random stars
    const generatedStars = Array.from({ length: 50 }, (_, i) => ({
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
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite alternate, float ${star.duration * 2}s ease-in-out ${star.delay}s infinite alternate`,
            boxShadow: '0 0 4px rgba(201,169,110,0.5)'
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  // Configurable dates - set to empty string or actual dates
  const dateOfBirth = ''; // e.g., 'AUGUST 12, 1947'
  const dateOfPassing = ''; // e.g., 'MARCH 8, 2026'
  
  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleGetDirections = () => {
    const address = '1601 W. Thomas St., Hammond, LA 70401';
    const encodedAddress = encodeURIComponent(address);
    
    // Try to detect if user is on iOS for Apple Maps, otherwise use Google Maps
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`maps://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`);
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    }
  };

  const handleAddToCalendar = () => {
    // Create ICS file for calendar event
    const event = {
      title: 'Funeral Service - Charles Braud',
      description: 'Funeral service at Norwert Hills Funeral & Cremation Services',
      location: '1601 W. Thomas St., Hammond, LA 70401',
      startDate: '2026-03-13T10:00:00',
      endDate: '2026-03-13T11:00:00'
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${event.startDate.replace(/[-:]/g, '')}`,
      `DTEND:${event.endDate.replace(/[-:]/g, '')}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'funeral-service.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#09070c' }}>
      {/* Extended Background Image with Movement */}
      <div 
        className="fixed inset-0 bg-cover bg-center animate-slow-zoom"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          opacity: 0.15,
          transform: 'scale(1.1)',
          animation: 'slowZoom 60s ease-in-out infinite alternate',
          zIndex: 0
        }}
      />
      
      {/* Star Field Animation - layered on top of marble */}
      <StarField />
      
      {/* Vignette Overlay - Full page */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(9,7,12,0.7) 70%, #09070c 100%)',
          zIndex: 2
        }}
      />

      {/* Hero Section */}
      <div className="relative mx-auto" style={{ maxWidth: '780px', zIndex: 3 }}>
        {/* Background Image with Vignette Overlays */}
        <div className="relative h-[680px] overflow-hidden">
          {/* Background Image */}
          
          
          {/* Vignette Overlay - Radial */}
          
      

          {/* Logo at Top */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
            <div 
              className="w-[80px] h-[80px] mx-auto flex items-center justify-center mb-2"
              style={{
                backgroundColor: 'transparent'
              }}
            >
              <img src={logoImage} alt="Norwert Hills" className="w-16 h-16 object-contain" style={{ filter: 'brightness(1.2) contrast(1.1)' }} />
            </div>
            <div 
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8.5px',
                letterSpacing: '0.3em',
                color: '#c9a96e',
                textTransform: 'uppercase'
              }}
            >
              NORWERT HILLS
            </div>
          </div>

          {/* Portrait Circle - Centered in mid-hero */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
            <div className="relative">
              {/* Outer ring */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  width: '308px',
                  height: '308px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: '1px solid rgba(201,169,110,0.08)'
                }}
              />
              {/* Inner ring and portrait */}
              <div 
                className="relative w-[280px] h-[280px] rounded-full overflow-hidden"
                style={{
                  border: '2px solid rgba(201,169,110,0.25)',
                  boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.4)'
                }}
              >
                <img 
                  src={portraitImage} 
                  alt="Portrait" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Text Content - Anchored to bottom */}
          <div className="absolute bottom-16 left-0 right-0 text-center px-12">
            {/* Life Dates - Only show if dates are provided */}
            {(dateOfBirth || dateOfPassing) && (
              <div 
                className="mb-4"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '0.38em',
                  color: '#c9a96e',
                  textTransform: 'uppercase'
                }}
              >
                {dateOfBirth} {dateOfBirth && dateOfPassing && '·'} {dateOfPassing}
              </div>
            )}

            {/* Name */}
            <h1 className="mb-2">
              <span 
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '60px',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  letterSpacing: '0.06em',
                  color: '#e8cfa0'
                }}
              >
                Charles
              </span>
              {' '}
              <span 
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '60px',
                  fontWeight: 400,
                  letterSpacing: '0.06em',
                  color: '#f5f0e8'
                }}
              >
                Braud
              </span>
            </h1>

            {/* Subtitle */}
            <div 
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '16px',
                fontStyle: 'italic',
                color: 'rgba(245,240,232,0.45)'
              }}
            >
              Beloved Father · Grandfather · Friend
            </div>
          </div>
        </div>

        {/* Content Zone */}
        <div className="relative px-12" style={{ 
          background: `
            radial-gradient(ellipse at 20% 100%, rgba(90,50,8,0.18) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(40,20,55,0.15) 0%, transparent 50%),
            #09070c
          `
        }}>
          {/* Subtle marble veining effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(65deg, transparent 0%, rgba(201,169,110,0.07) 50%, transparent 100%),
                linear-gradient(115deg, transparent 0%, rgba(201,169,110,0.07) 50%, transparent 100%)
              `,
              mixBlendMode: 'overlay'
            }}
          />

          {/* Ornament Divider */}
          <div className="relative flex items-center justify-center my-[52px]">
            <div 
              className="absolute left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)'
              }}
            />
            <div 
              className="relative w-[6px] h-[6px] transform rotate-45"
              style={{
                backgroundColor: '#c9a96e',
                boxShadow: '0 0 12px rgba(201,169,110,0.4)'
              }}
            />
          </div>

          {/* Service Details Grid */}
          <div className="mb-[52px]">
            <h2 
              className="text-center mb-7"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.38em',
                color: '#c9a96e',
                textTransform: 'uppercase'
              }}
            >
              SERVICE INFORMATION
            </h2>

            <div 
              className="grid grid-cols-2 gap-px"
              style={{
                backgroundColor: 'rgba(201,169,110,0.18)'
              }}
            >
              {/* Viewing */}
              <div 
                className="p-7 text-center"
                style={{ backgroundColor: 'rgba(9,7,12,0.85)' }}
              >
                <div 
                  className="mb-2"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '8px',
                    letterSpacing: '0.3em',
                    color: '#c9a96e',
                    textTransform: 'uppercase'
                  }}
                >
                  VIEWING
                </div>
                <div 
                  className="mb-1"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '19px',
                    fontWeight: 300,
                    color: '#f5f0e8'
                  }}
                >
                  March 13, 2026
                </div>
                <div 
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: 'rgba(245,240,232,0.4)'
                  }}
                >
                  9:00 AM – 10:00 AM
                </div>
              </div>

              {/* Funeral Service */}
              <div 
                className="p-7 text-center"
                style={{ backgroundColor: 'rgba(9,7,12,0.85)' }}
              >
                <div 
                  className="mb-2"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '8px',
                    letterSpacing: '0.3em',
                    color: '#c9a96e',
                    textTransform: 'uppercase'
                  }}
                >
                  FUNERAL SERVICE
                </div>
                <div 
                  className="mb-1"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '19px',
                    fontWeight: 300,
                    color: '#f5f0e8'
                  }}
                >
                  March 13, 2026
                </div>
                <div 
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: 'rgba(245,240,232,0.4)'
                  }}
                >
                  10:00 AM
                </div>
              </div>

              {/* Location */}
              <div 
                className="p-7 text-center"
                style={{ backgroundColor: 'rgba(9,7,12,0.85)' }}
              >
                <div 
                  className="mb-2"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '8px',
                    letterSpacing: '0.3em',
                    color: '#c9a96e',
                    textTransform: 'uppercase'
                  }}
                >
                  LOCATION
                </div>
                <div 
                  className="mb-1"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '19px',
                    fontWeight: 300,
                    color: '#f5f0e8'
                  }}
                >
                  Norwert Hills
                </div>
                <div 
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: 'rgba(245,240,232,0.4)'
                  }}
                >
                  1601 W. Thomas St., Hammond, LA
                </div>
              </div>

              {/* Interment */}
              <div 
                className="p-7 text-center"
                style={{ backgroundColor: 'rgba(9,7,12,0.85)' }}
              >
                <div 
                  className="mb-2"
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '8px',
                    letterSpacing: '0.3em',
                    color: '#c9a96e',
                    textTransform: 'uppercase'
                  }}
                >
                  INTERMENT
                </div>
                <div 
                  className="mb-1"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '19px',
                    fontWeight: 300,
                    color: '#f5f0e8'
                  }}
                >
                  To Follow
                </div>
                <div 
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: 'rgba(245,240,232,0.4)'
                  }}
                >
                  Immediately following service
                </div>
              </div>
            </div>
          </div>

          {/* Get Directions Button */}
          <div className="mb-[52px] flex justify-center">
            <button 
              onClick={handleGetDirections}
              className="flex items-center gap-2 px-6 py-3 transition-all hover:bg-opacity-70"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.3em',
                backgroundColor: 'rgba(201,169,110,0.15)',
                color: '#c9a96e',
                border: '1px solid rgba(201,169,110,0.25)',
                textTransform: 'uppercase'
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              GET DIRECTIONS
            </button>
          </div>

          {/* Add to Calendar Button */}
          <div className="mb-[52px] flex justify-center">
            <button 
              onClick={handleAddToCalendar}
              className="flex items-center gap-2 px-6 py-3 transition-all hover:bg-opacity-70"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.3em',
                backgroundColor: 'rgba(201,169,110,0.15)',
                color: '#c9a96e',
                border: '1px solid rgba(201,169,110,0.25)',
                textTransform: 'uppercase'
              }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <line x1="3" y1="16" x2="21" y2="16"></line>
                <line x1="3" y1="22" x2="21" y2="22"></line>
              </svg>
              ADD TO CALENDAR
            </button>
          </div>

          {/* Ornament Divider */}
          <div className="relative flex items-center justify-center my-[52px]">
            <div 
              className="absolute left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)'
              }}
            />
            <div 
              className="relative w-[6px] h-[6px] transform rotate-45"
              style={{
                backgroundColor: '#c9a96e',
                boxShadow: '0 0 12px rgba(201,169,110,0.4)'
              }}
            />
          </div>

          {/* Music Section */}
          <div className="mb-[52px]">
            <h2 
              className="text-center mb-7"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.38em',
                color: '#c9a96e',
                textTransform: 'uppercase'
              }}
            >
              MUSICAL SELECTION
            </h2>

            <div 
              className="flex items-center justify-between p-5"
              style={{
                backgroundColor: 'rgba(9,7,12,0.85)',
                border: '1px solid rgba(201,169,110,0.18)'
              }}
            >
              <div className="flex items-center gap-4">
                <Music size={20} style={{ color: '#c9a96e' }} />
                <div>
                  <div 
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '17px',
                      color: '#f5f0e8'
                    }}
                  >
                    A Change Is Gonna Come
                  </div>
                  <div 
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '14px',
                      fontStyle: 'italic',
                      color: 'rgba(245,240,232,0.4)'
                    }}
                  >
                    Sam Cooke
                  </div>
                </div>
              </div>
              <button 
                className="px-4 py-2"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  color: '#c9a96e',
                  border: '1px solid rgba(201,169,110,0.18)',
                  textTransform: 'uppercase'
                }}
              >
                PLAY
              </button>
            </div>
          </div>

          {/* Scripture Section */}
          <div className="mb-[52px]">
            <h2 
              className="text-center mb-7"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.38em',
                color: '#c9a96e',
                textTransform: 'uppercase'
              }}
            >
              SCRIPTURE READING
            </h2>

            <div 
              className="pl-6 py-4"
              style={{
                borderLeft: '1.5px solid rgba(201,169,110,0.25)'
              }}
            >
              <p 
                className="mb-4"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '19px',
                  fontStyle: 'italic',
                  color: 'rgba(245,240,232,0.65)',
                  lineHeight: '1.85'
                }}
              >
                "I have fought a good fight, I have finished my course, I have kept the faith."
              </p>
              <div 
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  color: '#c9a96e',
                  textTransform: 'uppercase'
                }}
              >
                2 TIMOTHY 4:7
              </div>
            </div>
          </div>

          {/* Obituary Section */}
          <div className="mb-[52px]">
            <h2 
              className="text-center mb-7"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.38em',
                color: '#c9a96e',
                textTransform: 'uppercase'
              }}
            >
              OBITUARY
            </h2>

            <div 
              style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: '17px',
                color: 'rgba(245,240,232,0.58)',
                lineHeight: '1.9',
                textAlign: 'justify'
              }}
            >
              <span 
                className="float-left mr-2 leading-none"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '3.4rem',
                  color: '#c9a96e',
                  lineHeight: '0.8'
                }}
              >
                C
              </span>
              harles Braud was a man of warmth, laughter, and quiet strength. He carried himself with a dignity that commanded respect and a smile that put everyone at ease. A devoted presence in the lives of those he loved, Charles leaves behind memories that will never fade — in the hearts of his family, his friends, and all who were fortunate enough to share in his company.
            </div>
          </div>

          {/* Share Section */}
          <div className="mb-[52px]">
            <h2 
              className="text-center mb-7"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.38em',
                color: '#c9a96e',
                textTransform: 'uppercase'
              }}
            >
              SHARE THIS MEMORIAL
            </h2>

            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => handleShare('Facebook')}
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  backgroundColor: '#1877f2',
                  color: 'white',
                  textTransform: 'uppercase'
                }}
              >
                <Facebook size={14} />
                FACEBOOK
              </button>

              <button 
                onClick={() => handleShare('Instagram')}
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                  color: 'white',
                  textTransform: 'uppercase'
                }}
              >
                <Instagram size={14} />
                INSTAGRAM
              </button>

              <button 
                onClick={() => handleShare('Twitter')}
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  backgroundColor: '#000000',
                  color: 'white',
                  textTransform: 'uppercase'
                }}
              >
                <Twitter size={14} />
                X
              </button>

              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2.5"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '8px',
                  letterSpacing: '0.3em',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: '#c9a96e',
                  border: '1px solid rgba(201,169,110,0.18)',
                  textTransform: 'uppercase'
                }}
              >
                <Copy size={14} />
                COPY LINK
              </button>
            </div>
          </div>

          {/* Ornament Divider */}
          <div className="relative flex items-center justify-center my-[52px]">
            <div 
              className="absolute left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(201,169,110,0.18) 50%, transparent 100%)'
              }}
            />
            <div 
              className="relative w-[6px] h-[6px] transform rotate-45"
              style={{
                backgroundColor: '#c9a96e',
                boxShadow: '0 0 12px rgba(201,169,110,0.4)'
              }}
            />
          </div>

          {/* Footer */}
          <div 
            className="text-center pb-[60px] pt-8"
            style={{
              borderTop: '1px solid rgba(201,169,110,0.18)'
            }}
          >
            {/* Logo */}
            <div 
              className="w-[44px] h-[44px] rounded-full mx-auto flex items-center justify-center mb-6"
              style={{
                backgroundColor: 'rgba(9,7,12,0.55)',
                border: '1px solid #c9a96e'
              }}
            >
              <img src={logoImage} alt="Norwert Hills" className="w-8 h-8 object-contain" />
            </div>

            {/* Scripture Quote */}
            <p 
              className="mb-6 max-w-md mx-auto"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '16px',
                fontStyle: 'italic',
                color: 'rgba(245,240,232,0.2)',
                lineHeight: '1.8'
              }}
            >
              "Well done, good and faithful servant."
            </p>

            {/* Firm Name and Address */}
            <div 
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.3em',
                color: 'rgba(201,169,110,0.2)',
                textTransform: 'uppercase'
              }}
            >
              NORWERT HILLS FUNERAL & CREMATION SERVICES
              <br />
              1601 W. Thomas St., Hammond, LA 70401
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
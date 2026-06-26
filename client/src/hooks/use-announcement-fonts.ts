import { useEffect } from 'react';

const FONT_LINK_ID = 'announcement-fonts';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;1,400&display=swap';

export function useAnnouncementFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;

    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);

    return () => {
      const el = document.getElementById(FONT_LINK_ID);
      if (el) el.remove();
    };
  }, []);
}

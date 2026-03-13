interface AnnouncementMeta {
  title: string;
  description: string;
  image: string;
}

const announcements: Record<string, AnnouncementMeta> = {
  'charles-braud': {
    title: 'In Loving Memory of Charles Braud',
    description: 'Beloved Father, Grandfather, and Friend. Funeral service at Norwert Hills Funeral Home, Main Chapel — 1601 W. Thomas St., Hammond, LA.',
    image: '/assets/announcements/charles-braud/portrait.png',
  },
};

export function getAnnouncementMeta(slug: string): AnnouncementMeta | null {
  return announcements[slug] || null;
}

export function injectAnnouncementMeta(html: string, meta: AnnouncementMeta, baseUrl: string): string {
  const imageUrl = `${baseUrl}${meta.image}`;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title} | Norwert Hills</title>`
  );

  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${meta.title}" />`
  );

  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${meta.description}" />`
  );

  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="article" />`
  );

  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${meta.title}" />`
  );

  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${meta.description}" />`
  );

  if (!html.includes('og:image')) {
    html = html.replace(
      '</head>',
      `    <meta property="og:image" content="${imageUrl}" />\n    <meta name="twitter:image" content="${imageUrl}" />\n  </head>`
    );
  } else {
    html = html.replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${imageUrl}" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${imageUrl}" />`
    );
  }

  return html;
}

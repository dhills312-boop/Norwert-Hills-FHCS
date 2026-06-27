function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

export function injectAnnouncementMeta(html: string, meta: AnnouncementMeta, baseUrl: string, canonicalPath: string): string {
  const imageUrl = escapeHtmlAttr(`${baseUrl}${meta.image}`);
  const canonicalUrl = escapeHtmlAttr(`${baseUrl}${canonicalPath}`);
  const safeTitle = escapeHtmlAttr(`${meta.title} | Norwert Hills`);
  const safeOgTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${safeOgTitle}" />`
  );

  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${safeDesc}" />`
  );

  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="article" />`
  );

  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${imageUrl}" />`
  );

  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${safeOgTitle}" />`
  );

  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );

  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${imageUrl}" />`
  );

  html = injectCanonical(html, canonicalUrl);

  return html;
}

export function injectStaticMeta(
  html: string,
  meta: { title: string; description: string },
  canonicalUrl: string
): string {
  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeCanonical = escapeHtmlAttr(canonicalUrl);

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${safeTitle}" />`
  );

  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${safeDesc}" />`
  );

  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );

  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );

  html = injectCanonical(html, safeCanonical);

  return html;
}

export function injectNoscriptContent(html: string, innerHtml: string): string {
  const block = `\n  <noscript id="page-content">\n${innerHtml}\n  </noscript>`;
  return html.replace('</body>', `${block}\n</body>`);
}

export function injectCanonical(html: string, canonicalUrl: string): string {
  const safeUrl = escapeHtmlAttr(canonicalUrl);
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${safeUrl}" />`
    );
  } else {
    html = html.replace(
      '</head>',
      `    <link rel="canonical" href="${safeUrl}" />\n  </head>`
    );
  }
  return html;
}

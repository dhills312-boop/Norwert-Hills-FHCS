import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { announcements, serviceCatalog } from "@shared/schema";
import { getAnnouncementMeta, injectAnnouncementMeta, injectStaticMeta, injectCanonical, injectNoscriptContent } from "./announcement-meta";
import { articleContent, serviceContent, memorialContent } from "./static-content";
import { ARTICLE_SLUGS, MEMORIAL_SLUGS, SERVICE_SLUGS, LEGACY_ANNOUNCEMENT_SLUGS } from "@shared/static-slugs";

const SITE_NAME = "Norwert Hills Funeral & Cremation Services";

const staticRouteMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SITE_NAME} | Louisiana`,
    description: 'Norwert Hills Funeral & Cremation Services provides compassionate, dignified funeral, memorial, and cremation services across Louisiana. Serving families with care and excellence.',
  },
  '/services': {
    title: `Funeral & Cremation Services | Norwert Hills`,
    description: 'Explore our full range of funeral, cremation, and memorial services. From traditional ceremonies to direct cremation, Norwert Hills serves Louisiana families with dignity and care.',
  },
  '/about': {
    title: `About Us | ${SITE_NAME}`,
    description: 'Learn about the Norwert Hills family, our history, our chapel in Hammond, LA, and our commitment to serving Louisiana families with compassion.',
  },
  '/contact': {
    title: `Contact Us | ${SITE_NAME}`,
    description: 'Reach out to Norwert Hills Funeral & Cremation Services. We are available around the clock to assist Louisiana families in their time of need.',
  },
  '/resources': {
    title: `Funeral Planning Resources | Norwert Hills`,
    description: 'Access helpful guides, FAQs, and articles on funeral planning, grief support, and end-of-life decisions from Norwert Hills Funeral & Cremation Services.',
  },
  '/resources/faq': {
    title: `Frequently Asked Questions | Norwert Hills`,
    description: 'Answers to common questions about funeral services, cremation, pre-planning, and what to do when a loved one passes in Louisiana.',
  },
  '/cremation': {
    title: `Direct Cremation Services | Norwert Hills`,
    description: 'Affordable, dignified direct cremation services in Louisiana. Norwert Hills provides transparent pricing and compassionate care for families choosing cremation.',
  },
  '/pre-planning': {
    title: `Pre-Plan Your Funeral | ${SITE_NAME}`,
    description: 'Pre-plan your funeral arrangements with Norwert Hills. Give your family the gift of peace of mind with thoughtful advance planning in Louisiana.',
  },
  '/remember': {
    title: `Remembering Lives | ${SITE_NAME}`,
    description: 'A curated memorial gallery honoring those who have passed through our care. Read tributes, service details, and share remembrances with families we have served.',
  },
  '/remember/stories': {
    title: `Life Stories | ${SITE_NAME}`,
    description: 'Featured memorials and life stories from families we have had the honor to serve. A curated editorial collection by Norwert Hills Funeral & Cremation Services.',
  },
};

const serviceMetaMap: Record<string, { title: string; description: string }> = {
  'traditional-ceremony': {
    title: `Traditional Funeral Ceremony | Norwert Hills`,
    description: 'A time-honored gathering to pay respects and celebrate a life well-lived. Our traditional ceremonies are crafted with dignity and care in Louisiana.',
  },
  'cremation-services': {
    title: `Cremation Services | Norwert Hills`,
    description: 'Dignified cremation options with or without memorial gatherings. Norwert Hills offers compassionate cremation care for Louisiana families.',
  },
  'bespoke-memorials': {
    title: `Bespoke Memorial Services | Norwert Hills`,
    description: 'Personalized tributes that uniquely reflect the individual\'s spirit. Norwert Hills designs meaningful, custom memorials for Louisiana families.',
  },
  'pre-planning': {
    title: `Pre-Planning Funeral Services | Norwert Hills`,
    description: 'The greatest gift of peace of mind for your family\'s future. Pre-plan your funeral arrangements with Norwert Hills in Louisiana.',
  },
};

const memorialMetaMap: Record<string, { title: string; description: string; image: string }> = {
  'jonis-warren': {
    title: 'In Loving Memory of Jonis Leonardo Warren Jr. | Norwert Hills',
    description: 'Jonis Leonardo Warren Jr. is remembered with love, gratitude, and deep care by family and friends. Memorial tribute hosted by Norwert Hills Funeral and Cremation Services.',
    image: '/assets/memorials/jonis-warren.webp',
  },
  'lelia-henderson': {
    title: 'In Loving Memory of Lelia Henderson | Norwert Hills',
    description: 'Lelia Henderson is remembered with tenderness, beauty, and love. Her homegoing celebration invites family and friends to gather in gratitude for the life she lived.',
    image: '/assets/memorials/lelia-henderson.webp',
  },
  'deloris-holden': {
    title: 'In Loving Memory of Deloris Leonard Holden | Norwert Hills',
    description: 'Mother Deloris Leonard Holden is honored by the Holden family with a life celebration reflecting a legacy of faith, family, and steady love.',
    image: '/assets/memorials/deloris-holden.webp',
  },
  'brandon-mckay': {
    title: 'In Loving Memory of Brandon Chase McKay | Norwert Hills',
    description: 'Brandon Chase McKay is remembered through family photographs, milestone moments, and the faces of those who held him close.',
    image: '/assets/memorials/brandon-mckay.webp',
  },
  'richard-gross': {
    title: 'In Loving Memory of Rev. Dr. Richie L. Gross | Norwert Hills',
    description: 'Reverend Doctor Richie L. Gross is celebrated under the banner of faith, family, and favor — a life of spiritual leadership and enduring love.',
    image: '/assets/memorials/richard-gross.webp',
  },
  'keiaris-tilman': {
    title: "In Loving Memory of Ke'Aris Alexandria Tillman | Norwert Hills",
    description: "Ke'Aris Alexandria Tillman is remembered with tenderness as a beloved little angel. Family and friends are invited to gather in love, prayer, and remembrance.",
    image: '/assets/memorials/keiaris-tilman.webp',
  },
  'troyshaun-martin': {
    title: "In Loving Memory of Troy'Shaun Ja'Rae Martin | Norwert Hills",
    description: "Troy'Shaun Ja'Rae Martin is remembered with a bright, heroic spirit. His celebration carries the colors, wonder, and courage of a beloved child.",
    image: '/assets/memorials/troyshaun-martin.webp',
  },
  'steven-dillon': {
    title: 'In Loving Memory of Steven Douglas Dillon | Norwert Hills',
    description: 'Steven Douglas Dillon is remembered with dignity, quiet strength, and the patient heart of a fisherman. Family and friends are invited to his homegoing service.',
    image: '/assets/memorials/steven-dillon.webp',
  },
};

const articleMetaMap: Record<string, { title: string; description: string }> = {
  'understanding-cremation': {
    title: `Understanding Cremation: A Guide for Families | Norwert Hills`,
    description: 'Cremation is a choice made by many families for deeply personal reasons. Learn about the cremation process to help make informed decisions for your loved one.',
  },
  'bespoke-memorials': {
    title: `The Art of the Bespoke Memorial | Norwert Hills`,
    description: 'A memorial is more than a service — it is a reflection of a life lived. Learn how a personalized tribute can honor your loved one\'s unique spirit.',
  },
  'planning-ahead': {
    title: `Planning Ahead: The Gift of Peace | Norwert Hills`,
    description: 'Planning ahead is an act of care. It allows individuals to express their wishes clearly and offers loved ones guidance during an emotional time.',
  },
};

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBaseUrl(req: express.Request): string {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'] || '';
  return `${protocol}://${host}`;
}

function stripQuery(url: string): string {
  return url.split('?')[0].split('#')[0];
}

function buildArticleNoscript(slug: string): string | null {
  const article = articleContent[slug];
  if (!article) return null;
  const paras = article.paragraphs.map(p => `    <p>${esc(p)}</p>`).join('\n');
  return `    <h1>${esc(article.title)}</h1>\n    <p><em>${esc(article.category)}</em></p>\n${paras}\n    <p><a href="/contact">Contact a Director</a></p>`;
}

function buildServiceNoscript(slug: string): string | null {
  const svc = serviceContent[slug];
  if (!svc) return null;
  return `    <h1>${esc(svc.title)}</h1>\n    <p>${esc(svc.description)}</p>\n    <p>${esc(svc.longDescription)}</p>\n    <p><a href="/services">View all services</a></p>`;
}

function buildMemorialNoscript(slug: string): string | null {
  const m = memorialContent[slug];
  if (!m) return null;
  const lines = [`    <h1>In Loving Memory of ${esc(m.name)}</h1>`, `    <p>${esc(m.obituary)}</p>`];
  if (m.serviceDate) lines.push(`    <p>Service: ${esc(m.serviceDate)}${m.venue ? ` — ${esc(m.venue)}` : ''}${m.address ? `, ${esc(m.address)}` : ''}</p>`);
  lines.push(`    <p>Hosted by Norwert Hills Funeral &amp; Cremation Services, Hammond, Louisiana.</p>`);
  return lines.join('\n');
}

function buildAnnouncementNoscript(name: string, brief: string): string {
  return `    <h1>In Loving Memory of ${esc(name)}</h1>\n    <p>${esc(brief)}</p>\n    <p>A memorial page by Norwert Hills Funeral &amp; Cremation Services, Hammond, Louisiana.</p>`;
}

function buildObituaryNoscript(name: string, fullObit: string, briefObit: string): string {
  const body = fullObit || briefObit;
  return `    <h1>Obituary: ${esc(name)}</h1>\n    <p>${esc(body)}</p>\n    <p>Norwert Hills Funeral &amp; Cremation Services — Hammond, Louisiana.</p>`;
}

async function resolveAnnouncementMeta(slug: string): Promise<{ title: string; description: string; image: string } | null> {
  const hardcoded = getAnnouncementMeta(slug);
  if (hardcoded) return hardcoded;

  try {
    const [row] = await db
      .select({
        deceasedFirstName: announcements.deceasedFirstName,
        deceasedLastName: announcements.deceasedLastName,
        briefObituary: announcements.briefObituary,
        portraitImagePath: announcements.portraitImagePath,
        isPublished: announcements.isPublished,
        slug: announcements.slug,
      })
      .from(announcements)
      .where(eq(announcements.slug, slug))
      .limit(1);

    if (!row || !row.isPublished) return null;

    const fullName = `${row.deceasedFirstName} ${row.deceasedLastName}`;
    return {
      title: `In Loving Memory of ${fullName}`,
      description: row.briefObituary
        ? row.briefObituary.slice(0, 160).trim()
        : `A memorial page honoring the life of ${fullName}. Norwert Hills Funeral & Cremation Services.`,
      image: row.portraitImagePath || '/opengraph.jpg',
    };
  } catch {
    return null;
  }
}

async function resolveAnnouncementRow(slug: string): Promise<{
  deceasedFirstName: string;
  deceasedLastName: string;
  briefObituary: string | null;
  fullObituary: string | null;
  isPublished: boolean;
} | null> {
  const legacy = (LEGACY_ANNOUNCEMENT_SLUGS as readonly string[]).includes(slug);
  if (legacy) return null;
  try {
    const [row] = await db
      .select({
        deceasedFirstName: announcements.deceasedFirstName,
        deceasedLastName: announcements.deceasedLastName,
        briefObituary: announcements.briefObituary,
        fullObituary: announcements.fullObituary,
        isPublished: announcements.isPublished,
      })
      .from(announcements)
      .where(eq(announcements.slug, slug))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

async function resolveServiceMeta(id: string): Promise<{ title: string; description: string } | null> {
  const static_ = serviceMetaMap[id];
  if (static_) return static_;

  try {
    const [row] = await db
      .select({ name: serviceCatalog.name, description: serviceCatalog.description })
      .from(serviceCatalog)
      .where(eq(serviceCatalog.id, id))
      .limit(1);

    if (!row) return null;
    return {
      title: `${row.name} | Norwert Hills`,
      description: row.description || `Learn about ${row.name} at Norwert Hills Funeral & Cremation Services in Louisiana.`,
    };
  } catch {
    return null;
  }
}

function isStaffOrInternalPath(p: string): boolean {
  return p.startsWith('/staff/') || p.startsWith('/social/');
}

function isKnownStaticPath(p: string): boolean {
  return Object.prototype.hasOwnProperty.call(staticRouteMeta, p);
}

function isKnownSlugPath(p: string): boolean {
  return (
    /^\/services\/[^/?#]+$/.test(p) ||
    /^\/resources\/article\/[^/?#]+$/.test(p) ||
    /^\/memorials\/[^/?#]+$/.test(p) ||
    /^\/announcements\/[^/?#]+$/.test(p) ||
    /^\/obituaries\/[^/?#]+$/.test(p)
  );
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, { index: false }));

  app.use("/{*path}", async (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const canonicalPath = stripQuery(req.originalUrl);
    const baseUrl = getBaseUrl(req);
    const canonicalUrl = `${baseUrl}${canonicalPath}`;

    let html = fs.readFileSync(indexPath, "utf-8");

    const announcementMatch = canonicalPath.match(/^\/announcements\/([^/?#]+)$/);
    const obituaryMatch = canonicalPath.match(/^\/obituaries\/([^/?#]+)$/);
    const memorialMatch = canonicalPath.match(/^\/memorials\/([^/?#]+)$/);
    const serviceMatch = canonicalPath.match(/^\/services\/([^/?#]+)$/);
    const articleMatch = canonicalPath.match(/^\/resources\/article\/([^/?#]+)$/);

    if (announcementMatch) {
      const slug = announcementMatch[1];
      const isLegacy = (LEGACY_ANNOUNCEMENT_SLUGS as readonly string[]).includes(slug);
      const meta = await resolveAnnouncementMeta(slug);

      if (!meta && !isLegacy) {
        return res.status(404).set({ "Content-Type": "text/html" }).end(html);
      }

      if (meta) {
        html = injectAnnouncementMeta(html, meta, baseUrl, canonicalPath);
        const row = await resolveAnnouncementRow(slug);
        const brief = row?.briefObituary || meta.description;
        const noscript = buildAnnouncementNoscript(meta.title.replace(' | Norwert Hills', ''), brief);
        html = injectNoscriptContent(html, noscript);
      }
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    if (obituaryMatch) {
      const slug = obituaryMatch[1];
      const isLegacy = (LEGACY_ANNOUNCEMENT_SLUGS as readonly string[]).includes(slug);
      const meta = await resolveAnnouncementMeta(slug);

      if (!meta && !isLegacy) {
        return res.status(404).set({ "Content-Type": "text/html" }).end(html);
      }

      if (meta) {
        html = injectAnnouncementMeta(html, meta, baseUrl, canonicalPath);
        const row = await resolveAnnouncementRow(slug);
        const name = meta.title.replace('In Loving Memory of ', '').replace(' | Norwert Hills', '');
        const noscript = buildObituaryNoscript(name, row?.fullObituary || '', row?.briefObituary || meta.description);
        html = injectNoscriptContent(html, noscript);
      }
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    if (memorialMatch) {
      const slug = memorialMatch[1];
      const meta = memorialMetaMap[slug];

      if (!meta) {
        return res.status(404).set({ "Content-Type": "text/html" }).end(html);
      }

      html = injectAnnouncementMeta(html, meta, baseUrl, canonicalPath);
      const noscript = buildMemorialNoscript(slug);
      if (noscript) html = injectNoscriptContent(html, noscript);
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    if (serviceMatch) {
      const id = serviceMatch[1];
      const isStaticSlug = (SERVICE_SLUGS as readonly string[]).includes(id);
      const meta = await resolveServiceMeta(id);

      if (!meta && !isStaticSlug) {
        return res.status(404).set({ "Content-Type": "text/html" }).end(html);
      }

      if (meta) {
        html = injectStaticMeta(html, meta, canonicalUrl);
        const noscript = buildServiceNoscript(id);
        if (noscript) html = injectNoscriptContent(html, noscript);
      }
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    if (articleMatch) {
      const id = articleMatch[1];
      const meta = articleMetaMap[id];

      if (!meta) {
        return res.status(404).set({ "Content-Type": "text/html" }).end(html);
      }

      html = injectStaticMeta(html, meta, canonicalUrl);
      const noscript = buildArticleNoscript(id);
      if (noscript) html = injectNoscriptContent(html, noscript);
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    const routeMeta = staticRouteMeta[canonicalPath];
    if (routeMeta) {
      html = injectStaticMeta(html, routeMeta, canonicalUrl);
      if (canonicalPath === '/remember') {
        const noscript = `    <h1>Remembering Lives | Norwert Hills Funeral &amp; Cremation Services</h1>\n    <p>A curated memorial gallery honoring those who have passed through our care. Browse tributes, service details, and share remembrances.</p>\n    <p>Norwert Hills Funeral &amp; Cremation Services — Hammond, Louisiana.</p>`;
        html = injectNoscriptContent(html, noscript);
      }
      if (canonicalPath === '/remember/stories') {
        const noscript = `    <h1>Life Stories | Norwert Hills Funeral &amp; Cremation Services</h1>\n    <p>Featured memorials and life stories from families we have had the honor to serve. A curated editorial collection honoring those who shaped the lives of the people around them.</p>\n    <p>Norwert Hills Funeral &amp; Cremation Services — Hammond, Louisiana.</p>`;
        html = injectNoscriptContent(html, noscript);
      }
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    if (isStaffOrInternalPath(canonicalPath)) {
      html = injectCanonical(html, canonicalUrl);
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    if (isKnownSlugPath(canonicalPath) || isKnownStaticPath(canonicalPath)) {
      html = injectCanonical(html, canonicalUrl);
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    return res.status(404).set({ "Content-Type": "text/html" }).end(html);
  });
}

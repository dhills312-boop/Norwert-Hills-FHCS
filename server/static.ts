import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { announcements, serviceCatalog } from "@shared/schema";
import { getAnnouncementMeta, injectAnnouncementMeta, injectStaticMeta, injectCanonical } from "./announcement-meta";

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

function getBaseUrl(req: express.Request): string {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'] || '';
  return `${protocol}://${host}`;
}

function stripQuery(url: string): string {
  return url.split('?')[0].split('#')[0];
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

    const announcementMatch = canonicalPath.match(/^\/announcements\/([^/?#]+)/);
    const obituaryMatch = canonicalPath.match(/^\/obituaries\/([^/?#]+)/);
    const memorialMatch = canonicalPath.match(/^\/memorials\/([^/?#]+)/);
    const serviceMatch = canonicalPath.match(/^\/services\/([^/?#]+)/);
    const articleMatch = canonicalPath.match(/^\/resources\/article\/([^/?#]+)/);

    if (announcementMatch || obituaryMatch) {
      const slug = (announcementMatch || obituaryMatch)![1];
      const meta = await resolveAnnouncementMeta(slug);
      if (meta) {
        html = injectAnnouncementMeta(html, meta, baseUrl, canonicalPath);
        return res.status(200).set({ "Content-Type": "text/html" }).end(html);
      }
    }

    if (memorialMatch) {
      const slug = memorialMatch[1];
      const meta = memorialMetaMap[slug];
      if (meta) {
        html = injectAnnouncementMeta(html, meta, baseUrl, canonicalPath);
        return res.status(200).set({ "Content-Type": "text/html" }).end(html);
      }
    }

    if (serviceMatch) {
      const meta = await resolveServiceMeta(serviceMatch[1]);
      if (meta) {
        html = injectStaticMeta(html, meta, canonicalUrl);
        return res.status(200).set({ "Content-Type": "text/html" }).end(html);
      }
    }

    if (articleMatch) {
      const meta = articleMetaMap[articleMatch[1]];
      if (meta) {
        html = injectStaticMeta(html, meta, canonicalUrl);
        return res.status(200).set({ "Content-Type": "text/html" }).end(html);
      }
    }

    const routeMeta = staticRouteMeta[canonicalPath];
    if (routeMeta) {
      html = injectStaticMeta(html, routeMeta, canonicalUrl);
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }

    html = injectCanonical(html, canonicalUrl);
    return res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });
}

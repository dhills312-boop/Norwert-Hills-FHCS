import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { announcements } from "@shared/schema";
import {
  getAnnouncementMeta,
  injectAnnouncementMeta,
  injectStaticMeta,
  injectCanonical,
  injectNoscriptContent,
} from "./announcement-meta";
import { articleContent, serviceContent, memorialContent } from "./static-content";
import {
  ARTICLE_SLUGS,
  MEMORIAL_SLUGS,
  SERVICE_SLUGS,
  LEGACY_ANNOUNCEMENT_SLUGS,
} from "@shared/static-slugs";

const viteLogger = createLogger();

const SITE_NAME = "Norwert Hills Funeral & Cremation Services";

const staticRouteMeta: Record<string, { title: string; description: string }> = {
  '/': { title: `${SITE_NAME} | Louisiana`, description: 'Norwert Hills Funeral & Cremation Services provides compassionate, dignified funeral, memorial, and cremation services across Louisiana.' },
  '/services': { title: `Funeral & Cremation Services | Norwert Hills`, description: 'Explore our full range of funeral, cremation, and memorial services.' },
  '/about': { title: `About Us | ${SITE_NAME}`, description: 'Learn about the Norwert Hills family, our history, and our commitment to serving Louisiana families.' },
  '/contact': { title: `Contact Us | ${SITE_NAME}`, description: 'Reach out to Norwert Hills Funeral & Cremation Services. Available around the clock.' },
  '/resources': { title: `Funeral Planning Resources | Norwert Hills`, description: 'Access helpful guides, FAQs, and articles on funeral planning and grief support.' },
  '/resources/faq': { title: `Frequently Asked Questions | Norwert Hills`, description: 'Answers to common questions about funeral services, cremation, and pre-planning in Louisiana.' },
  '/cremation': { title: `Direct Cremation Services | Norwert Hills`, description: 'Affordable, dignified direct cremation services in Louisiana.' },
  '/pre-planning': { title: `Pre-Plan Your Funeral | ${SITE_NAME}`, description: 'Pre-plan your funeral arrangements with Norwert Hills.' },
};

const serviceMetaMap: Record<string, { title: string; description: string }> = {
  'traditional-ceremony': { title: `Traditional Funeral Ceremony | Norwert Hills`, description: 'A time-honored gathering to pay respects and celebrate a life well-lived.' },
  'cremation-services': { title: `Cremation Services | Norwert Hills`, description: 'Dignified cremation options with or without memorial gatherings.' },
  'bespoke-memorials': { title: `Bespoke Memorial Services | Norwert Hills`, description: "Personalized tributes that uniquely reflect the individual's spirit." },
  'pre-planning': { title: `Pre-Planning Funeral Services | Norwert Hills`, description: "The greatest gift of peace of mind for your family's future." },
};

const memorialMetaMap: Record<string, { title: string; description: string; image: string }> = {
  'jonis-warren': { title: 'In Loving Memory of Jonis Leonardo Warren Jr. | Norwert Hills', description: 'Jonis Leonardo Warren Jr. is remembered with love, gratitude, and deep care by family and friends.', image: '/assets/memorials/jonis-warren.webp' },
  'lelia-henderson': { title: 'In Loving Memory of Lelia Henderson | Norwert Hills', description: 'Lelia Henderson is remembered with tenderness, beauty, and love.', image: '/assets/memorials/lelia-henderson.webp' },
  'deloris-holden': { title: 'In Loving Memory of Deloris Leonard Holden | Norwert Hills', description: 'Mother Deloris Leonard Holden is honored with a life celebration reflecting a legacy of faith, family, and steady love.', image: '/assets/memorials/deloris-holden.webp' },
  'brandon-mckay': { title: 'In Loving Memory of Brandon Chase McKay | Norwert Hills', description: 'Brandon Chase McKay is remembered through family photographs and milestone moments.', image: '/assets/memorials/brandon-mckay.webp' },
  'richard-gross': { title: 'In Loving Memory of Rev. Dr. Richie L. Gross | Norwert Hills', description: 'Reverend Doctor Richie L. Gross is celebrated under the banner of faith, family, and favor.', image: '/assets/memorials/richard-gross.webp' },
  'keiaris-tilman': { title: "In Loving Memory of Ke'Aris Alexandria Tillman | Norwert Hills", description: "Ke'Aris Alexandria Tillman is remembered with tenderness as a beloved little angel.", image: '/assets/memorials/keiaris-tilman.webp' },
  'troyshaun-martin': { title: "In Loving Memory of Troy'Shaun Ja'Rae Martin | Norwert Hills", description: "Troy'Shaun Ja'Rae Martin is remembered with a bright, heroic spirit.", image: '/assets/memorials/troyshaun-martin.webp' },
  'steven-dillon': { title: 'In Loving Memory of Steven Douglas Dillon | Norwert Hills', description: 'Steven Douglas Dillon is remembered with dignity, quiet strength, and the patient heart of a fisherman.', image: '/assets/memorials/steven-dillon.webp' },
};

const articleMetaMap: Record<string, { title: string; description: string }> = {
  'understanding-cremation': { title: `Understanding Cremation: A Guide for Families | Norwert Hills`, description: 'Learn about the cremation process to help make informed decisions for your loved one.' },
  'bespoke-memorials': { title: `The Art of the Bespoke Memorial | Norwert Hills`, description: "Learn how a personalized tribute can honor your loved one's unique spirit." },
  'planning-ahead': { title: `Planning Ahead: The Gift of Peace | Norwert Hills`, description: 'Planning ahead is an act of care. It allows individuals to express their wishes clearly.' },
};

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripQuery(url: string): string {
  return url.split('?')[0].split('#')[0];
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

function buildArticleNoscript(slug: string): string | null {
  const article = articleContent[slug];
  if (!article) return null;
  const paras = article.paragraphs.map(p => `    <p>${esc(p)}</p>`).join('\n');
  return `    <h1>${esc(article.title)}</h1>\n    <p><em>${esc(article.category)}</em></p>\n${paras}`;
}

function buildServiceNoscript(slug: string): string | null {
  const svc = serviceContent[slug];
  if (!svc) return null;
  return `    <h1>${esc(svc.title)}</h1>\n    <p>${esc(svc.description)}</p>\n    <p>${esc(svc.longDescription)}</p>`;
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
  return `    <h1>In Loving Memory of ${esc(name)}</h1>\n    <p>${esc(brief)}</p>\n    <p>A memorial page by Norwert Hills Funeral &amp; Cremation Services.</p>`;
}

function buildObituaryNoscript(name: string, fullObit: string, briefObit: string): string {
  const body = fullObit || briefObit;
  return `    <h1>Obituary: ${esc(name)}</h1>\n    <p>${esc(body)}</p>\n    <p>Norwert Hills Funeral &amp; Cremation Services — Hammond, Louisiana.</p>`;
}

async function resolveAnnouncementRow(slug: string) {
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

async function resolveAnnouncementMeta(slug: string): Promise<{ title: string; description: string; image: string } | null> {
  const hardcoded = getAnnouncementMeta(slug);
  if (hardcoded) return hardcoded;
  const row = await resolveAnnouncementRow(slug);
  if (!row || !row.isPublished) return null;
  const fullName = `${row.deceasedFirstName} ${row.deceasedLastName}`;
  return {
    title: `In Loving Memory of ${fullName}`,
    description: row.briefObituary ? row.briefObituary.slice(0, 160).trim() : `A memorial page honoring the life of ${fullName}.`,
    image: '/opengraph.jpg',
  };
}

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      const canonicalPath = stripQuery(url);
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['host'] || '';
      const baseUrl = `${protocol}://${host}`;
      const canonicalUrl = `${baseUrl}${canonicalPath}`;

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
          const page = await vite.transformIndexHtml(url, template);
          return res.status(404).set({ "Content-Type": "text/html" }).end(page);
        }
        if (meta) {
          template = injectAnnouncementMeta(template, meta, baseUrl, canonicalPath);
          const row = await resolveAnnouncementRow(slug);
          const brief = row?.briefObituary || meta.description;
          const noscript = buildAnnouncementNoscript(meta.title.replace(' | Norwert Hills', ''), brief);
          template = injectNoscriptContent(template, noscript);
        }
        const page = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      if (obituaryMatch) {
        const slug = obituaryMatch[1];
        const isLegacy = (LEGACY_ANNOUNCEMENT_SLUGS as readonly string[]).includes(slug);
        const meta = await resolveAnnouncementMeta(slug);
        if (!meta && !isLegacy) {
          const page = await vite.transformIndexHtml(url, template);
          return res.status(404).set({ "Content-Type": "text/html" }).end(page);
        }
        if (meta) {
          template = injectAnnouncementMeta(template, meta, baseUrl, canonicalPath);
          const row = await resolveAnnouncementRow(slug);
          const name = meta.title.replace('In Loving Memory of ', '').replace(' | Norwert Hills', '');
          const noscript = buildObituaryNoscript(name, row?.fullObituary || '', row?.briefObituary || meta.description);
          template = injectNoscriptContent(template, noscript);
        }
        const page = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      if (memorialMatch) {
        const slug = memorialMatch[1];
        const meta = memorialMetaMap[slug];
        if (!meta) {
          const page = await vite.transformIndexHtml(url, template);
          return res.status(404).set({ "Content-Type": "text/html" }).end(page);
        }
        template = injectAnnouncementMeta(template, meta, baseUrl, canonicalPath);
        const noscript = buildMemorialNoscript(slug);
        if (noscript) template = injectNoscriptContent(template, noscript);
        const page = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      if (serviceMatch) {
        const id = serviceMatch[1];
        const isStaticSlug = (SERVICE_SLUGS as readonly string[]).includes(id);
        const meta = serviceMetaMap[id];
        if (!meta && !isStaticSlug) {
          const page = await vite.transformIndexHtml(url, template);
          return res.status(404).set({ "Content-Type": "text/html" }).end(page);
        }
        if (meta) {
          template = injectStaticMeta(template, meta, canonicalUrl);
          const noscript = buildServiceNoscript(id);
          if (noscript) template = injectNoscriptContent(template, noscript);
        }
        const page = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      if (articleMatch) {
        const id = articleMatch[1];
        const meta = articleMetaMap[id];
        if (!meta) {
          const page = await vite.transformIndexHtml(url, template);
          return res.status(404).set({ "Content-Type": "text/html" }).end(page);
        }
        template = injectStaticMeta(template, meta, canonicalUrl);
        const noscript = buildArticleNoscript(id);
        if (noscript) template = injectNoscriptContent(template, noscript);
        const page = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      const routeMeta = staticRouteMeta[canonicalPath];
      if (routeMeta) {
        template = injectStaticMeta(template, routeMeta, canonicalUrl);
        const page = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      if (isStaffOrInternalPath(canonicalPath)) {
        template = injectCanonical(template, canonicalUrl);
        const page = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      if (isKnownSlugPath(canonicalPath) || isKnownStaticPath(canonicalPath)) {
        template = injectCanonical(template, canonicalUrl);
        const page = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      const page = await vite.transformIndexHtml(url, template);
      return res.status(404).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

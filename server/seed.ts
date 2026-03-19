import { db } from "./db";
import { users, formTemplates, serviceCatalog, arrangements } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

const DESIRED_FORM_TEMPLATES = [
  {
    name: "Vital Statistics",
    type: "jotform",
    category: "intake",
    jotformId: "PLACEHOLDER_VITAL_STATS",
    jotformUrl: "https://jotform.com/260296940913058",
    pdfPath: "attached_assets/NHFCS_Vital_Statiscs_1773391441854.pdf",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: ["all"],
    sortOrder: 1,
  },
  {
    name: "SSN Request for Death Certificate",
    type: "jotform",
    category: "intake",
    jotformId: "PLACEHOLDER_SSN_REQUEST",
    jotformUrl: "https://jotform.com/260738127596063",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: ["all"],
    sortOrder: 2,
  },
  {
    name: "Funeral Service Details Agreement",
    type: "jotform",
    category: "intake",
    jotformId: "PLACEHOLDER_SERVICE_DETAILS",
    jotformUrl: "https://jotform.com/260757903739065",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: ["all"],
    sortOrder: 3,
  },
  {
    name: "Preplanning / Intake",
    type: "jotform",
    category: "intake",
    jotformId: "PLACEHOLDER_PREPLANNING",
    jotformUrl: "https://jotform.com/260738501676058",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: ["all"],
    sortOrder: 4,
  },
  {
    name: "Cremation Online Intake",
    type: "jotform",
    category: "public",
    jotformId: "PLACEHOLDER_CREMATION_ONLINE",
    jotformUrl: "https://jotform.com/260738596070060",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: [] as string[],
    sortOrder: 10,
  },
  {
    name: "Consultation Intake",
    type: "jotform",
    category: "public",
    jotformId: "260738501676058",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: [] as string[],
    sortOrder: 11,
  },
  {
    name: "Cremation Authorization",
    type: "pandadoc",
    category: "authorization",
    pandadocTemplateId: "sTpBTbHX3v3C47aihCyesf",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: ["cremation"],
    sortOrder: 20,
  },
  {
    name: "Authorization to Embalm",
    type: "pandadoc",
    category: "authorization",
    pdfPath: "attached_assets/NHFCS_Authorization_to_Embalm.docx1_1773391441853.pdf",
    pandadocTemplateId: "zNKUjjBmfEfCFbDUBe56FW",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: ["burial", "viewing"],
    sortOrder: 22,
  },
  {
    name: "Terms & Conditions",
    type: "pandadoc",
    category: "authorization",
    pandadocTemplateId: "guQcBFprJbhi5m5UA9fHom",
    pandadocRecipientRole: "Authorizing Agent",
    requiredForServiceTypes: ["all"],
    sortOrder: 30,
  },
];

async function seedFormTemplates() {
  const existing = await db.select().from(formTemplates);
  const existingNames = new Set(existing.map((t) => t.name));

  const toInsert = DESIRED_FORM_TEMPLATES.filter((t) => !existingNames.has(t.name));

  if (toInsert.length === 0) {
    return;
  }

  await db.insert(formTemplates).values(toInsert);
  console.log(`Form templates seeded: ${toInsert.map((t) => t.name).join(", ")}`);
}

async function seedServiceCatalog() {
  const existing = await db.select().from(serviceCatalog);
  if (existing.length > 0) return;

  const traditionalId = "pkg-traditional";
  const cremationMemorialId = "pkg-cremation-memorial";
  const directCremationId = "pkg-direct-cremation";
  const memorialServiceId = "pkg-memorial-service";
  const gravesideId = "pkg-graveside";

  await db.insert(serviceCatalog).values([
    { id: traditionalId, itemType: "package", name: "Traditional Funeral", description: "Full visitation, funeral ceremony, and burial with professional staff coordination. Includes embalming, facility use, hearse, and transfer.", category: "burial", defaultPrice: "8500.00", displayOrder: 1 },
    { id: cremationMemorialId, itemType: "package", name: "Cremation with Memorial Service", description: "Cremation followed by a memorial gathering with urn present. Includes basic preparation, facility use, and memorial coordination.", category: "cremation", defaultPrice: "5200.00", displayOrder: 2 },
    { id: directCremationId, itemType: "package", name: "Direct Cremation", description: "Simple, dignified cremation without ceremony. Includes transfer, basic container, and cremation process.", category: "direct-cremation", defaultPrice: "2800.00", displayOrder: 3 },
    { id: memorialServiceId, itemType: "package", name: "Memorial Service", description: "Ceremony without the body present. Includes facility use, staff coordination, and memorial arrangements.", category: "memorial", defaultPrice: "4000.00", displayOrder: 4 },
    { id: gravesideId, itemType: "package", name: "Graveside Service", description: "Ceremony held at the burial site. Includes professional staff, graveside setup, and hearse.", category: "burial", defaultPrice: "3500.00", displayOrder: 5 },

    { itemType: "service", name: "Basic Professional Services", description: "Services of funeral director and staff for arrangement conference, coordination, and oversight.", category: "professional", defaultPrice: "3200.00", displayOrder: 10, includedIn: [traditionalId, cremationMemorialId, directCremationId, memorialServiceId, gravesideId] },
    { itemType: "service", name: "Embalming", description: "Arterial and cavity embalming for preservation and viewing.", category: "preparation", defaultPrice: "950.00", displayOrder: 11, includedIn: [traditionalId] },
    { itemType: "service", name: "Other Preparation of the Body", description: "Washing, dressing, cosmetology, and casketing.", category: "preparation", defaultPrice: "400.00", displayOrder: 12, includedIn: [traditionalId, cremationMemorialId] },
    { itemType: "service", name: "Transfer of Remains", description: "Transportation of the deceased to the funeral home within 50-mile radius.", category: "transportation", defaultPrice: "500.00", displayOrder: 13, includedIn: [traditionalId, cremationMemorialId, directCremationId, gravesideId] },
    { itemType: "service", name: "Use of Facilities for Viewing", description: "Use of chapel and staff for visitation or wake.", category: "facility", defaultPrice: "650.00", displayOrder: 14, includedIn: [traditionalId] },
    { itemType: "service", name: "Use of Facilities for Ceremony", description: "Use of chapel and staff for funeral or memorial ceremony.", category: "facility", defaultPrice: "850.00", displayOrder: 15, includedIn: [traditionalId, cremationMemorialId, memorialServiceId] },
    { itemType: "service", name: "Hearse", description: "Motor hearse for transportation to place of committal.", category: "transportation", defaultPrice: "450.00", displayOrder: 16, includedIn: [traditionalId, gravesideId] },
    { itemType: "service", name: "Cremation Fee", description: "Crematory fee for cremation process.", category: "cremation", defaultPrice: "350.00", displayOrder: 17, includedIn: [cremationMemorialId, directCremationId] },
    { itemType: "service", name: "Graveside Setup & Coordination", description: "Professional graveside service setup including tent, chairs, and staff.", category: "facility", defaultPrice: "400.00", displayOrder: 18, includedIn: [gravesideId] },

    { itemType: "merchandise", name: "Solid Mahogany Casket", description: "Hand-crafted solid mahogany with velvet interior and polished brass hardware.", category: "casket", defaultPrice: "6500.00", displayOrder: 20 },
    { itemType: "merchandise", name: "Classic Oak Casket", description: "Durable oak finish with crepe interior and antique bronze hardware.", category: "casket", defaultPrice: "4500.00", displayOrder: 21 },
    { itemType: "merchandise", name: "Brushed Steel Casket", description: "18-gauge steel with gasket protection and velvet interior.", category: "casket", defaultPrice: "3200.00", displayOrder: 22 },
    { itemType: "merchandise", name: "Poplar Veneer Casket", description: "Affordable wood veneer with cloth interior.", category: "casket", defaultPrice: "1800.00", displayOrder: 23 },
    { itemType: "merchandise", name: "Bronze Companion Urn", description: "Elegant bronze urn with brushed finish, holds full cremated remains.", category: "urn", defaultPrice: "2500.00", displayOrder: 24 },
    { itemType: "merchandise", name: "Marble Memorial Urn", description: "Natural marble urn with carved design.", category: "urn", defaultPrice: "1200.00", displayOrder: 25 },
    { itemType: "merchandise", name: "Classic Ceramic Urn", description: "Handcrafted ceramic urn in various colors.", category: "urn", defaultPrice: "600.00", displayOrder: 26 },
    { itemType: "merchandise", name: "Simple Container (Cremation)", description: "Alternative container for direct cremation.", category: "urn", defaultPrice: "200.00", displayOrder: 27 },

    { itemType: "merchandise", name: "Red Rose Casket Spray", description: "Classic arrangement of deep red roses for casket display.", category: "floral", defaultPrice: "450.00", displayOrder: 30 },
    { itemType: "merchandise", name: "White Lily Standing Wreath", description: "Elegant standing wreath of white lilies.", category: "floral", defaultPrice: "350.00", displayOrder: 31 },
    { itemType: "merchandise", name: "Seasonal Mixed Spray", description: "Vibrant mix of seasonal blooms.", category: "floral", defaultPrice: "400.00", displayOrder: 32 },
    { itemType: "merchandise", name: "Peace Lily Plant", description: "Living tribute plant for the home.", category: "floral", defaultPrice: "150.00", displayOrder: 33 },
    { itemType: "merchandise", name: "Premium Rose & Orchid Arrangement", description: "Luxury standing arrangement with roses and orchids.", category: "floral", defaultPrice: "600.00", displayOrder: 34 },

    { itemType: "add-on", name: "Limousine Service", description: "Family limousine for processional (3 hours).", category: "transportation", defaultPrice: "350.00", displayOrder: 40 },
    { itemType: "add-on", name: "Flower Car", description: "Vehicle for transporting floral arrangements.", category: "transportation", defaultPrice: "250.00", displayOrder: 41 },
    { itemType: "add-on", name: "Additional Viewing Hours", description: "Extended viewing time (per hour).", category: "facility", defaultPrice: "200.00", displayOrder: 42, pricingUnit: "per_hour" },
    { itemType: "add-on", name: "Video Tribute", description: "Custom video memorial with photos and music.", category: "memorial", defaultPrice: "350.00", displayOrder: 43 },
    { itemType: "add-on", name: "Memorial Stationery Package", description: "Programs, acknowledgment cards, and memorial folders.", category: "stationery", defaultPrice: "250.00", displayOrder: 44 },
    { itemType: "add-on", name: "Guest Register Book", description: "Leather-bound guest registry with memorial pages.", category: "stationery", defaultPrice: "150.00", displayOrder: 45 },
    { itemType: "add-on", name: "Prayer Cards (set of 100)", description: "Personalized laminated prayer cards.", category: "stationery", defaultPrice: "175.00", displayOrder: 46, pricingUnit: "each" },
    { itemType: "add-on", name: "Memorial Candles (set of 12)", description: "Personalized memorial candles for family and friends.", category: "memorial", defaultPrice: "200.00", displayOrder: 47, pricingUnit: "each" },
    { itemType: "add-on", name: "Dove Release", description: "Symbolic white dove release at graveside or ceremony.", category: "memorial", defaultPrice: "300.00", displayOrder: 48 },
    { itemType: "add-on", name: "Live Music / Soloist", description: "Professional musician or vocalist for service.", category: "memorial", defaultPrice: "500.00", displayOrder: 49 },

    { itemType: "cash-advance", name: "Certified Death Certificates (5)", description: "State-issued certified copies of death certificate.", category: "government", defaultPrice: "125.00", displayOrder: 50 },
    { itemType: "cash-advance", name: "Additional Death Certificates (each)", description: "Additional certified copies beyond initial 5.", category: "government", defaultPrice: "25.00", displayOrder: 51, pricingUnit: "each" },
    { itemType: "cash-advance", name: "Clergy / Officiant Honorarium", description: "Honorarium for religious leader or officiant.", category: "professional", defaultPrice: "300.00", displayOrder: 52 },
    { itemType: "cash-advance", name: "Cemetery / Interment Fees", description: "Opening and closing of grave, liner, and cemetery charges.", category: "cemetery", defaultPrice: "1500.00", displayOrder: 53 },
    { itemType: "cash-advance", name: "Newspaper Obituary Notice", description: "Obituary placement in local newspaper.", category: "notices", defaultPrice: "450.00", displayOrder: 54 },
    { itemType: "cash-advance", name: "Online Obituary & Guestbook", description: "Digital obituary with online memorial guestbook.", category: "notices", defaultPrice: "100.00", displayOrder: 55 },
    { itemType: "cash-advance", name: "Vault / Grave Liner", description: "Concrete grave liner or burial vault.", category: "cemetery", defaultPrice: "1200.00", displayOrder: 56 },
  ]);

  console.log("Service catalog seeded.");
}

async function seedExampleArrangements() {
  const existing = await db.select().from(arrangements);
  if (existing.length > 0) return;

  await db.insert(arrangements).values([
    {
      familyName: "The Fontenot Family",
      email: "michael.fontenot@outlook.com",
      phone: "985-839-3301",
      status: "Completed",
      nextStep: "Selections Confirmed",
      caseToken: "NHFNT2026",
      deceasedName: "Annette P. Fontenot",
      authorizingAgentName: "Michael T. Fontenot",
      authorizingAgentPhone: "985-839-3301",
      selections: {
        packageId: "pkg-memorial-service",
        "service-type": "memorial",
        merchandiseIds: [],
        floralIds: [],
        addOnIds: [],
        cashAdvanceIds: [],
      },
    },
    {
      familyName: "The Comeaux Family",
      email: "denise.comeaux@yahoo.com",
      phone: "985-661-4872",
      status: "Pending Signature",
      nextStep: "Selections Confirmed",
      caseToken: "NHCMX2026",
      deceasedName: "Louis R. Comeaux",
      authorizingAgentName: "Denise M. Comeaux",
      authorizingAgentPhone: "985-661-4872",
      selections: {
        packageId: "pkg-direct-cremation",
        "service-type": "cremation",
        merchandiseIds: [],
        floralIds: [],
        addOnIds: [],
        cashAdvanceIds: [],
      },
    },
    {
      familyName: "The Thibodaux Family",
      email: "robert.thibodaux@gmail.com",
      phone: "985-748-2241",
      status: "In Progress",
      nextStep: "Forms",
      caseToken: "NHTBDX2026",
      deceasedName: "Margaret A. Thibodaux",
      authorizingAgentName: "Robert J. Thibodaux",
      authorizingAgentPhone: "985-748-2241",
      selections: {
        packageId: "pkg-traditional",
        "service-type": "burial",
        merchandiseIds: [],
        floralIds: [],
        addOnIds: [],
        cashAdvanceIds: [],
      },
    },
  ]);

  console.log("Example arrangements seeded.");
}

export async function seedDatabase() {
  try {
    await seedFormTemplates();
    await seedServiceCatalog();
    await seedExampleArrangements();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Director";

    if (!adminEmail || !adminPassword) {
      console.log("No ADMIN_EMAIL/ADMIN_PASSWORD set. Skipping bootstrap.");
      return;
    }

    const normalizedEmail = adminEmail.toLowerCase().trim();
    const allUsers = await db.select().from(users);

    if (allUsers.length === 0) {
      const hashed = await hashPassword(adminPassword);
      await db.insert(users).values({
        name: adminName,
        email: normalizedEmail,
        password: hashed,
        role: "director",
        isActive: true,
      });
      console.log(`Bootstrap director created: ${normalizedEmail}`);
      return;
    }

    const existingAdmin = allUsers.find((u) => u.email === normalizedEmail);
    if (!existingAdmin) {
      const directors = allUsers.filter((u) => u.role === "director");
      if (directors.length > 0) {
        const oldDirector = directors[0];
        const hashed = await hashPassword(adminPassword);
        await db
          .update(users)
          .set({
            email: normalizedEmail,
            name: adminName,
            password: hashed,
          })
          .where(eq(users.id, oldDirector.id));
        console.log(`Director updated: ${oldDirector.email} → ${normalizedEmail}`);
      } else {
        const hashed = await hashPassword(adminPassword);
        await db.insert(users).values({
          name: adminName,
          email: normalizedEmail,
          password: hashed,
          role: "director",
          isActive: true,
        });
        console.log(`New director created: ${normalizedEmail}`);
      }
    } else {
      const hashed = await hashPassword(adminPassword);
      await db
        .update(users)
        .set({
          name: adminName,
          password: hashed,
        })
        .where(eq(users.id, existingAdmin.id));
      console.log(`Director password/name synced: ${normalizedEmail}`);
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}

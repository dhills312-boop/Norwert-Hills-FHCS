import { MEMORIAL_SLUGS } from "@shared/static-slugs";

export type Memorial = {
  slug: typeof MEMORIAL_SLUGS[number];
  name: string;
  honorific?: string;
  lifeDates?: string;
  serviceDate?: string;
  viewing?: string;
  serviceTime?: string;
  venue?: string;
  address?: string;
  officiant?: string;
  image: string;
  socialImage?: string;
  imagePosition?: string;
  accent?: "gold" | "rose" | "violet" | "blue";
  obituary: string;
  scripture?: string;
  youtubeUrl?: string;
  youtubeEmbedUrl?: string;
  facebookPostUrl?: string;
  guestbookEnabled?: boolean;
  flowersUrl?: string;
  giftsUrl?: string;
  sourceNote: string;
};

export const memorials: Memorial[] = [
  {
    slug: "jonis-warren",
    name: "Jonis Leonardo Warren Jr.",
    lifeDates: "November 7, 2007 - June 6, 2026",
    serviceDate: "June 18, 2026",
    venue: "Greater Starlight Baptist Church",
    address: "Covington, LA",
    officiant: "Rev. Mallery Callahan II, Presiding",
    image: "/assets/memorials/jonis-warren.webp",
    imagePosition: "center 42%",
    accent: "gold",
    obituary:
      "Jonis Leonardo Warren Jr. is remembered with love, gratitude, and deep care by family and friends. Norwert Hills Funeral and Cremation Services is honored to help share his memorial tribute and full service for those who wish to remember and celebrate his life.",
    scripture: "Those we love remain with us, carried in memory and in love.",
    youtubeUrl: "https://www.youtube.com/live/6Vtndc7Ll2c?si=cx16Q84sSB-jYPOa",
    youtubeEmbedUrl: "https://www.youtube.com/embed/6Vtndc7Ll2c",
    facebookPostUrl: "https://www.facebook.com/61590433896394/posts/122116307529347796/",
    guestbookEnabled: true,
    sourceNote: "Service details supplied by Norwert Hills staff. Full service stream confirmed through YouTube.",
  },
  {
    slug: "lelia-henderson",
    name: "Lelia Henderson",
    serviceDate: "February 28, 2026",
    serviceTime: "10:00 AM",
    venue: "First True Love World Outreach",
    address: "41239 S Range Rd., Ponchatoula, LA 70454",
    image: "/assets/memorials/lelia-henderson.webp",
    imagePosition: "center 34%",
    accent: "violet",
    obituary:
      "Lelia Henderson is remembered with tenderness, beauty, and love. Her homegoing celebration invites family and friends to gather in gratitude for the life she lived and the memories she leaves in the care of those who loved her.",
    scripture: "Blessed are they that mourn: for they shall be comforted.",
    sourceNote: "Service details transcribed from the supplied announcement flyer.",
  },
  {
    slug: "deloris-holden",
    name: "Deloris Leonard Holden",
    honorific: "Mother",
    serviceDate: "Saturday, May 2, 2026",
    viewing: "2:00 PM",
    serviceTime: "3:00 PM",
    venue: "Greater Community COGIC",
    address: "61489 Bennett Rd., Amite, LA 70456",
    officiant: "Pastor David Franklin, Officiating",
    image: "/assets/memorials/deloris-holden.webp",
    imagePosition: "center center",
    accent: "rose",
    obituary:
      "Mother Deloris Leonard Holden is honored by the Holden family with a life celebration. Her memorial presence is graceful and warm, reflecting a legacy of faith, family, and steady love.",
    scripture: "Well done, good and faithful servant.",
    sourceNote: "Service details transcribed from the supplied announcement flyer.",
  },
  {
    slug: "brandon-mckay",
    name: "Brandon Chase McKay",
    image: "/assets/memorials/brandon-mckay.webp",
    socialImage: "/assets/memorials/brandon-mckay-cutout.webp",
    imagePosition: "center center",
    accent: "gold",
    obituary:
      "Brandon Chase McKay is remembered through family photographs, milestone moments, and the faces of those who held him close. His memorial page is prepared for review while final service details are gathered.",
    scripture: "Those we love remain with us, carried in memory and in love.",
    sourceNote: "Name and portrait frame pulled from the supplied memorial video. Service details still needed.",
  },
  {
    slug: "richard-gross",
    name: "Reverend Doctor Richie L. Gross",
    lifeDates: "September 20, 1953 - April 25, 2026",
    serviceDate: "May 8-9, 2026",
    viewing: "May 8, 4:00-6:00 PM; May 9, 10:00-11:00 AM",
    serviceTime: "Musical May 8 at 7:00 PM; Life Celebration May 9 at 11:00 AM",
    venue: "Greater Rosevalley Missionary Baptist Church",
    address: "12463 Roseland Ave., Roseland, LA 70456",
    image: "/assets/memorials/richard-gross.webp",
    socialImage: "/assets/memorials/richard-gross-cutout.webp",
    imagePosition: "center center",
    accent: "gold",
    obituary:
      "Reverend Doctor Richie L. Gross is celebrated under the banner of faith, family, and favor. His memorial reflects a life of spiritual leadership and the enduring blessing of family love.",
    scripture: "Faith, family, and favor.",
    sourceNote: "Life dates and memorial theme transcribed from the supplied video title card. Service details transcribed from the supplied Facebook flyer.",
  },
  {
    slug: "keiaris-tilman",
    name: "Ke'Aris Alexandria Tillman",
    serviceDate: "April 18, 2026",
    viewing: "11:00 AM",
    serviceTime: "12:00 PM",
    venue: "Faith Temple Church",
    address: "11605 Fontana Lane, Independence, LA 70443",
    image: "/assets/memorials/keiaris-tilman.webp",
    socialImage: "/assets/logo-crest.png",
    imagePosition: "center center",
    accent: "gold",
    obituary:
      "Ke'Aris Alexandria Tillman is remembered with tenderness as a beloved little angel. Family and friends are invited to gather in love, prayer, and remembrance for her funeral service.",
    scripture: "Of such is the kingdom of heaven.",
    sourceNote: "Service details transcribed from the supplied Facebook flyer. Life dates were not shown on the supplied flyer.",
  },
  {
    slug: "troyshaun-martin",
    name: "Troy'Shaun Ja'Rae Martin",
    lifeDates: "September 12, 2018 - February 16, 2026",
    serviceDate: "Friday, February 27, 2026",
    image: "/assets/memorials/troyshaun-martin.webp",
    imagePosition: "center 60%",
    accent: "blue",
    obituary:
      "Troy'Shaun Ja'Rae Martin is remembered with a bright, heroic spirit. His celebration carries the colors, wonder, and courage that reflect a beloved child whose joy remains vivid.",
    scripture: "Let the little children come unto me.",
    sourceNote: "Life dates and service date transcribed from the supplied announcement image.",
  },
  {
    slug: "steven-dillon",
    name: "Steven Douglas Dillon",
    lifeDates: "May 11, 1958 - May 25, 2026",
    serviceDate: "Saturday, May 30, 2026",
    serviceTime: "11:00 AM",
    venue: "Greater Mt. Bethel Missionary Baptist Church",
    address: "46375 Durbin Rd Ext, Tickfaw, LA 70466",
    officiant: "Pastor Andrew L. Jackson, Officiating",
    image: "/assets/memorials/steven-dillon.webp",
    socialImage: "/assets/memorials/steven-dillon-cutout.webp",
    imagePosition: "center 28%",
    accent: "gold",
    obituary:
      "Steven Douglas Dillon is remembered with dignity, quiet strength, and the patient heart of a fisherman. Family and friends are invited to gather in love and remembrance for his homegoing service.",
    scripture: "May light perpetual shine upon him.",
    sourceNote: "Service details supplied by Norwert Hills staff.",
  },
];

export function getMemorial(slug?: string) {
  return memorials.find((memorial) => memorial.slug === slug);
}

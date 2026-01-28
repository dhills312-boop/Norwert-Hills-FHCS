
import { type LucideIcon, Heart, Users, Calendar, FileText, Check, Phone, Mail, MapPin } from "lucide-react";

export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  longDescription?: string;
}

export const services: Service[] = [
  {
    id: "traditional-ceremony",
    title: "Traditional Ceremony",
    description: "A time-honored gathering to pay respects and celebrate a life well-lived.",
    image: "/assets/ceremonial-detail.png",
    longDescription: "Our traditional ceremonies are crafted with the utmost dignity and respect, adhering to the customs that have comforted families for generations. We provide a serene environment where friends and family can gather to honor the memory of your loved one. From the visitation to the final committal, our dedicated staff ensures every detail is handled with grace."
  },
  {
    id: "cremation-services",
    title: "Cremation Services",
    description: "Dignified cremation options with or without memorial gatherings.",
    image: "/assets/texture-marble.png",
    longDescription: "We offer a range of dignified cremation services, allowing you to choose the level of ceremony that best fits your needs. Whether you prefer a simple private farewell or a full memorial service with the urn present, we ensure the process is handled with the highest standards of care and respect."
  },
  {
    id: "bespoke-memorials",
    title: "Bespoke Memorials",
    description: "Personalized tributes that uniquely reflect the individual's spirit.",
    image: "/assets/hero-chapel.png",
    longDescription: "Every life is unique, and we believe every farewell should be too. Our bespoke memorials are designed to reflect the personality, passions, and spirit of your loved one. From unique floral arrangements to personalized music and video tributes, we work closely with you to create a meaningful and memorable experience."
  },
  {
    id: "pre-planning",
    title: "Pre-Planning",
    description: "The greatest gift of peace of mind for your family's future.",
    image: "/assets/staff-interaction.png",
    longDescription: "Planning ahead is a thoughtful way to protect your family from emotional and financial burdens during a difficult time. Our pre-planning specialists guide you through every decision, ensuring your wishes are recorded and your legacy is preserved exactly as you envision."
  }
];

export const activeSessions = [
  { id: 1, familyName: "The Anderson Family", status: "In Progress", nextStep: "Casket Selection", time: "10:00 AM", email: "contact@anderson.com", phone: "555-123-4567" },
  { id: 2, familyName: "The Williams Family", status: "Pending Signature", nextStep: "Final Review", time: "1:30 PM", email: "sarah@williams.com", phone: "555-987-6543" },
  { id: 3, familyName: "The Davis Family", status: "Completed", nextStep: "Service Scheduling", time: "3:45 PM", email: "mike@davis.com", phone: "555-456-7890" }
];

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface BuilderStep {
  id: string;
  title: string;
  whyCopy: string;
  previewImage: string;
  previewCaption: string;
  options: PackageOption[];
}

export const builderSteps: BuilderStep[] = [
  {
    id: "service-type",
    title: "Select Service Type",
    whyCopy: "This foundational choice sets the tone for how we will honor your loved one's memory.",
    previewImage: "/assets/hero-chapel.png",
    previewCaption: "A dignified beginning to a meaningful farewell.",
    options: [
      { id: "traditional", name: "Traditional Service", description: "Full visitation and funeral service.", price: 5000, image: "/assets/hero-chapel.png" },
      { id: "memorial", name: "Memorial Service", description: "Gathering without the body present.", price: 3500, image: "/assets/ceremonial-detail.png" },
      { id: "graveside", name: "Graveside Service", description: "Ceremony held at the burial site.", price: 2500, image: "/assets/staff-interaction.png" },
    ]
  },
  {
    id: "casket",
    title: "Choose a Casket",
    whyCopy: "This choice reflects both tradition and personal preference. We’ll guide you through options at your pace.",
    previewImage: "/assets/texture-marble.png",
    previewCaption: "Craftsmanship that honors a lifetime.",
    options: [
      { id: "mahogany", name: "Solid Mahogany", description: "Hand-crafted solid wood with velvet interior.", price: 4500, image: "/assets/texture-marble.png" }, 
      { id: "oak", name: "Classic Oak", description: "Durable oak finish with crepe interior.", price: 3200, image: "/assets/texture-marble.png" },
      { id: "metal", name: "Brushed Steel", description: "18-gauge steel with gasket protection.", price: 2800, image: "/assets/texture-marble.png" },
    ]
  },
  {
    id: "flowers",
    title: "Floral Arrangements",
    whyCopy: "Floral tributes add warmth, color, and symbolic meaning to the service.",
    previewImage: "/assets/ceremonial-detail.png",
    previewCaption: "Nature's beauty as a final tribute.",
    options: [
      { id: "spray-red", name: "Red Rose Casket Spray", description: "Classic arrangement of deep red roses.", price: 450, image: "/assets/ceremonial-detail.png" },
      { id: "wreath-white", name: "White Lily Wreath", description: "Elegant standing wreath of white lilies.", price: 350, image: "/assets/ceremonial-detail.png" },
      { id: "spray-seasonal", name: "Seasonal Mixed Spray", description: "Vibrant mix of seasonal blooms.", price: 400, image: "/assets/ceremonial-detail.png" },
    ]
  }
];

import fs from "fs";
import path from "path";

const zipCoordsPath = path.resolve(import.meta.dirname || __dirname, "zip-coordinates.json");
const zipCoords: Record<string, { lat: number; lon: number }> = JSON.parse(
  fs.readFileSync(zipCoordsPath, "utf-8")
);

const CHAPEL_LAT = 30.5044;
const CHAPEL_LON = -90.4612;
const SERVICE_RADIUS_MILES = 60;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ServiceAreaResult {
  inServiceArea: boolean;
  distanceMiles: number;
}

export function checkServiceArea(zip: string): ServiceAreaResult | null {
  const normalized = zip.trim().replace(/[^0-9]/g, "").slice(0, 5);
  const coords = zipCoords[normalized];
  if (!coords) {
    return null;
  }
  const distanceMiles = haversineDistance(CHAPEL_LAT, CHAPEL_LON, coords.lat, coords.lon);
  return {
    inServiceArea: distanceMiles <= SERVICE_RADIUS_MILES,
    distanceMiles: Math.round(distanceMiles * 10) / 10,
  };
}

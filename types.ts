
export type CelestialType = 'star' | 'planet' | 'galaxy' | 'gas' | 'ice' | 'rocky';

export interface CelestialBody {
  id: string;
  name: string; // English for APIs
  displayName: string; // Turkish for UI
  type: CelestialType;
  description: string; // Short initial description
  color: string;
  radius: number; // Visual size
  distance: number; // Distance from center
  orbitSpeed: number;
  rotationSpeed: number;
  hasRings?: boolean;
  texture?: string; // Placeholder for future use
  surfaceColor?: string;
  atmosphereColor?: string;
}

export type PlanetData = CelestialBody;

export interface NasaImage {
  title: string;
  url: string;
  date: string;
  description: string;
}

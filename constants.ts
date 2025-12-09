
import { CelestialBody } from './types';

export const CELESTIAL_DATA: CelestialBody[] = [
  // --- STAR (SUN) ---
  {
    id: 'sun',
    name: 'Sun',
    displayName: 'Güneş',
    type: 'star',
    description: 'Sistemimizin kalbi, yaşamın kaynağı olan sarı cüce yıldız.',
    color: '#FFD700', // Gold
    radius: 12,
    distance: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.005
  },
  // --- PLANETS ---
  {
    id: 'mercury',
    name: 'Mercury',
    displayName: 'Merkür',
    type: 'planet',
    description: 'Güneş\'e en yakın ve en küçük gezegen.',
    color: '#A5A5A5', // Silver Grey
    radius: 2,
    distance: 35,
    orbitSpeed: 0.8,
    rotationSpeed: 0.01
  },
  {
    id: 'venus',
    name: 'Venus',
    displayName: 'Venüs',
    type: 'planet',
    description: 'Gökyüzünün en parlak gezegeni, sıcak ve zehirli.',
    color: '#FFC649', // Bright Pale Orange
    radius: 3.8,
    distance: 55,
    orbitSpeed: 0.6,
    rotationSpeed: 0.005
  },
  {
    id: 'earth',
    name: 'Earth',
    displayName: 'Dünya',
    type: 'planet',
    description: 'Evimiz. Üzerinde yaşam olduğu bilinen tek yer.',
    color: '#22A6FF', // Electric Blue
    radius: 4,
    distance: 75,
    orbitSpeed: 0.5,
    rotationSpeed: 0.02
  },
  {
    id: 'mars',
    name: 'Mars',
    displayName: 'Mars',
    type: 'planet',
    description: 'Kızıl Gezegen. Paslı demir oksit yüzey.',
    color: '#FF4500', // Neon Red/Orange
    radius: 2.5,
    distance: 95,
    orbitSpeed: 0.4,
    rotationSpeed: 0.018
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    displayName: 'Jüpiter',
    type: 'planet',
    description: 'En büyük gezegen, devasa bir gaz topu.',
    color: '#E0A679', // Beige/Orange
    radius: 9,
    distance: 140,
    orbitSpeed: 0.2,
    rotationSpeed: 0.04
  },
  {
    id: 'saturn',
    name: 'Saturn',
    displayName: 'Satürn',
    type: 'planet',
    description: 'Halkaların efendisi. Muazzam buz halkalarıyla çevrili.',
    color: '#F4D03F', // Gold/Yellow
    radius: 8,
    distance: 190,
    orbitSpeed: 0.15,
    rotationSpeed: 0.038,
    hasRings: true
  },
  {
    id: 'uranus',
    name: 'Uranus',
    displayName: 'Uranüs',
    type: 'planet',
    description: 'Buz devi. Atmosferindeki metan gazı yüzünden mavidir.',
    color: '#00FFFF', // Cyan
    radius: 6,
    distance: 240,
    orbitSpeed: 0.1,
    rotationSpeed: 0.03
  },
  {
    id: 'neptune',
    name: 'Neptune',
    displayName: 'Neptün',
    type: 'planet',
    description: 'En uzak ve rüzgarlı gezegen, derin mavi.',
    color: '#3355FF', // Deep Blue
    radius: 5.8,
    distance: 280,
    orbitSpeed: 0.08,
    rotationSpeed: 0.032
  },
  // --- NEARBY STARS ---
  {
    id: 'proxima',
    name: 'Proxima Centauri',
    displayName: 'Proxima Centauri',
    type: 'star',
    description: 'Bize en yakın yıldız komşumuz.',
    color: '#FF3333', // Red Dwarf
    radius: 6,
    distance: 350,
    orbitSpeed: 0.02,
    rotationSpeed: 0.01
  },
  {
    id: 'sirius',
    name: 'Sirius',
    displayName: 'Sirius',
    type: 'star',
    description: 'Gece gökyüzündeki en parlak yıldız.',
    color: '#FFFFFF', // White
    radius: 8,
    distance: 420,
    orbitSpeed: 0.015,
    rotationSpeed: 0.01
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    displayName: 'Betelgeuse',
    type: 'star',
    description: 'Patlamaya hazır kırmızı bir süperdev.',
    color: '#FF6600', // Orange Supergiant
    radius: 18,
    distance: 550,
    orbitSpeed: 0.01,
    rotationSpeed: 0.005
  },
  // --- GALAXIES ---
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy',
    displayName: 'Andromeda',
    type: 'galaxy',
    description: 'Bize en yakın dev sarmal galaksi.',
    color: '#D8B4FE', // Lavender
    radius: 60,
    distance: 900,
    orbitSpeed: 0.005,
    rotationSpeed: 0.001
  }
];

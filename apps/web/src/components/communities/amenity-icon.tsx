import {
  Anchor,
  Bike,
  Blocks,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CarFront,
  CircleDot,
  Clapperboard,
  Coffee,
  ConciergeBell,
  Dog,
  Dumbbell,
  Flag,
  Flame,
  Flower2,
  PersonStanding,
  Sailboat,
  Ship,
  ShieldCheck,
  Spade,
  Sparkles,
  Target,
  TreePine,
  Umbrella,
  UtensilsCrossed,
  Volleyball,
  Waves,
  Wine,
  type LucideIcon,
} from 'lucide-react';

import type { CommunityAmenityIcon } from '@mvp-realty/api-contracts';

/**
 * Maps the detail amenity vocabulary onto lucide glyphs. `Record` over the union,
 * so adding a value to `COMMUNITY_AMENITY_ICONS` fails the build until it lands here.
 * Keep glyphs distinct — two amenities sharing one is indistinguishable in the grid.
 */
const ICONS: Record<CommunityAmenityIcon, LucideIcon> = {
  golf: Flag,
  marina: Anchor,
  beach: Umbrella,
  racquet: Volleyball,
  fitness: Dumbbell,
  dining: UtensilsCrossed,
  trails: TreePine,
  pool: Waves,
  club: Building2,
  spa: Sparkles,
  gate: ShieldCheck,
  dog: Dog,
  pickleball: Target,
  tennis: CircleDot,
  boating: Sailboat,
  kayak: Ship,
  playground: Blocks,
  concierge: ConciergeBell,
  valet: CarFront,
  'business-center': Briefcase,
  library: BookOpen,
  garden: Flower2,
  bike: Bike,
  theater: Clapperboard,
  sauna: Flame,
  yoga: PersonStanding,
  cafe: Coffee,
  bar: Wine,
  events: CalendarDays,
  'card-room': Spade,
};

export function AmenityIcon({
  icon,
  className,
}: {
  icon: CommunityAmenityIcon;
  className?: string;
}) {
  const Icon = ICONS[icon];
  return <Icon className={className} strokeWidth={1.7} />;
}

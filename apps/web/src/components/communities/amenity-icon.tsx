import {
  Bike,
  Dumbbell,
  Flag,
  Anchor,
  Umbrella,
  Waves,
  UtensilsCrossed,
  TreePine,
  Building2,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import type { CommunityAmenityIcon } from '@mvp-realty/api-contracts';

/** Maps the detail amenity vocabulary onto lucide glyphs. */
const ICONS: Record<CommunityAmenityIcon, LucideIcon> = {
  golf: Flag,
  marina: Anchor,
  beach: Umbrella,
  racquet: Waves,
  fitness: Dumbbell,
  dining: UtensilsCrossed,
  trails: TreePine,
  pool: Waves,
  club: Building2,
  spa: Sparkles,
  gate: ShieldCheck,
  dog: Bike,
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

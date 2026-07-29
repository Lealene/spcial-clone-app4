import type { Broker } from '@mvp-realty/api-contracts';

/** Listing override wins; otherwise area broker; otherwise null. */
export function resolveBroker(
  listingBroker: Broker | null,
  areaBroker: Broker | null,
): Broker | null {
  return listingBroker ?? areaBroker ?? null;
}

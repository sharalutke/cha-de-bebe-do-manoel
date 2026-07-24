import type { Gift, RegistryProgress } from "@/types/domain";

export function calculateRegistryProgress(gifts: Gift[]): RegistryProgress {
  const visibleGifts = gifts.filter((gift) => gift.status !== "archived");

  const totals = visibleGifts.reduce(
    (acc, gift) => {
      const needed = Math.max(gift.quantity_needed, 0);
      const completed = Math.min(needed, gift.quantity_owned + gift.quantity_reserved);
      const weight = Math.max(gift.progress_weight, 0);

      acc.totalWeight += needed * weight;
      acc.completedWeight += completed * weight;
      acc.totalItems += needed;
      acc.ownedItems += gift.quantity_owned;
      acc.reservedItems += gift.quantity_reserved;

      return acc;
    },
    {
      totalWeight: 0,
      completedWeight: 0,
      totalItems: 0,
      ownedItems: 0,
      reservedItems: 0,
    },
  );

  return {
    total_weight: Number(totals.totalWeight.toFixed(2)),
    completed_weight: Number(totals.completedWeight.toFixed(2)),
    percentage:
      totals.totalWeight === 0
        ? 0
        : Number(((totals.completedWeight / totals.totalWeight) * 100).toFixed(1)),
    total_items: totals.totalItems,
    owned_items: totals.ownedItems,
    reserved_items: totals.reservedItems,
  };
}

export function getRemainingQuantity(gift: Gift) {
  return Math.max(gift.quantity_needed - gift.quantity_owned - gift.quantity_reserved, 0);
}

export function getGiftCompletion(gift: Gift) {
  if (gift.quantity_needed <= 0) {
    return 0;
  }

  return Math.min(
    100,
    ((gift.quantity_owned + gift.quantity_reserved) / gift.quantity_needed) * 100,
  );
}

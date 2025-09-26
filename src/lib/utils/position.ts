import type { Database } from "@/lib/supabase/types-enhanced";
import type { PositionUpdate } from "@/types/drag-and-drop";

type RetrospectiveItem = Database["public"]["Tables"]["retrospective_items"]["Row"];

/**
 * Calculate position updates for reordering items within the same column
 */
export function calculateReorderPositions(
  items: Array<{ id: string; position: number | null }>,
  itemId: string,
  newPosition: number
): PositionUpdate[] {
  const updates: PositionUpdate[] = [];

  const currentItem = items.find(item => item.id === itemId);
  if (!currentItem) return updates;

  const currentPosition = currentItem.position ?? 0;

  if (currentPosition === newPosition) return updates;

  if (currentPosition < newPosition) {
    // Moving down: shift items up
    items.forEach(item => {
      if (item.id === itemId) {
        updates.push({ id: item.id, position: newPosition });
      } else if ((item.position ?? 0) > currentPosition && (item.position ?? 0) <= newPosition) {
        updates.push({ id: item.id, position: (item.position ?? 0) - 1 });
      }
    });
  } else {
    // Moving up: shift items down
    items.forEach(item => {
      if (item.id === itemId) {
        updates.push({ id: item.id, position: newPosition });
      } else if ((item.position ?? 0) >= newPosition && (item.position ?? 0) < currentPosition) {
        updates.push({ id: item.id, position: (item.position ?? 0) + 1 });
      }
    });
  }

  return updates;
}

/**
 * Calculate position updates for moving an item to a different column
 */
export function calculateCrossColumnPositions(
  destinationItems: Array<{ id: string; position: number | null }>,
  newPosition: number
): PositionUpdate[] {
  const updates: PositionUpdate[] = [];

  // Update positions of items after the insertion point
  destinationItems
    .filter(item => (item.position ?? 0) >= newPosition)
    .forEach(item => {
      updates.push({
        id: item.id,
        position: (item.position ?? 0) + 1
      });
    });

  return updates;
}

/**
 * Re-index item positions to ensure sequential ordering
 */
export function reindexPositions(
  items: Array<{ id: string; position: number | null }>
): PositionUpdate[] {
  return items
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((item, index) => ({
      id: item.id,
      position: index
    }))
    .filter((update, index) => items[index].position !== update.position);
}

/**
 * Calculate the next available position for a new item in a column
 */
export function getNextPosition(items: RetrospectiveItem[], columnId: string): number {
  const columnItems = items.filter(item => item.column_id === columnId);

  if (columnItems.length === 0) return 0;

  const maxPosition = columnItems.reduce((max, item) =>
    Math.max(max, item.position ?? 0), -1
  );

  return maxPosition + 1;
}

/**
 * Determine the final drop position based on drag context
 */
export function calculateDropPosition(
  activeIndex: number,
  overIndex: number,
  isSameColumn: boolean
): number {
  if (!isSameColumn) return overIndex;

  // If dragging within same column, adjust for the removal of the dragged item
  return activeIndex < overIndex ? overIndex - 1 : overIndex;
}
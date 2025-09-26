import { RetroItemData } from "@/components/retro/RetroItem";

export interface DraggableItem extends RetroItemData {
  uniqueId: string;
}

export interface DragPosition {
  columnId: string;
  position: number;
}

export interface MoveItemParams {
  itemId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  newPosition: number;
  retrospectiveId: string;
}

export interface PositionUpdate {
  id: string;
  position: number;
}
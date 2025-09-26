import { customAlphabet } from "nanoid";

// Create a custom nanoid with only lowercase letters and numbers for URLs
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export function generateBoardUrl(): string {
  return nanoid();
}

export function generateAnonymousUserName(): string {
  const adjectives = [
    "Happy", "Clever", "Brave", "Calm", "Eager", "Gentle", "Kind", "Lively",
    "Wise", "Bright", "Swift", "Bold", "Noble", "Proud", "Fierce", "Mighty"
  ];
  const animals = [
    "Panda", "Eagle", "Tiger", "Dolphin", "Fox", "Owl", "Wolf", "Bear",
    "Lion", "Hawk", "Shark", "Falcon", "Phoenix", "Dragon", "Panther", "Raven"
  ];

  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  return `${randomAdj} ${randomAnimal}`;
}

export function generateCreatorCookie(): string {
  return `creator_${nanoid()}_${Date.now()}`;
}

// Cookie management utilities
export function getBoardsFromCookie(): string[] {
  if (typeof window === "undefined") return [];

  const cookies = document.cookie.split(";");
  const boardsCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("scrumkit_boards=")
  );

  if (!boardsCookie) return [];

  try {
    const value = boardsCookie.split("=")[1];
    const parsed = JSON.parse(decodeURIComponent(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addBoardToCookie(boardId: string) {
  if (typeof window === "undefined") return;

  const boards = getBoardsFromCookie();
  if (!boards.includes(boardId)) {
    boards.unshift(boardId); // Add to beginning
    // Keep only last 20 boards
    const recentBoards = boards.slice(0, 20);

    // Set cookie with 30 day expiry
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    document.cookie = `scrumkit_boards=${encodeURIComponent(
      JSON.stringify(recentBoards)
    )}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  }
}

export function removeBoardFromCookie(boardId: string) {
  if (typeof window === "undefined") return;

  const boards = getBoardsFromCookie();
  const filtered = boards.filter((id) => id !== boardId);

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  document.cookie = `scrumkit_boards=${encodeURIComponent(
    JSON.stringify(filtered)
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

export function getCreatorCookie(): string | null {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split(";");
  const creatorCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("scrumkit_creator=")
  );

  if (!creatorCookie) return null;

  return creatorCookie.split("=")[1].trim();
}

export function setCreatorCookie(value: string) {
  if (typeof window === "undefined") return;

  // Set cookie with 1 year expiry
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  document.cookie = `scrumkit_creator=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

export function initializeCreatorCookie(): string {
  let creatorId = getCreatorCookie();

  if (!creatorId) {
    creatorId = generateCreatorCookie();
    setCreatorCookie(creatorId);
  }

  return creatorId;
}

// Board settings utilities
export interface BoardSettings {
  allowAnonymous?: boolean;
  votingEnabled?: boolean;
  votingLimit?: number;
  timerEnabled?: boolean;
  timerDuration?: number; // in minutes
  maxItemsPerPerson?: number;
  hideAuthorNames?: boolean;
  requireApproval?: boolean;
}

export const defaultBoardSettings: BoardSettings = {
  allowAnonymous: true,
  votingEnabled: true,
  votingLimit: 3,
  timerEnabled: false,
  timerDuration: 5,
  maxItemsPerPerson: 0, // 0 means unlimited
  hideAuthorNames: false,
  requireApproval: false,
};
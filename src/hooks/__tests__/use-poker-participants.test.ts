import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import {
  useSessionParticipants,
  useJoinPokerSession,
  useParticipantCount,
  pokerParticipantKeys,
} from "../use-poker-participants";
import * as pokerActions from "@/lib/poker/actions";
import type { PokerParticipant } from "@/lib/poker/types";

// Mock the poker actions
jest.mock("@/lib/poker/actions");
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  })),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("useSessionParticipants", () => {
  let queryClient: QueryClient;

  const mockParticipants: PokerParticipant[] = [
    {
      id: "participant-1",
      session_id: "session-1",
      profile_id: "profile-1",
      name: "Alice",
      avatar_url: null,
      is_facilitator: true,
      is_observer: false,
      participant_cookie: null,
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    },
    {
      id: "participant-2",
      session_id: "session-1",
      profile_id: "profile-2",
      name: "Bob",
      avatar_url: null,
      is_facilitator: false,
      is_observer: false,
      participant_cookie: null,
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("should fetch participants for a session", async () => {
    jest
      .spyOn(pokerActions, "getSessionParticipants")
      .mockResolvedValue(mockParticipants);

    const { result } = renderHook(
      () => useSessionParticipants("session-1"),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockParticipants);
    expect(pokerActions.getSessionParticipants).toHaveBeenCalledWith("session-1");
  });

  it("should handle empty participant list", async () => {
    jest
      .spyOn(pokerActions, "getSessionParticipants")
      .mockResolvedValue([]);

    const { result } = renderHook(
      () => useSessionParticipants("session-1"),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it("should handle errors when fetching participants", async () => {
    jest
      .spyOn(pokerActions, "getSessionParticipants")
      .mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(
      () => useSessionParticipants("session-1"),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("should not fetch when sessionId is empty", async () => {
    const { result } = renderHook(
      () => useSessionParticipants(""),
      { wrapper }
    );

    expect(result.current.isFetching).toBe(false);
    expect(pokerActions.getSessionParticipants).not.toHaveBeenCalled();
  });
});

describe("useJoinPokerSession", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("should successfully join a session", async () => {
    const mockJoinedParticipant: PokerParticipant = {
      id: "new-participant",
      session_id: "session-1",
      profile_id: null,
      name: "Charlie",
      avatar_url: null,
      is_facilitator: false,
      is_observer: false,
      participant_cookie: "cookie-123",
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    };

    jest
      .spyOn(pokerActions, "joinPokerSession")
      .mockResolvedValue(mockJoinedParticipant);

    const { result } = renderHook(() => useJoinPokerSession(), { wrapper });

    result.current.mutate({
      sessionId: "session-1",
      input: {
        sessionId: "session-1",
        name: "Charlie",
        is_facilitator: false,
        is_observer: false,
      },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(pokerActions.joinPokerSession).toHaveBeenCalledWith("session-1", {
      sessionId: "session-1",
      name: "Charlie",
      is_facilitator: false,
      is_observer: false,
    });
  });

  it("should handle join session errors", async () => {
    jest
      .spyOn(pokerActions, "joinPokerSession")
      .mockRejectedValue(new Error("Failed to join"));

    const { result } = renderHook(() => useJoinPokerSession(), { wrapper });

    result.current.mutate({
      sessionId: "session-1",
      input: {
        sessionId: "session-1",
        name: "Charlie",
      },
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useParticipantCount", () => {
  let queryClient: QueryClient;

  const mockParticipants: PokerParticipant[] = [
    {
      id: "participant-1",
      session_id: "session-1",
      profile_id: "profile-1",
      name: "Alice",
      avatar_url: null,
      is_facilitator: true,
      is_observer: false,
      participant_cookie: null,
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    },
    {
      id: "participant-2",
      session_id: "session-1",
      profile_id: "profile-2",
      name: "Bob",
      avatar_url: null,
      is_facilitator: false,
      is_observer: false,
      participant_cookie: null,
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it("should return correct participant count", async () => {
    jest
      .spyOn(pokerActions, "getSessionParticipants")
      .mockResolvedValue(mockParticipants);

    const { result } = renderHook(
      () => useParticipantCount("session-1"),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current).toBe(2);
    });
  });

  it("should return 0 when no participants", async () => {
    jest
      .spyOn(pokerActions, "getSessionParticipants")
      .mockResolvedValue([]);

    const { result } = renderHook(
      () => useParticipantCount("session-1"),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current).toBe(0);
    });
  });

  it("should return 0 when data is undefined", async () => {
    jest
      .spyOn(pokerActions, "getSessionParticipants")
      .mockRejectedValue(new Error("Failed"));

    const { result } = renderHook(
      () => useParticipantCount("session-1"),
      { wrapper }
    );

    expect(result.current).toBe(0);
  });
});

describe("pokerParticipantKeys", () => {
  it("should generate correct query keys", () => {
    expect(pokerParticipantKeys.all).toEqual(["poker-participants"]);
    expect(pokerParticipantKeys.session("session-1")).toEqual([
      "poker-participants",
      "session",
      "session-1",
    ]);
  });
});

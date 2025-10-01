import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRevealVotes, useResetVotes } from "../use-poker-reveal";
import { revealStoryVotes, resetStoryVotes } from "@/lib/poker/actions";
import { toast } from "sonner";

// Mock dependencies
jest.mock("@/lib/poker/actions");
jest.mock("sonner");

const mockRevealStoryVotes = revealStoryVotes as jest.MockedFunction<typeof revealStoryVotes>;
const mockResetStoryVotes = resetStoryVotes as jest.MockedFunction<typeof resetStoryVotes>;
const mockToast = toast as jest.Mocked<typeof toast>;

/**
 * Test suite for poker reveal hooks
 */
describe("use-poker-reveal hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useRevealVotes", () => {
    it("should reveal votes successfully", async () => {
      mockRevealStoryVotes.mockResolvedValue();

      const { result } = renderHook(() => useRevealVotes(), { wrapper });

      result.current.mutate("story-123");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockRevealStoryVotes).toHaveBeenCalledWith("story-123");
      expect(mockToast.success).toHaveBeenCalledWith("Votes revealed!");
    });

    it("should handle reveal errors", async () => {
      const error = new Error("Permission denied");
      mockRevealStoryVotes.mockRejectedValue(error);

      const { result } = renderHook(() => useRevealVotes(), { wrapper });

      result.current.mutate("story-123");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Permission denied");
    });

    it("should handle non-Error exceptions", async () => {
      mockRevealStoryVotes.mockRejectedValue("Unknown error");

      const { result } = renderHook(() => useRevealVotes(), { wrapper });

      result.current.mutate("story-123");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Failed to reveal votes");
    });

    it("should invalidate queries after successful reveal", async () => {
      mockRevealStoryVotes.mockResolvedValue();

      const { result } = renderHook(() => useRevealVotes(), { wrapper });

      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      result.current.mutate("story-123");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe("useResetVotes", () => {
    it("should reset votes successfully", async () => {
      mockResetStoryVotes.mockResolvedValue();

      const { result } = renderHook(() => useResetVotes(), { wrapper });

      result.current.mutate("story-123");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockResetStoryVotes).toHaveBeenCalledWith("story-123");
      expect(mockToast.success).toHaveBeenCalledWith("Voting has been reset");
    });

    it("should handle reset errors", async () => {
      const error = new Error("Story not found");
      mockResetStoryVotes.mockRejectedValue(error);

      const { result } = renderHook(() => useResetVotes(), { wrapper });

      result.current.mutate("story-123");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Story not found");
    });

    it("should handle non-Error exceptions", async () => {
      mockResetStoryVotes.mockRejectedValue("Unknown error");

      const { result } = renderHook(() => useResetVotes(), { wrapper });

      result.current.mutate("story-123");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Failed to reset votes");
    });

    it("should invalidate all relevant queries after reset", async () => {
      mockResetStoryVotes.mockResolvedValue();

      const { result } = renderHook(() => useResetVotes(), { wrapper });

      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      result.current.mutate("story-123");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should invalidate story votes, participant votes, and all stories
      expect(invalidateSpy).toHaveBeenCalledTimes(3);
    });
  });
});

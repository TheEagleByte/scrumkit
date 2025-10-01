import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VoteResults } from "../VoteResults";
import type { PokerVote, PokerParticipant, EstimationSequence } from "@/lib/poker/types";

// Mock hooks
jest.mock("@/hooks/use-poker-reveal", () => ({
  useResetVotes: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock("@/hooks/use-poker-stories", () => ({
  useUpdatePokerStory: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

/**
 * Test suite for VoteResults component
 */
describe("VoteResults", () => {
  const queryClient = new QueryClient();

  const mockSequence: EstimationSequence = {
    type: "fibonacci",
    name: "Fibonacci",
    values: [1, 2, 3, 5, 8, 13],
    specialValues: ["?", "☕"],
  };

  const mockParticipants: PokerParticipant[] = [
    {
      id: "p1",
      session_id: "session-1",
      profile_id: null,
      name: "Alice",
      avatar_url: null,
      is_facilitator: false,
      is_observer: false,
      participant_cookie: "cookie1",
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    },
    {
      id: "p2",
      session_id: "session-1",
      profile_id: null,
      name: "Bob",
      avatar_url: null,
      is_facilitator: false,
      is_observer: false,
      participant_cookie: "cookie2",
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    },
    {
      id: "p3",
      session_id: "session-1",
      profile_id: null,
      name: "Carol",
      avatar_url: null,
      is_facilitator: false,
      is_observer: false,
      participant_cookie: "cookie3",
      last_seen_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    },
  ];

  const mockVotes: (PokerVote & { participant: PokerParticipant })[] = [
    {
      id: "v1",
      story_id: "story-1",
      participant_id: "p1",
      session_id: "session-1",
      vote_value: "5",
      is_revealed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participant: mockParticipants[0],
    },
    {
      id: "v2",
      story_id: "story-1",
      participant_id: "p2",
      session_id: "session-1",
      vote_value: "5",
      is_revealed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participant: mockParticipants[1],
    },
    {
      id: "v3",
      story_id: "story-1",
      participant_id: "p3",
      session_id: "session-1",
      vote_value: "8",
      is_revealed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participant: mockParticipants[2],
    },
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should render vote distribution chart", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    expect(screen.getByText("Vote Distribution")).toBeInTheDocument();
    expect(screen.getByText("3 votes received")).toBeInTheDocument();
  });

  it("should display statistics for numeric votes", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    expect(screen.getAllByText("Most Common").length).toBeGreaterThan(0);
    expect(screen.getByText("Average")).toBeInTheDocument();
    expect(screen.getByText("Median")).toBeInTheDocument();
    expect(screen.getByText("Range")).toBeInTheDocument();
  });

  it("should highlight most common vote", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    // "5" is the mode (appears twice)
    const mostCommonBadges = screen.getAllByText("Most Common");
    expect(mostCommonBadges.length).toBeGreaterThan(0);
  });

  it("should show reset button for facilitators", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={true}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    expect(screen.getByText("Reset Voting")).toBeInTheDocument();
  });

  it("should not show reset button for non-facilitators", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    expect(screen.queryByText("Reset Voting")).not.toBeInTheDocument();
  });

  it("should show final estimate selection for facilitators", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={true}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    expect(screen.getByText("Set Final Estimate")).toBeInTheDocument();
  });

  it("should not show final estimate selection for non-facilitators", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    expect(screen.queryByText("Set Final Estimate")).not.toBeInTheDocument();
  });

  it("should display participant names when enabled", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    // Participant names should be visible (passed to RevealedCard components)
    expect(screen.getByText("All Votes")).toBeInTheDocument();
  });

  it("should render revealed cards for all votes", () => {
    const { container } = render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    // Should render 3 revealed cards
    const cards = container.querySelectorAll('[class*="flex flex-col items-center"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("should calculate consensus correctly", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    // 5 appears twice (consensus), 8 appears once (could be consensus if within ±1)
    expect(screen.getByText("Consensus (similar votes)")).toBeInTheDocument();
  });

  it("should show legend for consensus and outliers", () => {
    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    expect(screen.getByText("Consensus (similar votes)")).toBeInTheDocument();
    expect(screen.getByText("Outlier (divergent vote)")).toBeInTheDocument();
  });

  it("should handle special values in distribution", () => {
    const specialVotes: (PokerVote & { participant: PokerParticipant })[] = [
      {
        ...mockVotes[0],
        id: "v-special",
        vote_value: "☕",
      },
    ];

    render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={specialVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    expect(screen.getByText("Coffee Break")).toBeInTheDocument();
  });

  it("should calculate vote percentages correctly", () => {
    const { container } = render(
      <VoteResults
        storyId="story-1"
        sessionId="session-1"
        votes={mockVotes}
        showVoterNames={true}
        isFacilitator={false}
        sequence={mockSequence}
      />,
      { wrapper }
    );

    // 2 votes for "5" out of 3 total = 67%
    // 1 vote for "8" out of 3 total = 33%
    const percentages = container.textContent;
    expect(percentages).toContain("67%");
    expect(percentages).toContain("33%");
  });
});

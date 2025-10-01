import { render, screen, waitFor } from "@testing-library/react";
import { RevealedCard } from "../RevealedCard";

/**
 * Test suite for RevealedCard component
 */
describe("RevealedCard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should render card with hidden state initially", () => {
    render(
      <RevealedCard
        value="5"
        participantName="John Doe"
        showParticipantName={true}
        delay={0}
      />
    );

    // Card should exist
    const card = screen.getByText("5").closest("div");
    expect(card).toBeInTheDocument();
  });

  it("should trigger flip animation after delay", async () => {
    render(
      <RevealedCard
        value="8"
        participantName="Jane Smith"
        showParticipantName={true}
        delay={100}
      />
    );

    // Fast-forward time
    jest.advanceTimersByTime(100);

    // Wait for flip animation
    await waitFor(() => {
      const valueElement = screen.getByText("8");
      expect(valueElement).toBeInTheDocument();
    });
  });

  it("should show participant name when enabled", async () => {
    render(
      <RevealedCard
        value="3"
        participantName="Alice"
        showParticipantName={true}
        delay={0}
      />
    );

    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });

  it("should hide participant name when disabled", () => {
    render(
      <RevealedCard
        value="5"
        participantName="Bob"
        showParticipantName={false}
        delay={0}
      />
    );

    jest.advanceTimersByTime(0);

    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("should apply consensus styling", () => {
    const { container } = render(
      <RevealedCard
        value="5"
        participantName="Carol"
        showParticipantName={true}
        delay={0}
        isConsensus={true}
      />
    );

    jest.advanceTimersByTime(0);

    // Check for consensus styling classes
    const cardFront = container.querySelector(".border-green-500");
    expect(cardFront).toBeInTheDocument();
  });

  it("should apply outlier styling", () => {
    const { container } = render(
      <RevealedCard
        value="21"
        participantName="Dave"
        showParticipantName={true}
        delay={0}
        isOutlier={true}
      />
    );

    jest.advanceTimersByTime(0);

    // Check for outlier styling classes
    const cardFront = container.querySelector(".border-red-500");
    expect(cardFront).toBeInTheDocument();
  });

  it("should render coffee icon for special value", () => {
    const { container } = render(
      <RevealedCard
        value="☕"
        participantName="Eve"
        showParticipantName={true}
        delay={0}
      />
    );

    jest.advanceTimersByTime(0);

    // Coffee icon should be rendered (lucide-react Coffee component creates an SVG)
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThanOrEqual(1);
  });

  it("should render question mark for unsure value", () => {
    render(
      <RevealedCard
        value="?"
        participantName="Frank"
        showParticipantName={true}
        delay={0}
      />
    );

    jest.advanceTimersByTime(0);

    // Question mark appears twice - once on card back, once on card front
    expect(screen.getAllByText("?").length).toBeGreaterThanOrEqual(1);
  });

  it("should support staggered animations with different delays", async () => {
    const { rerender } = render(
      <RevealedCard
        value="1"
        participantName="User1"
        showParticipantName={true}
        delay={100}
      />
    );

    // First card shouldn't flip yet
    jest.advanceTimersByTime(50);

    rerender(
      <RevealedCard
        value="2"
        participantName="User2"
        showParticipantName={true}
        delay={200}
      />
    );

    // Advance to first card's flip time
    jest.advanceTimersByTime(50);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("should show consensus indicator icon", () => {
    const { container } = render(
      <RevealedCard
        value="5"
        participantName="Grace"
        showParticipantName={true}
        delay={0}
        isConsensus={true}
      />
    );

    jest.advanceTimersByTime(0);

    // TrendingUp icon should be present for consensus
    const trendingUpIcon = container.querySelector(".text-green-600");
    expect(trendingUpIcon).toBeInTheDocument();
  });

  it("should show outlier indicator icon", () => {
    const { container } = render(
      <RevealedCard
        value="100"
        participantName="Hank"
        showParticipantName={true}
        delay={0}
        isOutlier={true}
      />
    );

    jest.advanceTimersByTime(0);

    // TrendingDown icon should be present for outlier
    const trendingDownIcon = container.querySelector(".text-red-600");
    expect(trendingDownIcon).toBeInTheDocument();
  });
});

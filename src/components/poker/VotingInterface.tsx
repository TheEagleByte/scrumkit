"use client";

import { useState, useEffect, useCallback } from "react";
import { VotingCard } from "./VotingCard";
import { VoteResults } from "./VoteResults";
import { ParticipantStatus } from "./ParticipantStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, AlertCircle, Eye } from "lucide-react";
import { useSubmitVote, useParticipantVote, useStoryVotes } from "@/hooks/use-poker-votes";
import { useRevealVotes } from "@/hooks/use-poker-reveal";
import { useSessionParticipants } from "@/hooks/use-poker-participants";
import type { EstimationSequence, PokerStory } from "@/lib/poker/types";
import { canVoteOnStory } from "@/lib/poker/utils";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { pokerVoteKeys } from "@/hooks/use-poker-votes";
import { pokerStoryKeys } from "@/hooks/use-poker-stories";
import { getCookie } from "@/lib/utils/cookies";

interface VotingInterfaceProps {
  story: PokerStory;
  sequence: EstimationSequence;
  sessionId: string;
  isObserver?: boolean;
  showVoterNames?: boolean;
  autoReveal?: boolean;
}

// Keyboard shortcut mapping
const getKeyboardShortcut = (value: string | number): string | undefined => {
  const valueStr = String(value).toLowerCase();

  // Numeric values
  if (!isNaN(Number(valueStr))) {
    return valueStr;
  }

  // T-shirt sizes
  const tshirtMap: Record<string, string> = {
    'xs': 'X',
    's': 'S',
    'm': 'M',
    'l': 'L',
    'xl': 'Shift+X',
    'xxl': 'Shift+2',
  };

  if (tshirtMap[valueStr]) {
    return tshirtMap[valueStr];
  }

  // Special values
  if (valueStr === '?') return '?';
  if (valueStr === '☕') return 'C';

  return undefined;
};

export function VotingInterface({
  story,
  sequence,
  sessionId,
  isObserver = false,
  showVoterNames = true,
  autoReveal = false,
}: VotingInterfaceProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isFacilitator, setIsFacilitator] = useState(false);
  const submitVote = useSubmitVote();
  const revealVotes = useRevealVotes();
  const { data: currentVote } = useParticipantVote(story.id);
  const { data: allVotes } = useStoryVotes(story.id);
  const { data: participants = [] } = useSessionParticipants(sessionId);

  const canVote = canVoteOnStory(story.status) && !isObserver;
  const hasVoted = !!currentVote;
  const isRevealed = story.status === "revealed" || story.status === "estimated";

  // Check if current user is facilitator
  useEffect(() => {
    const checkFacilitator = async () => {
      if (typeof window === "undefined") return;

      const creatorCookie = getCookie("scrumkit_poker_creator");
      const participantCookie = getCookie("scrumkit_poker_participant");

      // Check if user is facilitator/creator
      const currentParticipant = participants.find(
        p => p.participant_cookie === participantCookie
      );

      setIsFacilitator(
        !!currentParticipant?.is_facilitator ||
        !!creatorCookie
      );
    };

    checkFacilitator();
  }, [participants]);

  // Set initial selected value from current vote
  useEffect(() => {
    if (currentVote) {
      setSelectedValue(currentVote.vote_value);
    }
  }, [currentVote]);

  // Handle card selection
  const handleCardClick = useCallback((value: string | number) => {
    if (!canVote) return;

    const valueStr = String(value);

    // Early return if selecting the same value to avoid unnecessary API calls
    if (selectedValue === valueStr) return;

    setSelectedValue(valueStr);

    // Auto-submit vote
    submitVote.mutate({
      storyId: story.id,
      voteValue: valueStr,
    });
  }, [canVote, story.id, submitVote, selectedValue]);

  // Keyboard shortcuts
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!canVote) return;

      const key = event.key.toLowerCase();
      const shiftKey = event.shiftKey;

      // Find matching card value
      let matchedValue: string | number | null = null;

      // Check regular values
      for (const value of sequence.values) {
        const shortcut = getKeyboardShortcut(value);
        if (!shortcut) continue;

        const shortcutLower = shortcut.toLowerCase();

        // Handle shift key combinations
        if (shortcutLower.includes('shift+')) {
          const shortcutKey = shortcutLower.replace('shift+', '');
          if (shiftKey && key === shortcutKey) {
            matchedValue = value;
            break;
          }
        } else if (!shiftKey && key === shortcutLower) {
          matchedValue = value;
          break;
        }
      }

      // Check special values
      if (sequence.specialValues) {
        for (const value of sequence.specialValues) {
          if (value === '?' && key === '?') {
            matchedValue = value;
            break;
          }
          if (value === '☕' && key === 'c') {
            matchedValue = value;
            break;
          }
        }
      }

      if (matchedValue !== null) {
        event.preventDefault();
        handleCardClick(matchedValue);
      }
    },
    [canVote, sequence, handleCardClick]
  );

  // Register keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Real-time subscription for vote and story updates
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to poker_votes changes for this story
    const votesChannel = supabase
      .channel(`poker-votes:${story.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poker_votes',
          filter: `story_id=eq.${story.id}`,
        },
        () => {
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({
            queryKey: pokerVoteKeys.story(story.id),
          });
          queryClient.invalidateQueries({
            queryKey: pokerVoteKeys.participant(story.id),
          });
        }
      )
      .subscribe();

    // Subscribe to poker_stories changes to detect reveal
    const storyChannel = supabase
      .channel(`poker-story:${story.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'poker_stories',
          filter: `id=eq.${story.id}`,
        },
        () => {
          // Invalidate story queries when status changes
          queryClient.invalidateQueries({
            queryKey: pokerStoryKeys.all,
          });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(storyChannel);
    };
  }, [story.id, queryClient]);

  // Calculate voting progress
  const votingParticipants = participants.filter(p => !p.is_observer);
  const votedCount = allVotes?.length || 0;
  const allVoted = votingParticipants.length > 0 && votedCount === votingParticipants.length;

  // Auto-reveal when all participants have voted
  useEffect(() => {
    if (autoReveal && allVoted && story.status === "voting" && !revealVotes.isPending) {
      // Small delay to allow last vote to be visible
      const timer = setTimeout(() => {
        revealVotes.mutate(story.id);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoReveal, allVoted, story.status, story.id, revealVotes]);

  const handleReveal = () => {
    revealVotes.mutate(story.id);
  };

  // Combine all cards (regular + special)
  const allCards = [
    ...sequence.values,
    ...(sequence.specialValues || []),
  ];

  const voteCount = allVotes?.length || 0;

  // If votes are revealed, show the results
  if (isRevealed && allVotes && allVotes.length > 0) {
    return (
      <div className="space-y-6">
        {/* Participant Status Section */}
        <ParticipantStatus story={story} sessionId={sessionId} />

        {/* Vote Results */}
        <VoteResults
          storyId={story.id}
          sessionId={sessionId}
          votes={allVotes}
          showVoterNames={showVoterNames}
          isFacilitator={isFacilitator}
          sequence={sequence}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Participant Status Section */}
      <ParticipantStatus story={story} sessionId={sessionId} />

      {/* Voting Cards Section */}
      <Card className="border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {hasVoted ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Your Vote
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 text-indigo-600" />
                    Select Your Estimate
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {canVote ? (
                  hasVoted ? (
                    "You can change your vote at any time before reveal"
                  ) : (
                    "Click a card or use keyboard shortcuts to vote"
                  )
                ) : isObserver ? (
                  "You are an observer and cannot vote"
                ) : (
                  "Voting is not open for this story"
                )}
              </CardDescription>
            </div>

            {/* Vote count indicator and reveal button */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
              </Badge>
              {isFacilitator && canVote && voteCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleReveal}
                  disabled={revealVotes.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Reveal Votes
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

      <CardContent>
        {!canVote && !isObserver && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Voting is not open
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                The facilitator needs to start voting for this story.
              </p>
            </div>
          </div>
        )}

        {isObserver && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Observer Mode
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You are observing this session and cannot submit votes.
              </p>
            </div>
          </div>
        )}

        {/* Voting Cards Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 justify-items-center">
          {allCards.map((value) => (
            <VotingCard
              key={String(value)}
              value={value}
              isSelected={selectedValue === String(value)}
              isDisabled={!canVote}
              onClick={() => handleCardClick(value)}
              keyboardShortcut={getKeyboardShortcut(value)}
            />
          ))}
        </div>

        {/* Vote confirmation message */}
        {hasVoted && canVote && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Your vote has been submitted! You can change it at any time before reveal.
            </p>
          </div>
        )}

        {/* Keyboard shortcuts help */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            <span className="font-medium">Keyboard shortcuts:</span> Press the number/letter shown on each card
            {sequence.specialValues?.includes('?') && ' | ? for Unsure'}
            {sequence.specialValues?.includes('☕') && ' | C for Coffee Break'}
          </p>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}

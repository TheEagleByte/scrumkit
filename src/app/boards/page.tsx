"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useBoards } from "@/hooks/use-boards";
import { BoardList } from "@/components/BoardList";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Sparkles, Archive } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import Magnet from "@/components/Magnet";
import StarBorder from "@/components/StarBorder";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { useUser, useResendVerificationEmail } from "@/hooks/use-auth-query";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { toast } from "sonner";

export default function BoardsPage() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: user } = useUser();
  const { mutate: resendEmail, isPending: isResending } = useResendVerificationEmail();

  // Use TanStack Query to fetch boards
  const { data: boards = [], isLoading, error } = useBoards();

  // Calculate derived state
  const activeBoards = useMemo(() => boards.filter(board => !board.is_archived), [boards]);
  const archivedBoards = useMemo(() => boards.filter(board => board.is_archived), [boards]);
  const displayedBoards = showArchived ? archivedBoards : activeBoards;

  // Auto-switch to active tab when last archived board is unarchived
  useEffect(() => {
    if (showArchived && archivedBoards.length === 0) {
      setShowArchived(false);
      toast.success('Switched to active boards', {
        description: 'No archived boards remaining'
      });
    }
  }, [archivedBoards.length, showArchived]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header showAuth={true} />
        <div className="container max-w-7xl mx-auto py-8 px-4 pt-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-2">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-12 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Header showAuth={true} />
        <div className="container max-w-7xl mx-auto py-8 px-4 pt-24">
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load boards</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background relative">
      {/* Header */}
      <Header showAuth={true} />

      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5" />

      <div className="container max-w-7xl mx-auto py-8 px-4 pt-24 relative z-10">
        {/* Email Verification Banner */}
        <EmailVerificationBanner
          user={user ?? null}
          onResendEmail={() => resendEmail()}
          isResending={isResending}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold mb-2 flex items-center gap-3"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <LayoutGrid className="h-9 w-9 text-violet-500" />
              </motion.div>
              My Boards
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Manage your retrospective boards
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
            {/* Archive toggle */}
            {archivedBoards.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowArchived(!showArchived)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showArchived
                    ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                    : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                }`}
              >
                <Archive className="mr-2 h-4 w-4 inline" />
                {showArchived ? 'Show Active' : `Archived (${archivedBoards.length})`}
              </motion.button>
            )}

            <Magnet padding={30} magnetStrength={2}>
              <Link href="/boards/new">
                <StarBorder
                  color="#8b5cf6"
                  speed="3s"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="flex items-center px-4 py-2 font-medium"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    New Board
                  </motion.span>
                </StarBorder>
              </Link>
            </Magnet>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {!showArchived && activeBoards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeBoards.length}</p>
                  <p className="text-sm text-muted-foreground">Active Boards</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{archivedBoards.length}</p>
                  <p className="text-sm text-muted-foreground">Archived</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Array.from(new Set(activeBoards.map(b => b.template))).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Templates Used</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{boards.length}</p>
                  <p className="text-sm text-muted-foreground">Total Created</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Board List with stagger animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <BoardList
            boards={displayedBoards}
            showArchived={showArchived}
          />
        </motion.div>

        {/* Info Box for Anonymous Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 rounded-xl bg-gradient-to-br from-violet-500/5 to-blue-500/5 border border-violet-500/10 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-violet-500" />
              </motion.div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-violet-900 dark:text-violet-100">
                Your boards are saved locally
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                As an anonymous user, your boards are saved in your browser. Clear your
                cookies and you&apos;ll lose access to managing these boards (though the boards
                will remain accessible via their unique URLs).
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Pro tip:</strong> Bookmark your important board URLs or sign up
                for an account to permanently save your boards.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
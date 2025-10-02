"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { CheckCircle, Calendar, CreditCard, Activity, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import Magnet from "@/components/Magnet";
import StarBorder from "@/components/StarBorder";
import InteractiveAnimatedLogo from "@/components/InteractiveAnimatedLogo";
import { toast } from "sonner";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if user just confirmed their email
    const confirmed = searchParams.get("confirmed");

    if (confirmed === "true") {
      // Show success toast
      toast.success("Email confirmed successfully!", {
        description: "You can now access all features.",
      });

      // Clear the URL parameter after showing the toast
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-background relative">
      {/* Header */}
      <Header showAuth={true} />

      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5" />

      <div className="container max-w-7xl mx-auto py-8 px-4 pt-24 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <InteractiveAnimatedLogo
              size={56}
              playOnMount={false}
              enableHover={true}
              sessionKey="header-logo-animated"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-violet-400">Your Scrum Toolkit</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            Welcome to <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">ScrumKit</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Choose your tool to get started with better sprint ceremonies
          </motion.p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Retro Feature - Available */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-green-950/30 to-emerald-950/30 border border-green-500/20 hover:border-green-500/40 transition-all"
          >
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">Available Now</span>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">ScrumKit Retro</h3>
            <p className="text-gray-400 mb-6">
              Run engaging retrospectives with real-time collaboration, voting, and action tracking
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                10+ built-in templates
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Anonymous feedback options
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Dot voting & prioritization
              </li>
            </ul>
            <Magnet padding={20} magnetStrength={2}>
              <Link href="/boards" className="block">
                <StarBorder
                  color="#10b981"
                  speed="3s"
                  className="w-full hover:scale-105 transition-transform duration-200"
                >
                  <span className="flex items-center justify-center px-4 py-2.5 font-medium text-green-400">
                    View My Boards
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </StarBorder>
              </Link>
            </Magnet>
          </motion.div>

          {/* Planning Poker Feature - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-blue-950/30 to-cyan-950/30 border border-blue-500/20 opacity-75"
          >
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">Coming Soon</span>
            </div>
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <CreditCard className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">ScrumKit Poker</h3>
            <p className="text-gray-400 mb-6">
              Estimate stories efficiently with real-time planning poker sessions
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Fibonacci & T-shirt sizing
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Jira & GitHub integration
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Velocity tracking
              </li>
            </ul>
            <Button className="w-full bg-blue-500/10 hover:bg-blue-500/10 text-blue-400 border-blue-500/20 cursor-not-allowed" disabled>
              Coming Soon
            </Button>
          </motion.div>

          {/* Daily Standup Feature - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-orange-950/30 to-amber-950/30 border border-orange-500/20 opacity-75"
          >
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">Coming Soon</span>
            </div>
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-orange-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">ScrumKit Daily</h3>
            <p className="text-gray-400 mb-6">
              Run efficient daily standups with parking lots and blocker tracking
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Yesterday/Today/Blockers format
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Round-robin timer
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Async updates for remote teams
              </li>
            </ul>
            <Button className="w-full bg-orange-500/10 hover:bg-orange-500/10 text-orange-400 border-orange-500/20 cursor-not-allowed" disabled>
              Coming Soon
            </Button>
          </motion.div>

          {/* Health Check Feature - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-purple-950/30 to-pink-950/30 border border-purple-500/20 opacity-75"
          >
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">Coming Soon</span>
            </div>
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Activity className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">ScrumKit Health</h3>
            <p className="text-gray-400 mb-6">
              Monitor team health with regular checks and trend analysis
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Spotify health check model
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Custom metrics tracking
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Heat map visualizations
              </li>
            </ul>
            <Button className="w-full bg-purple-500/10 hover:bg-purple-500/10 text-purple-400 border-purple-500/20 cursor-not-allowed" disabled>
              Coming Soon
            </Button>
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center max-w-3xl mx-auto"
        >
          <p className="text-muted-foreground">
            More tools coming soon! ScrumKit is building a complete suite of ceremony tools to help your team excel at agile development.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

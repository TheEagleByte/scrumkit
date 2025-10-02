"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Users, BarChart, Clock, CheckCircle, Heart, Calendar, Server, GitBranch, MessageSquare, Hash, CreditCard, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextType from "@/components/TypewriterText";
import StarBorder from "@/components/StarBorder";
import Magnet from "@/components/Magnet";
import LiquidEther from "@/components/LiquidEther";
import GithubIcon from "@/components/GithubIcon";
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Liquid Ether Background Effect */}
      <div className="fixed inset-0 z-0">
        <LiquidEther
          colors={['#4c1d95', '#7c3aed', '#6d28d9']}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.4}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Main Content - Now positioned above the background */}
      <div className="relative z-10">
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md z-50">
          Skip to main content
        </a>
        {/* Navigation */}
        <Header showAuth={true} />

        {/* Hero Section */}
        <main id="main-content">
          <section className="relative pt-32 pb-20 px-6">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent" />

            <div className="container max-w-7xl mx-auto relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-4xl mx-auto mb-12"
              >
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm">
                    <GithubIcon className="w-3 h-3" />
                    <span>Open Source</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm">
                    <Server className="w-3 h-3" />
                    <span>Self-Hostable</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm">
                    <Shield className="w-3 h-3" />
                    <span>MIT License</span>
                  </div>
                </div>

                <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
                  Open source tools for
                  <span className="block bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    <TextType
                      text={[
                        "better sprints",
                        "agile teams",
                        "retrospectives",
                        "planning poker",
                        "daily standups",
                        "team health"
                      ]}
                      typingSpeed={80}
                      deletingSpeed={40}
                      pauseDuration={2500}
                      loop={true}
                      showCursor={true}
                      cursorCharacter="|"
                      cursorClassName="bg-gradient-to-r from-violet-400 to-purple-400"
                      as="span"
                    />
                  </span>
                </h1>

                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  All essential scrum ceremony tools in one unified platform. Retrospectives, planning poker,
                  daily standups, and team health checks—completely free and open source.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Magnet padding={50} magnetStrength={3}>
                    <Link href="/dashboard">
                      <StarBorder
                        color="#8b5cf6"
                        speed="3s"
                        className="font-medium hover:scale-105 transition-transform duration-200"
                      >
                        <span className="flex items-center">
                          Get Started Free
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </StarBorder>
                    </Link>
                  </Magnet>
                  <Magnet padding={15} magnetStrength={2}>
                    <a href="https://github.com/TheEagleByte/scrumkit" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" variant="outline" className="border-gray-800 text-white hover:bg-gray-900 px-8 h-12 text-base">
                        <GithubIcon className="mr-2 h-4 w-4" />
                        View on GitHub
                      </Button>
                    </a>
                  </Magnet>
                </div>
              </motion.div>

              {/* Product Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative max-w-6xl mx-auto"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold mb-2">See ScrumKit Retro in Action</h3>
                  <p className="text-gray-400 text-sm">Real-time collaboration for better team retrospectives</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-purple-500/30 blur-3xl -z-10" />
                <div className="rounded-2xl border border-white/10 bg-gray-950/80 backdrop-blur-xl overflow-hidden shadow-2xl">
                  <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="px-3 py-1 rounded-md bg-black/50 text-xs text-gray-400">
                        scrumkit.dev
                      </div>
                    </div>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">What went well</h3>
                          <p className="text-xs text-gray-500">12 items</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-green-500/20">
                          <p className="text-sm mb-2">Shipped the new dashboard on time</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Sarah</span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">8 votes</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                          <p className="text-sm mb-2">Great team collaboration this sprint</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Mike</span>
                            <span className="text-xs text-gray-500">5 votes</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">To improve</h3>
                          <p className="text-xs text-gray-500">8 items</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-orange-500/20">
                          <p className="text-sm mb-2">Code reviews taking too long</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Alex</span>
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">6 votes</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                          <p className="text-sm mb-2">Need better API documentation</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Emma</span>
                            <span className="text-xs text-gray-500">3 votes</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Action items</h3>
                          <p className="text-xs text-gray-500">4 items</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-violet-500/20">
                          <p className="text-sm mb-2">Set up automated PR reminders</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Assigned: Tom</span>
                            <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-1 rounded">In Progress</span>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                          <p className="text-sm mb-2">Create API docs template</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Assigned: Lisa</span>
                            <span className="text-xs text-gray-500">Pending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 px-6 border-t border-white/5">
            <div className="container max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Active Teams", value: "500+", icon: Users },
                  { label: "Ceremonies Run", value: "15k+", icon: BarChart },
                  { label: "GitHub Stars", value: "2.5k+", icon: GithubIcon },
                  { label: "Self-Hosted", value: "100+", icon: Server },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Main Features Showcase */}
          <section className="py-20 px-6 border-t border-white/5">
            <div className="container max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Complete Scrum Toolkit</h2>
                <p className="text-xl text-gray-400">Everything your team needs for successful sprints</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Retro Feature */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative p-8 rounded-2xl bg-gradient-to-br from-green-950/30 to-emerald-950/30 border border-green-500/20 hover:border-green-500/40 transition-all flex flex-col"
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">Available Now</span>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">ScrumKit Retro</h3>
                  <p className="text-gray-400 mb-4">
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
                  <Link href="/boards/new" className="mt-auto">
                    <Button className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20">
                      Start Retrospective
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>

                {/* Planning Poker Feature */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="group relative p-8 rounded-2xl bg-gradient-to-br from-blue-950/30 to-cyan-950/30 border border-blue-500/20 hover:border-blue-500/40 transition-all flex flex-col"
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">Available Now</span>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <CreditCard className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">ScrumKit Poker</h3>
                  <p className="text-gray-400 mb-4">
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
                  <Link href="/poker" className="mt-auto">
                    <Button className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20">
                      Start Planning Poker
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>

                {/* Daily Standup Feature */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="group relative p-8 rounded-2xl bg-gradient-to-br from-orange-950/30 to-amber-950/30 border border-orange-500/20 hover:border-orange-500/40 transition-all flex flex-col"
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium">Coming Soon</span>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <Calendar className="w-7 h-7 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">ScrumKit Daily</h3>
                  <p className="text-gray-400 mb-4">
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
                  <Button className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20 mt-auto" disabled>
                    Coming Soon
                  </Button>
                </motion.div>

                {/* Health Check Feature */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="group relative p-8 rounded-2xl bg-gradient-to-br from-purple-950/30 to-pink-950/30 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col"
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium">Coming Soon</span>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <Activity className="w-7 h-7 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">ScrumKit Health</h3>
                  <p className="text-gray-400 mb-4">
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
                  <Button className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20 mt-auto" disabled>
                    Coming Soon
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Bento Grid */}
          <section className="py-20 px-6" id="features">
            <div className="container max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold mb-4">Built for modern teams</h2>
                <p className="text-xl text-gray-400">Everything you need to run effective retrospectives</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Large feature card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-violet-950/50 to-purple-950/50 border border-violet-500/20"
                >
                  <h3 className="text-2xl font-semibold mb-3">Real-time collaboration</h3>
                  <p className="text-gray-400 mb-6">
                    See updates instantly as your team adds feedback. No refreshing, no waiting.
                  </p>
                  <div className="rounded-lg bg-black/50 p-4 border border-white/5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-400">Sarah is typing...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-400">Mike added a card</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-400">3 people are voting</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Smaller feature cards */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-gray-900 border border-gray-800"
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <BarChart className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Instant analytics</h3>
                  <p className="text-sm text-gray-400">
                    Track team sentiment and improvement trends over time.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-gray-900 border border-gray-800"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Anonymous mode</h3>
                  <p className="text-sm text-gray-400">
                    Enable honest feedback with optional anonymous submissions.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-2xl bg-gray-900 border border-gray-800"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Action tracking</h3>
                  <p className="text-sm text-gray-400">
                    Convert insights into tasks and track progress across sprints.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-2xl bg-gray-900 border border-gray-800"
                >
                  <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-pink-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Team templates</h3>
                  <p className="text-sm text-gray-400">
                    Choose from popular formats or create custom templates.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Integrations Section */}
          <section className="py-20 px-6 border-t border-white/5" id="integrations">
            <div className="container max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold mb-4">Works with your tools</h2>
                <p className="text-xl text-gray-400">Seamlessly integrate with your existing workflow</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#4A154B]/10 flex items-center justify-center mb-4 group-hover:bg-[#4A154B]/20 transition-colors">
                    <MessageSquare className="w-6 h-6 text-[#4A154B]" />
                  </div>
                  <h3 className="font-semibold mb-2">Slack</h3>
                  <p className="text-sm text-gray-400">
                    Post summaries, create action items, daily reminders
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center mb-4 group-hover:bg-black/70 transition-colors">
                    <GithubIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">GitHub</h3>
                  <p className="text-sm text-gray-400">
                    Import issues, create tickets, link PRs to discussions
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#0052CC]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052CC]/20 transition-colors">
                    <GitBranch className="w-6 h-6 text-[#0052CC]" />
                  </div>
                  <h3 className="font-semibold mb-2">Jira</h3>
                  <p className="text-sm text-gray-400">
                    Import stories, sync sprint data, create tickets
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#5E6AD2]/10 flex items-center justify-center mb-4 group-hover:bg-[#5E6AD2]/20 transition-colors">
                    <Hash className="w-6 h-6 text-[#5E6AD2]" />
                  </div>
                  <h3 className="font-semibold mb-2">Linear</h3>
                  <p className="text-sm text-gray-400">
                    Bi-directional sync, cycle integration, issue tracking
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Open Source Section */}
          <section className="py-20 px-6 border-t border-white/5">
            <div className="container max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm mb-6">
                  <Heart className="w-4 h-4 text-violet-400" />
                  <span className="text-violet-400">100% Open Source</span>
                </div>
                <h2 className="text-4xl font-bold mb-4">Built by the community, for the community</h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  ScrumKit is MIT licensed and completely open source. Self-host on your infrastructure or deploy to Vercel with one click.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Server className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Self-Hostable</h3>
                  <p className="text-gray-400">
                    Deploy on your own servers with Docker or Kubernetes. Your data stays yours.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Quick Setup</h3>
                  <p className="text-gray-400">
                    Get started quickly with our comprehensive self-hosting guide. Full control over your data.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
                  <p className="text-gray-400">
                    Join our Discord, contribute on GitHub, and help shape the future of ScrumKit.
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <a href="https://github.com/TheEagleByte/scrumkit" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-gray-800 text-white hover:bg-gray-900">
                    <GithubIcon className="mr-2 h-5 w-5" />
                    Star on GitHub
                  </Button>
                </a>
                {/* TODO: Re-enable Deploy to Vercel button once production-ready
                    Requirements before re-enabling:
                    - All environment variables are properly documented
                    - Supabase setup instructions are clear
                    - Edge Functions are production-ready
                    - Database migrations are handled correctly
                    See issue #78 for details
                <a href="https://vercel.com/new/clone?repository-url=https://github.com/TheEagleByte/scrumkit" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                    <Zap className="mr-2 h-5 w-5" />
                    Deploy to Vercel
                  </Button>
                </a>
                */}
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-6 border-t border-white/5">
            <div className="container max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl font-bold mb-6">
                  Ready to transform your scrum ceremonies?
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  Join 500+ teams using ScrumKit for better sprints. Free and open source forever.
                </p>
                <Magnet padding={100} magnetStrength={2.5}>
                  <Link href="/dashboard">
                    <StarBorder
                      color="#8b5cf6"
                      speed="3s"
                      className="font-medium hover:scale-105 transition-transform duration-200 text-lg"
                    >
                      <span className="flex items-center px-4">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    </StarBorder>
                  </Link>
                </Magnet>
                <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
                  <span>✓ 100% Open Source</span>
                  <span>✓ Self-hostable</span>
                  <span>✓ MIT Licensed</span>
                </div>
              </motion.div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="py-16 px-6 border-t border-white/5">
          <div className="container max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
              {/* Brand Column */}
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src="/logo.svg"
                    alt="ScrumKit"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-semibold text-lg">ScrumKit</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Open source tools for better sprints
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-md bg-violet-500/10 text-xs text-violet-400">MIT License</span>
                  <span className="px-2 py-1 rounded-md bg-green-500/10 text-xs text-green-400">v1.0.0</span>
                </div>
              </div>

              {/* Features Column */}
              <div>
                <h3 className="font-semibold mb-4 text-gray-300">Features</h3>
                <ul className="space-y-2">
                  <li><Link href="/boards" className="text-sm text-gray-400 hover:text-white transition">Retrospectives</Link></li>
                  <li><Link href="/poker" className="text-sm text-gray-400 hover:text-white transition">Planning Poker</Link></li>
                  <li><span className="text-sm text-gray-600">Daily Standups</span></li>
                  <li><span className="text-sm text-gray-600">Health Checks</span></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div>
                <h3 className="font-semibold mb-4 text-gray-300">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="https://github.com/TheEagleByte/scrumkit/wiki" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition">Documentation</a></li>
                  <li><a href="https://github.com/TheEagleByte/scrumkit/blob/main/SELF_HOSTING.md" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition">Self-Hosting Guide</a></li>
                  <li><a href="https://github.com/TheEagleByte/scrumkit/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition">Contributing</a></li>
                  <li><a href="https://github.com/TheEagleByte/scrumkit/releases" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition">Changelog</a></li>
                </ul>
              </div>

              {/* Community Column */}
              <div>
                <h3 className="font-semibold mb-4 text-gray-300">Community</h3>
                <ul className="space-y-2">
                  <li><a href="https://github.com/TheEagleByte/scrumkit" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1">
                    <GithubIcon className="w-3 h-3" /> GitHub
                  </a></li>
                  <li><a href="https://discord.gg/scrumkit" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Discord
                  </a></li>
                  <li><a href="https://twitter.com/scrumkit" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition">Twitter</a></li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h3 className="font-semibold mb-4 text-gray-300">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="/privacy" className="text-sm text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-sm text-gray-400 hover:text-white transition">Terms of Service</a></li>
                  <li><a href="https://github.com/TheEagleByte/scrumkit/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition">License</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  © 2024 ScrumKit. Built with ❤️ by the community.
                </p>
                <div className="flex items-center gap-4">
                  <a href="https://github.com/TheEagleByte/scrumkit" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition">
                    <GithubIcon className="w-5 h-5" />
                  </a>
                  <a href="https://discord.gg/scrumkit" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition">
                    <MessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
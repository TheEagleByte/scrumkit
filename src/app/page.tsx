"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, BarChart, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-white/5">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg" aria-hidden="true" />
            <span className="font-semibold text-lg">ScrumKit</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-400 hover:text-white transition">Features</Link>
          </div>
          <Link href="/retro">
            <Button className="bg-white text-black hover:bg-gray-200 font-medium" aria-label="Start using ScrumKit for free">
              Start Free
            </Button>
          </Link>
        </div>
      </nav>

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm mb-6">
              <Zap className="w-3 h-3" />
              <span>Trusted by 500+ teams worldwide</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
              Retrospectives that
              <span className="block bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                actually work
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Run engaging team retrospectives in minutes, not hours.
              Collect feedback, vote on priorities, and track improvements—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/retro">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 h-12 text-base font-medium">
                  Start Your First Retro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-gray-800 text-white hover:bg-gray-900 px-8 h-12 text-base">
                See How It Works
              </Button>
            </div>
          </motion.div>

          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-6xl mx-auto"
          >
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
                    retrospective.scrumkit.com
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
              { label: "Retros Run", value: "10k+", icon: BarChart },
              { label: "Avg Setup Time", value: "30s", icon: Clock },
              { label: "Team Satisfaction", value: "95%", icon: Shield },
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

      {/* CTA Section */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Ready to improve your team&apos;s retrospectives?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join 500+ teams already using ScrumKit. No credit card required.
            </p>
            <Link href="/retro">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-10 h-14 text-lg font-medium">
                Start Your First Retro
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
              <span>✓ Free forever for small teams</span>
              <span>✓ No credit card required</span>
              <span>✓ Setup in 30 seconds</span>
            </div>
          </motion.div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg" aria-hidden="true" />
              <span className="font-semibold text-lg">ScrumKit</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 ScrumKit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
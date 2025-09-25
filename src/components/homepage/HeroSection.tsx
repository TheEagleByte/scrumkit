"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { GradientBlob } from "@/components/animations/GradientBlob";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <GradientBlob className="top-20 left-20 w-96 h-96" delay={0} />
        <GradientBlob className="bottom-20 right-20 w-96 h-96" delay={2} />
        <GradientBlob className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" delay={4} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-5 grid-pattern opacity-20" />

      <div className="container max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* New Feature Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <Link
              href="/retro"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/30 transition-colors group"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-200">New: AI-Powered Insights</span>
              <ArrowRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold">
              <AnimatedText
                text="Sprint Retrospectives"
                className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
              />
              <br />
              <AnimatedText
                text="That Teams Love"
                className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent"
                delay={0.3}
              />
            </h1>

            <motion.p
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
            >
              Run engaging retrospectives that drive continuous improvement.
              Collect feedback, vote on issues, and track action items - all in real-time.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/retro">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
              >
                <Users className="mr-2 h-5 w-5" />
                Start Free Retro
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-xl border-white/20 hover:border-white/30 hover:bg-white/5"
              >
                View Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border-2 border-background"
                  />
                ))}
              </div>
              <span>500+ Teams</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">●</span>
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">★★★★★</span>
              <span>4.9/5 Rating</span>
            </div>
          </motion.div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl" />
            <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-2 shadow-2xl">
              <div className="rounded-xl bg-gradient-to-br from-gray-900 to-black p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["What went well", "What could be improved", "Action items"].map((title, i) => (
                    <div key={title} className="space-y-3">
                      <h3 className="text-sm font-semibold text-white/80">{title}</h3>
                      <div className="space-y-2">
                        {[1,2].map((j) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.6 + (i * 0.1) + (j * 0.1) }}
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <div className="h-2 bg-white/20 rounded w-3/4 mb-2" />
                            <div className="h-2 bg-white/10 rounded w-1/2" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
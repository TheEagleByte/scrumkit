"use client";

import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { Rocket, Users, Vote, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Rocket,
    title: "Create a Board",
    description: "Start a new retrospective in seconds. Choose a template or customize your own columns.",
    color: "from-purple-500 to-purple-600",
  },
  {
    number: "02",
    icon: Users,
    title: "Invite Your Team",
    description: "Share a link with your team. No sign-up required for participants to join and contribute.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    icon: Vote,
    title: "Collect & Vote",
    description: "Team members add feedback cards and vote on the most important issues to address.",
    color: "from-green-500 to-emerald-500",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Create Actions",
    description: "Turn insights into action items. Assign owners and track progress in your next sprint.",
    color: "from-orange-500 to-red-500",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 relative" id="how-it-works">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              How It Works
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Get your team up and running with effective retrospectives in minutes
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting Line - Hidden on mobile */}
          <motion.div
            className="absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 hidden lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ originX: 0 }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <GlassCard className="h-full text-center relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <motion.div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-white font-bold text-sm">
                        {step.number}
                      </span>
                    </motion.div>
                  </div>

                  <div className="pt-8 space-y-4">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} p-3 shadow-lg mx-auto`}
                    >
                      <Icon className="w-full h-full text-white" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Animated Dot Behind Card */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-500 hidden lg:block"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl" />
            <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-1 shadow-2xl">
              <div className="rounded-xl bg-gradient-to-br from-gray-900 to-black p-8">
                <div className="flex items-center justify-center space-x-4">
                  <motion.div
                    className="w-32 h-20 bg-purple-500/20 rounded-lg border border-purple-500/30"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <motion.div
                    animate={{ x: [0, 20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-purple-400 text-2xl">→</span>
                  </motion.div>
                  <motion.div
                    className="w-32 h-20 bg-blue-500/20 rounded-lg border border-blue-500/30"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Drag & Drop cards between columns
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
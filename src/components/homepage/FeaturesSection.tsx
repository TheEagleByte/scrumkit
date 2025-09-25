"use client";

import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  MessageSquare,
  Vote,
  Users2,
  Target,
  Shield,
  Zap,
  BarChart3,
  Share2,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Collaboration",
    description: "Team members can add, edit, and react to feedback instantly with live updates.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Vote,
    title: "Democratic Voting",
    description: "Let the team vote on what matters most. Prioritize issues democratically.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users2,
    title: "Anonymous Feedback",
    description: "Enable honest feedback with optional anonymous mode for sensitive topics.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Target,
    title: "Action Item Tracking",
    description: "Convert insights into actionable tasks with built-in tracking and assignments.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade security with end-to-end encryption for all your data.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with instant load times and zero lag collaboration.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: BarChart3,
    title: "Team Analytics",
    description: "Track team sentiment over time with beautiful insights and trends.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share retro results with stakeholders via secure links or PDF exports.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Palette,
    title: "Custom Templates",
    description: "Choose from various retro formats or create your own custom templates.",
    gradient: "from-purple-500 to-indigo-500",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4" id="features">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Powerful features to make your retrospectives engaging and actionable
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="h-full group">
                  <div className="flex flex-col space-y-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-2.5 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      <Icon className="w-full h-full text-white" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <motion.div
                      className="flex items-center gap-2 text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ x: 5 }}
                    >
                      <span>Learn more</span>
                      <span>→</span>
                    </motion.div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
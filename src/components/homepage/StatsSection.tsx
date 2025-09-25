"use client";

import { motion } from "motion/react";
import { CountUp } from "@/components/animations/CountUp";
import { GlassCard } from "@/components/ui/glass-card";
import { Users, Heart, Clock, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 500,
    suffix: "+",
    label: "Active Teams",
    description: "Teams using ScrumKit daily",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Heart,
    value: 95,
    suffix: "%",
    label: "Team Satisfaction",
    description: "Love our retrospective format",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Clock,
    value: 10,
    suffix: "min",
    label: "Average Setup",
    description: "From start to first feedback",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    value: 40,
    suffix: "%",
    label: "Productivity Boost",
    description: "Improvement in team efficiency",
    color: "from-green-500 to-emerald-500",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 px-4" id="stats">
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={stat.label} delay={index * 0.1}>
                <div className="flex flex-col space-y-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} p-2.5 shadow-lg`}>
                    <Icon className="w-full h-full text-white" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-white">
                      <CountUp
                        end={stat.value}
                        suffix={stat.suffix}
                        duration={2}
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      {stat.label}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>

                  <motion.div
                    className="h-1 bg-gradient-to-r from-white/10 to-white/5 rounded-full overflow-hidden"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    style={{ originX: 0 }}
                  >
                    <motion.div
                      className={`h-full bg-gradient-to-r ${stat.color}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: stat.value / 100 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.7 + index * 0.1 }}
                      style={{ originX: 0 }}
                    />
                  </motion.div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
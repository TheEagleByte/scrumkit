"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { GradientBlob } from "@/components/animations/GradientBlob";

export function CTASection() {
  return (
    <section className="py-32 px-4 relative overflow-hidden" id="cta">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <GradientBlob className="top-0 left-0 w-96 h-96 opacity-30" delay={0} />
        <GradientBlob className="bottom-0 right-0 w-96 h-96 opacity-30" delay={2} />
      </div>

      {/* Gradient Background */}
      <motion.div
        className="absolute inset-0 -z-5"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="container max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Icon */}
          <motion.div
            className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap className="w-8 h-8 text-purple-400" />
          </motion.div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Start Your First Retro
              </span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent inline-block"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              >
                In Under 30 Seconds
              </motion.span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of teams already running better retrospectives.
              No credit card required. Free forever for small teams.
            </p>
          </div>

          {/* Features List */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            {[
              "✓ No credit card required",
              "✓ Free for up to 10 users",
              "✓ Setup in 30 seconds",
              "✓ Cancel anytime",
            ].map((feature, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                {feature}
              </motion.span>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/retro">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-7 text-lg rounded-xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-7 text-lg rounded-xl border-white/20 hover:border-white/30 hover:bg-white/5"
              >
                View Pricing
              </Button>
            </Link>
          </motion.div>

          {/* Bottom Trust Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="pt-8"
          >
            <p className="text-sm text-muted-foreground">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-4 opacity-50">
              {["TechCorp", "StartupXYZ", "DesignStudio", "CloudSoft", "DataCo"].map((company) => (
                <span key={company} className="text-white/60 font-semibold">
                  {company}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
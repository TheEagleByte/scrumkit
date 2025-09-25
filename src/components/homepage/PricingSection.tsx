"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for small teams getting started",
    features: [
      { text: "Up to 10 team members", included: true },
      { text: "3 retrospectives per month", included: true },
      { text: "Basic templates", included: true },
      { text: "Export to PDF", included: true },
      { text: "Email support", included: true },
      { text: "Advanced analytics", included: false },
      { text: "Custom templates", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: { monthly: 12, annual: 10 },
    description: "For growing teams that need more",
    features: [
      { text: "Unlimited team members", included: true },
      { text: "Unlimited retrospectives", included: true },
      { text: "All templates included", included: true },
      { text: "Export to PDF & CSV", included: true },
      { text: "Priority email support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom templates", included: true },
      { text: "24/7 chat support", included: false },
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: { monthly: null, annual: null },
    description: "Custom solutions for large organizations",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "SSO & SAML", included: true },
      { text: "Advanced security", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "24/7 phone & chat support", included: true },
      { text: "Custom contracts", included: true },
      { text: "SLA guarantee", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <section className="py-20 px-4" id="pricing">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Choose the perfect plan for your team. Always free to start.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-4 p-1 bg-white/5 rounded-lg border border-white/10"
          >
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-4 py-2 rounded-md transition-all",
                billingPeriod === "monthly"
                  ? "bg-purple-500 text-white"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={cn(
                "px-4 py-2 rounded-md transition-all",
                billingPeriod === "annual"
                  ? "bg-purple-500 text-white"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              Annual
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <GlassCard
                className={cn(
                  "h-full",
                  plan.popular && "border-purple-500/50 bg-purple-500/5"
                )}
              >
                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    {plan.price.monthly !== null ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">
                            ${billingPeriod === "monthly" ? plan.price.monthly : plan.price.annual}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {billingPeriod === "annual" && (
                          <p className="text-xs text-green-400">
                            Billed annually (${plan.price.annual * 12}/year)
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-white">Custom Pricing</div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            feature.included ? "text-white/80" : "text-muted-foreground line-through"
                          )}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={cn(
                      "w-full py-6 text-base rounded-xl",
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/25"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
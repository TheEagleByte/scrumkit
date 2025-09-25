"use client";

import { motion } from "motion/react";

const testimonials = {
  row1: [
    {
      text: "ScrumKit transformed our retrospectives. The team is more engaged than ever!",
      author: "Sarah Chen",
      role: "Engineering Manager",
      company: "TechCorp",
    },
    {
      text: "Finally, a retro tool that doesn't feel like a chore. Our team loves it!",
      author: "Mike Johnson",
      role: "Scrum Master",
      company: "StartupXYZ",
    },
    {
      text: "The voting feature helps us focus on what really matters. Game changer!",
      author: "Emma Davis",
      role: "Product Owner",
      company: "FinanceApp",
    },
    {
      text: "Anonymous feedback option increased participation by 70% in our team.",
      author: "Alex Rivera",
      role: "Team Lead",
      company: "DesignStudio",
    },
  ],
  row2: [
    {
      text: "Action items tracking finally works! We're actually improving sprint by sprint.",
      author: "James Wilson",
      role: "Developer",
      company: "CloudSoft",
    },
    {
      text: "The analytics help us spot patterns we never noticed before. Invaluable!",
      author: "Lisa Zhang",
      role: "Agile Coach",
      company: "Enterprise Inc",
    },
    {
      text: "Setup takes literally 30 seconds. No more excuses for skipping retros!",
      author: "Tom Brown",
      role: "Tech Lead",
      company: "MobileFirst",
    },
    {
      text: "Best retrospective tool we've tried. Simple, effective, and beautiful.",
      author: "Nina Patel",
      role: "VP Engineering",
      company: "DataCo",
    },
  ],
  row3: [
    {
      text: "Remote team retrospectives are now as good as in-person. Maybe better!",
      author: "Carlos Mendez",
      role: "Remote Team Lead",
      company: "GlobalTech",
    },
    {
      text: "The templates save us so much time. We can focus on discussion, not setup.",
      author: "Rachel Green",
      role: "Project Manager",
      company: "WebAgency",
    },
    {
      text: "Export to PDF feature is perfect for sharing with stakeholders.",
      author: "David Kim",
      role: "Delivery Manager",
      company: "ConsultingPro",
    },
    {
      text: "Our team velocity improved 40% since we started using ScrumKit.",
      author: "Sophie Turner",
      role: "CTO",
      company: "FastScale",
    },
  ],
};

function TestimonialCard({
  text,
  author,
  role,
  company,
}: {
  text: string;
  author: string;
  role: string;
  company: string;
}) {
  return (
    <div className="flex-none w-[400px] px-3">
      <div className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors">
        <p className="text-sm text-white/80 mb-4 leading-relaxed">{text}</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
          <div>
            <p className="text-sm font-semibold text-white">{author}</p>
            <p className="text-xs text-muted-foreground">
              {role} at {company}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 overflow-hidden" id="testimonials">
      <div className="container max-w-7xl mx-auto px-4 mb-12">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Loved by Teams Worldwide
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            See what teams are saying about ScrumKit
          </motion.p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Row 1 - Scrolls Left */}
        <motion.div
          className="flex"
          animate={{ x: [0, -2000] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...testimonials.row1, ...testimonials.row1].map((testimonial, i) => (
            <TestimonialCard key={i} {...testimonial} />
          ))}
        </motion.div>

        {/* Row 2 - Scrolls Right */}
        <motion.div
          className="flex"
          animate={{ x: [-2000, 0] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...testimonials.row2, ...testimonials.row2].map((testimonial, i) => (
            <TestimonialCard key={i} {...testimonial} />
          ))}
        </motion.div>

        {/* Row 3 - Scrolls Left */}
        <motion.div
          className="flex"
          animate={{ x: [0, -2000] }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...testimonials.row3, ...testimonials.row3].map((testimonial, i) => (
            <TestimonialCard key={i} {...testimonial} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
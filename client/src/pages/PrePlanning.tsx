import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Heart, Clock, X } from "lucide-react";
import { useState } from "react";

const benefits = [
  {
    icon: Shield,
    title: "Protect Your Family",
    description: "Spare your loved ones from making difficult decisions during an emotionally overwhelming time.",
  },
  {
    icon: Heart,
    title: "Honor Your Wishes",
    description: "Ensure every detail of your service reflects your life, values, and personal legacy.",
  },
  {
    icon: Clock,
    title: "Plan at Your Pace",
    description: "Work through arrangements thoughtfully, without urgency, and update them as your wishes evolve.",
  },
];

export default function PrePlanning() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <PublicLayout>
        <section className="relative min-h-[420px] flex items-center justify-center overflow-hidden bg-background pt-32 pb-20">
          <div className="absolute inset-0 bg-[url('/assets/texture-marble.png')] opacity-5 mix-blend-overlay" />
          <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mx-auto w-12 h-px bg-primary mb-8" />
              <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Peace of Mind</p>
              <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 leading-tight">
                Pre-Need Planning
              </h1>
              <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
                One of the most meaningful gifts you can give your family is a plan. Pre-arranging your
                funeral removes uncertainty, preserves your wishes, and provides comfort to those you love.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-primary/30 mb-4">
                    <b.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{b.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-background text-center">
          <div className="container mx-auto px-6">
            <div className="mx-auto w-8 h-px bg-primary mb-8" />
            <h2 className="font-serif text-3xl text-foreground mb-4">Ready to Begin?</h2>
            <p className="text-muted-foreground text-sm font-light max-w-md mx-auto mb-10">
              Complete our pre-need intake form and a member of our team will guide you through every step at your own pace.
            </p>
            <Button
              size="lg"
              onClick={() => setFormOpen(true)}
              data-testid="button-preneed-get-started"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm tracking-widest uppercase px-10 py-6 rounded-none"
            >
              Get Started
            </Button>
          </div>
        </section>
      </PublicLayout>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            key="preneed-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <img src="/assets/logo-crest.png" alt="Norwert Hills" className="h-8 w-8 opacity-80" />
                <span className="font-serif text-lg tracking-wider uppercase text-foreground">Pre-Need Planning</span>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                data-testid="button-preneed-close"
                className="text-muted-foreground hover:text-foreground transition-colors p-2"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src="https://www.funeraldecisionscrm.com/Form3.aspx?Key=6C3E9CF30B4C0578602724A8A6FBAE40"
                title="Pre-Need Planning Form"
                data-testid="iframe-preneed-form"
                className="w-full h-full"
                style={{ border: "none", display: "block" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Shield, Heart, Clock } from "lucide-react";

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
  return (
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

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10 max-w-xl mx-auto">
            <div className="mx-auto w-8 h-px bg-primary mb-6" />
            <h2 className="font-serif text-3xl text-foreground mb-3">Begin Your Plan</h2>
            <p className="text-sm text-muted-foreground font-light">
              Complete the form below to get started. A member of our team will follow up to walk you
              through every step at your own pace.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-lg bg-secondary/40 border border-white/10 rounded-sm overflow-hidden shadow-xl">
              <iframe
                src="https://www.funeraldecisionscrm.com/Form3.aspx?Key=6C3E9CF30B4C0578602724A8A6FBAE40"
                title="Pre-Need Planning Form"
                data-testid="iframe-preneed-form"
                className="w-full"
                style={{ height: "640px", border: "none", display: "block" }}
              />
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}

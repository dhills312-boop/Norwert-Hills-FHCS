
import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Contact() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">Reach Out</span>
            <h1 className="font-serif text-5xl md:text-6xl mb-6 text-foreground tracking-tight leading-[1.1]">
               We are here to <br/>
               <span className="italic text-primary/90">guide you</span>
            </h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Available 24 hours a day, 7 days a week. Our compassionate directors are always ready to assist you in your time of need.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Phone className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-widest">Phone</span>
                  </div>
                  <p className="text-xl font-serif">(985) 318-7574</p>
                  <p className="text-sm text-muted-foreground font-light">Available 24/7 for immediate assistance</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Mail className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-widest">Email</span>
                  </div>
                  <p className="text-xl font-serif">norwert@thenhfcs.com</p>
                  <p className="text-sm text-muted-foreground font-light">For inquiries and pre-planning</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest">Location</span>
                </div>
                <p className="text-xl font-serif">985 W. Thomas, Hammond, LA 70401</p>
                <div className="aspect-video w-full overflow-hidden rounded-sm border border-white/5 grayscale">
                  <iframe
                    title="Google Map"
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      "1601 W Thomas, Hammond, LA 70401"
                    )}&output=embed`}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                 <div className="flex items-center gap-3 text-primary">
                    <Clock className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-widest">Office Hours</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm font-light text-muted-foreground max-w-xs">
                    <span>Mon - Fri</span>
                    <span>9:00 AM - 5:00 PM</span>
                    <span>Sat - Sun</span>
                    <span>By Appointment</span>
                  </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-card p-8 md:p-12 border border-white/5 rounded-sm relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
              <h2 className="font-serif text-3xl mb-8">Send a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
                    <Input id="name" className="bg-background/50 border-white/10" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                    <Input id="email" type="email" className="bg-background/50 border-white/10" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-xs uppercase tracking-widest text-muted-foreground">Subject</Label>
                  <Input id="subject" className="bg-background/50 border-white/10" placeholder="Pre-planning inquiry" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Message</Label>
                  <Textarea id="message" className="bg-background/50 border-white/10 min-h-[150px]" placeholder="How can we help you?" />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase text-xs tracking-[0.2em] py-6">
                   Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

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
                  <p className="text-xl font-serif" data-testid="text-phone">(985) 318-7574</p>
                  <p className="text-sm text-muted-foreground font-light">Available 24/7 for immediate assistance</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Mail className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-widest">Email</span>
                  </div>
                  <p className="text-xl font-serif" data-testid="text-email">norwert@thenhfcs.com</p>
                  <p className="text-sm text-muted-foreground font-light">For inquiries and pre-planning</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest">Location</span>
                </div>
                <p className="text-xl font-serif" data-testid="text-address">985 W. Thomas, Hammond, LA 70401</p>
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
              
              {submitted ? (
                <div className="text-center py-12 space-y-6">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                  <h2 className="font-serif text-3xl" data-testid="text-success">Message Sent</h2>
                  <p className="text-muted-foreground font-light max-w-sm mx-auto">
                    Thank you for reaching out. A member of our team will respond to your message within 24 hours.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline" className="border-white/10" data-testid="button-send-another">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-3xl mb-8">Send a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
                        <Input 
                          id="name" 
                          data-testid="input-name"
                          className="bg-background/50 border-white/10" 
                          placeholder="John Doe" 
                          value={form.name}
                          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                        <Input 
                          id="email" 
                          data-testid="input-email"
                          type="email" 
                          className="bg-background/50 border-white/10" 
                          placeholder="john@example.com" 
                          value={form.email}
                          onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs uppercase tracking-widest text-muted-foreground">Subject</Label>
                      <Input 
                        id="subject" 
                        data-testid="input-subject"
                        className="bg-background/50 border-white/10" 
                        placeholder="Pre-planning inquiry" 
                        value={form.subject}
                        onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Message</Label>
                      <Textarea 
                        id="message" 
                        data-testid="input-message"
                        className="bg-background/50 border-white/10 min-h-[150px]" 
                        placeholder="How can we help you?" 
                        value={form.message}
                        onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      data-testid="button-submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase text-xs tracking-[0.2em] py-6"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Send Message
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

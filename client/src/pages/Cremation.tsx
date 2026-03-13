import { PublicLayout } from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { MapPin, Loader2, CheckCircle, AlertCircle, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming","District of Columbia",
];

type Step = "zip" | "out-of-area" | "intake" | "confirmation";

interface ServiceAreaResult {
  inServiceArea: boolean;
  distanceMiles: number;
}

interface CremationOrderResult {
  id: string;
  orderToken: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  decedentName: string;
  stateOfDeath: string;
}

export default function Cremation() {
  const [step, setStep] = useState<Step>("zip");
  const [zipCode, setZipCode] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [orderResult, setOrderResult] = useState<CremationOrderResult | null>(null);
  const [intakeForm, setIntakeForm] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    decedentName: "",
    stateOfDeath: "",
  });
  const { toast } = useToast();

  function parseErrorMessage(err: Error, fallback: string): string {
    try {
      const text = err.message;
      const colonIdx = text.indexOf(": ");
      if (colonIdx > -1) {
        const parsed = JSON.parse(text.slice(colonIdx + 2));
        if (parsed?.message) return parsed.message;
      }
    } catch {}
    return fallback;
  }

  const checkAreaMutation = useMutation({
    mutationFn: async (zip: string) => {
      const res = await apiRequest("POST", "/api/cremation/check-service-area", { zip });
      return res.json() as Promise<ServiceAreaResult>;
    },
    onSuccess: (data) => {
      if (data.inServiceArea) {
        setStep("intake");
      } else {
        setStep("out-of-area");
      }
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: parseErrorMessage(err, "Could not check service area."), variant: "destructive" });
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: async (data: { email: string; zip: string }) => {
      const res = await apiRequest("POST", "/api/cremation/waitlist", data);
      return res.json();
    },
    onSuccess: () => {
      setWaitlistSubmitted(true);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not join waitlist. Please try again.", variant: "destructive" });
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: typeof intakeForm) => {
      const res = await apiRequest("POST", "/api/cremation/orders", data);
      return res.json() as Promise<CremationOrderResult>;
    },
    onSuccess: (data) => {
      setOrderResult(data);
      setStep("confirmation");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: parseErrorMessage(err, "Could not submit your request. Please try again."), variant: "destructive" });
    },
  });

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(zipCode)) {
      toast({ title: "Invalid zip code", description: "Please enter a valid 5-digit zip code.", variant: "destructive" });
      return;
    }
    checkAreaMutation.mutate(zipCode);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    waitlistMutation.mutate({ email: waitlistEmail, zip: zipCode });
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    orderMutation.mutate(intakeForm);
  };

  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary text-xs uppercase tracking-[0.3em] mb-4 block">Cremation Services</span>
            <h1 className="font-serif text-5xl md:text-6xl mb-6 text-foreground tracking-tight leading-[1.1]">
              Begin the <br />
              <span className="italic text-primary/90">arrangement process</span>
            </h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              We understand this is a difficult time. Our online intake process is designed to be simple and respectful, so you can begin arrangements from the comfort of your home.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {step === "zip" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-card p-8 md:p-12 border border-white/5 rounded-sm"
              >
                <div className="flex items-center gap-3 text-primary mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest">Step 1 of 2</span>
                </div>
                <h2 className="font-serif text-3xl mb-3" data-testid="text-step-title">Check Service Availability</h2>
                <p className="text-muted-foreground text-sm font-light mb-8">We currently serve families within the Greater North Shores area of Louisiana. Enter your zip code to check if we can serve your area.</p>
                <form onSubmit={handleZipSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-xs uppercase tracking-widest text-muted-foreground">Zip Code</Label>
                    <Input
                      id="zipCode"
                      data-testid="input-zip-code"
                      className="bg-background/50 border-white/10 text-lg tracking-wider text-center max-w-[200px]"
                      placeholder="70401"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      maxLength={5}
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="button-check-availability"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase text-xs tracking-[0.2em] py-6 px-8"
                    disabled={checkAreaMutation.isPending || zipCode.length !== 5}
                  >
                    {checkAreaMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Check Availability
                  </Button>
                </form>
              </motion.div>
            )}

            {step === "out-of-area" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-card p-8 md:p-12 border border-white/5 rounded-sm"
              >
                {!waitlistSubmitted ? (
                  <>
                    <div className="flex items-center gap-3 text-amber-400 mb-6">
                      <AlertCircle className="w-6 h-6" />
                      <span className="text-sm font-light">Outside Current Service Area</span>
                    </div>
                    <h2 className="font-serif text-3xl mb-3" data-testid="text-out-of-area">We Haven't Expanded There Yet</h2>
                    <p className="text-muted-foreground text-sm font-light mb-8 leading-relaxed">
                      We appreciate your interest in our services. Unfortunately, we don't currently serve the {zipCode} area. We are actively working to expand our service area and would love to notify you when we do.
                    </p>
                    <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="waitlistEmail" className="text-xs uppercase tracking-widest text-muted-foreground">
                          Email Address
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            id="waitlistEmail"
                            data-testid="input-waitlist-email"
                            type="email"
                            className="bg-background/50 border-white/10"
                            placeholder="your@email.com"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            required
                          />
                          <Button
                            type="submit"
                            data-testid="button-join-waitlist"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase text-xs tracking-[0.2em] whitespace-nowrap"
                            disabled={waitlistMutation.isPending}
                          >
                            {waitlistMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                            Notify Me
                          </Button>
                        </div>
                      </div>
                    </form>
                    <button
                      onClick={() => { setStep("zip"); setZipCode(""); }}
                      className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      data-testid="button-try-different-zip"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Try a different zip code
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-6">
                    <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                    <h2 className="font-serif text-3xl" data-testid="text-waitlist-success">You're on the List</h2>
                    <p className="text-muted-foreground font-light max-w-sm mx-auto">
                      We've added your email to our notification list. We'll reach out as soon as our services expand to your area.
                    </p>
                    <Button
                      onClick={() => { setStep("zip"); setZipCode(""); setWaitlistEmail(""); setWaitlistSubmitted(false); }}
                      variant="outline"
                      className="border-white/10"
                      data-testid="button-start-over"
                    >
                      Start Over
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {step === "intake" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-card p-8 md:p-12 border border-white/5 rounded-sm"
              >
                <div className="flex items-center gap-3 text-primary mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-widest">Step 2 of 2</span>
                </div>
                <h2 className="font-serif text-3xl mb-3" data-testid="text-intake-title">Cremation Intake</h2>
                <p className="text-muted-foreground text-sm font-light mb-8 leading-relaxed">
                  Please provide the following information to begin the arrangement process. A member of our team will follow up with you regarding authorization paperwork.
                </p>
                <form onSubmit={handleIntakeSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg text-primary/80 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactName" className="text-xs uppercase tracking-widest text-muted-foreground">Your Full Name</Label>
                        <Input
                          id="contactName"
                          data-testid="input-contact-name"
                          className="bg-background/50 border-white/10"
                          placeholder="Jane Doe"
                          value={intakeForm.contactName}
                          onChange={(e) => setIntakeForm((p) => ({ ...p, contactName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                        <Input
                          id="contactEmail"
                          data-testid="input-contact-email"
                          type="email"
                          className="bg-background/50 border-white/10"
                          placeholder="jane@example.com"
                          value={intakeForm.contactEmail}
                          onChange={(e) => setIntakeForm((p) => ({ ...p, contactEmail: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="contactPhone" className="text-xs uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                      <Input
                        id="contactPhone"
                        data-testid="input-contact-phone"
                        type="tel"
                        className="bg-background/50 border-white/10 max-w-xs"
                        placeholder="(985) 555-1234"
                        value={intakeForm.contactPhone}
                        onChange={(e) => setIntakeForm((p) => ({ ...p, contactPhone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-6 space-y-4">
                    <h3 className="font-serif text-lg text-primary/80 mb-4">Decedent Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="decedentName" className="text-xs uppercase tracking-widest text-muted-foreground">Decedent's Full Name</Label>
                        <Input
                          id="decedentName"
                          data-testid="input-decedent-name"
                          className="bg-background/50 border-white/10"
                          placeholder="Full legal name"
                          value={intakeForm.decedentName}
                          onChange={(e) => setIntakeForm((p) => ({ ...p, decedentName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stateOfDeath" className="text-xs uppercase tracking-widest text-muted-foreground">State of Death</Label>
                        <select
                          id="stateOfDeath"
                          data-testid="select-state-of-death"
                          className="w-full bg-background/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={intakeForm.stateOfDeath}
                          onChange={(e) => setIntakeForm((p) => ({ ...p, stateOfDeath: e.target.value }))}
                          required
                        >
                          <option value="">Select state</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => { setStep("zip"); setZipCode(""); }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                      data-testid="button-back-to-zip"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <Button
                      type="submit"
                      data-testid="button-submit-intake"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 uppercase text-xs tracking-[0.2em] py-6"
                      disabled={orderMutation.isPending}
                    >
                      {orderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                      Submit Request
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === "confirmation" && orderResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-card p-8 md:p-12 border border-white/5 rounded-sm text-center"
              >
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="font-serif text-3xl mb-4" data-testid="text-confirmation-title">Request Received</h2>
                <p className="text-muted-foreground font-light max-w-lg mx-auto mb-8 leading-relaxed">
                  Thank you for trusting Norwert Hills with your family's care. Your cremation arrangement request has been received and a member of our team will be in touch shortly.
                </p>

                <div className="bg-background/50 border border-white/5 rounded-sm p-6 max-w-md mx-auto mb-8">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Your Reference Number</p>
                  <p className="font-mono text-2xl text-primary tracking-wider" data-testid="text-order-token">{orderResult.orderToken}</p>
                </div>

                <div className="bg-background/30 border border-white/5 rounded-sm p-6 max-w-md mx-auto mb-8 text-left space-y-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 text-center">Summary</p>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Contact:</span>
                    <span data-testid="text-summary-contact">{orderResult.contactName}</span>
                    <span className="text-muted-foreground">Email:</span>
                    <span data-testid="text-summary-email">{orderResult.contactEmail}</span>
                    <span className="text-muted-foreground">Phone:</span>
                    <span data-testid="text-summary-phone">{orderResult.contactPhone}</span>
                    <span className="text-muted-foreground">Decedent:</span>
                    <span data-testid="text-summary-decedent">{orderResult.decedentName}</span>
                    <span className="text-muted-foreground">State:</span>
                    <span data-testid="text-summary-state">{orderResult.stateOfDeath}</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-sm p-6 max-w-md mx-auto">
                  <h3 className="font-serif text-lg mb-3">What Happens Next</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left font-light">
                    <li className="flex gap-3">
                      <span className="text-primary font-medium shrink-0">1.</span>
                      A member of our team will contact you to confirm the details.
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-medium shrink-0">2.</span>
                      We will send you the necessary authorization forms to complete.
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-medium shrink-0">3.</span>
                      Please keep your reference number <strong className="text-foreground">{orderResult.orderToken}</strong> for your records.
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

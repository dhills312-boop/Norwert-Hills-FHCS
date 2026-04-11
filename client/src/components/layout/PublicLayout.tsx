
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/cremation", label: "Cremation" },
    { href: "/pre-planning", label: "Pre-Planning" },
    { href: "/about", label: "Our Story" },
    { href: "/resources", label: "Resources" },
    { href: "/contact", label: "Contact" },
    { href: "/staff/login", label: "Staff Portal" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent",
          isScrolled ? "bg-background/90 backdrop-blur-md border-white/5 py-4" : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 w-[260px] shrink-0">
            <img 
              src="/assets/logo-crest.png" 
              alt="Norwert Hills Crest" 
              className="h-12 w-12 object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-wider whitespace-nowrap text-foreground uppercase leading-none">Norwert Hills</span>
              <span className="text-[10px] tracking-[0.2em] text-primary/80 uppercase mt-1">Funeral and Cremation Services</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm tracking-widest uppercase transition-colors hover:text-primary relative whitespace-nowrap",
                  location === link.href ? "text-primary" : "text-muted-foreground",
                  location === link.href && "after:content-[''] after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-[1px] after:bg-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground uppercase text-xs tracking-widest ml-4">
                Contact Us
              </Button>
            </Link>
          </nav>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-white/10 p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-lg font-serif transition-colors",
                  location === link.href ? "text-primary italic" : "text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-grow pt-0">
        {children}
      </main>

      <footer className="bg-secondary pt-20 pb-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <img src="/assets/logo-crest.png" alt="Norwert Hills" className="h-20 w-20 mx-auto opacity-80" />
              <p className="text-muted-foreground text-sm leading-relaxed">
                Honoring lives with dignity, grace, and unparalleled attention to detail.
              </p>
            </div>
            
            <div>
              <h4 className="font-serif text-lg text-primary mb-6">Services</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/services/traditional-ceremony" className="hover:text-foreground transition-colors">Traditional Ceremonies</Link></li>
                <li><Link href="/services/cremation-services" className="hover:text-foreground transition-colors">Cremation Services</Link></li>
                <li><Link href="/services/bespoke-memorials" className="hover:text-foreground transition-colors">Bespoke Memorials</Link></li>
                <li><Link href="/pre-planning" className="hover:text-foreground transition-colors">Pre-Planning</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg text-primary mb-6">Contact</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>(985)318-7574</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>1601 W Thomas<br/>Hammond, LA 70401</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-lg text-primary mb-6">Newsletter</h4>
              <p className="text-xs text-muted-foreground mb-4">Subscribe for updates and resources.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="bg-background/50 border border-white/10 px-3 py-2 text-sm w-full focus:outline-none focus:border-primary/50"
                />
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Join</Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
            <p>&copy; 2026 Norwert Hills Funeral and Cremation Services. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

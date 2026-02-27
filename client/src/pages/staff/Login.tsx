import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { login, isLoggingIn, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/staff/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
      setLocation("/staff/dashboard");
    } catch (err: any) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/assets/texture-marble.png')] opacity-10" />
      <Card className="w-full max-w-md mx-6 border-white/10 bg-card/80 backdrop-blur-md relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-serif text-3xl">Staff Portal</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" data-testid="label-email">Email</Label>
              <Input 
                id="email" 
                data-testid="input-email"
                type="email" 
                placeholder="name@thenhfcs.com" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="bg-background/50 border-white/10 focus:border-primary"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" data-testid="label-password">Password</Label>
              <Input 
                id="password" 
                data-testid="input-password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="bg-background/50 border-white/10 focus:border-primary"
                autoComplete="current-password"
              />
              {error && <p className="text-destructive text-sm" data-testid="text-error">{error}</p>}
            </div>
            <Button 
              type="submit" 
              data-testid="button-login"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enter Portal
            </Button>
            <div className="text-center">
              <a href="/" className="text-xs text-muted-foreground hover:text-primary" data-testid="link-return">Return to Website</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function StaffLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo gate
    if (password === "demo") {
      // Determine if mobile or tablet (mock logic, in real app check User Agent or just route)
      // For this demo, let's route to the mobile dashboard by default
      setLocation("/staff/dashboard");
    } else {
      setError(true);
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
          <CardDescription className="text-muted-foreground">Enter your access code to continue.</CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Access Code</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className="bg-background/50 border-white/10 focus:border-primary"
              />
              {error && <p className="text-destructive text-sm">Invalid access code.</p>}
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Enter Portal
            </Button>
            <div className="text-center">
              <a href="/" className="text-xs text-muted-foreground hover:text-primary">Return to Website</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

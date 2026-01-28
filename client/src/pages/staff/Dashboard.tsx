
import { StaffLayout } from "@/components/layout/StaffLayout";
import { activeSessions } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Clock, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  const handleSendLink = (type: 'email' | 'sms', name: string) => {
    toast({
      title: "Link Sent",
      description: `${type === 'email' ? 'Email' : 'SMS'} link sent to ${name}.`,
    });
  };

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="font-serif text-2xl md:text-3xl text-foreground">Client Sessions</h1>
             <p className="text-muted-foreground text-sm">Today's active arrangements</p>
          </div>
          <Link href="/staff/builder">
            <Button className="bg-primary text-primary-foreground hidden md:flex">
              New Arrangement
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {activeSessions.map((session) => (
            <Card key={session.id} className="border-white/5 bg-card hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-xl mb-1">{session.familyName}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <Clock className="h-3 w-3" />
                       <span>{session.time}</span>
                    </div>
                  </div>
                  <Badge variant={session.status === 'Completed' ? 'default' : 'outline'} className={session.status === 'Completed' ? 'bg-green-900 text-green-100 border-none' : 'text-primary border-primary/30'}>
                    {session.status}
                  </Badge>
                </div>

                <div className="bg-background/30 rounded-lg p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     {session.status === 'Completed' ? (
                       <CheckCircle2 className="h-5 w-5 text-green-500" />
                     ) : (
                       <AlertCircle className="h-5 w-5 text-primary" />
                     )}
                     <div className="flex flex-col">
                       <span className="text-xs uppercase tracking-wider text-muted-foreground">Next Step</span>
                       <span className="text-sm font-medium">{session.nextStep}</span>
                     </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/5 text-xs"
                    onClick={() => handleSendLink('email', session.familyName)}
                  >
                    <Mail className="mr-2 h-3 w-3" /> Email Forms
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/5 text-xs"
                    onClick={() => handleSendLink('sms', session.familyName)}
                  >
                    <MessageSquare className="mr-2 h-3 w-3" /> SMS Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Mobile FAB for new session */}
        <div className="md:hidden fixed bottom-6 right-6">
          <Link href="/staff/builder">
             <Button className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center">
               <span className="text-2xl">+</span>
             </Button>
          </Link>
        </div>
      </div>
    </StaffLayout>
  );
}

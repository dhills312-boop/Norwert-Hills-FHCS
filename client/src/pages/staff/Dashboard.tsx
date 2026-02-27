import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Clock, ChevronRight, CheckCircle2, AlertCircle, Plus, Loader2, LogOut, History, FileEdit, Trash2, FilePlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Arrangement {
  id: string;
  familyName: string;
  email: string | null;
  phone: string | null;
  status: string;
  nextStep: string;
  scheduledTime: string | null;
  createdAt: string;
}

interface ActivityLogEntry {
  id: string;
  arrangementId: string;
  actorId: string;
  actorName: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newFamily, setNewFamily] = useState({ familyName: "", email: "", phone: "", scheduledTime: "" });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/staff/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (!authLoading && !isAuthenticated) {
    return null;
  }

  const { data: arrangements = [], isLoading } = useQuery<Arrangement[]>({
    queryKey: ["/api/arrangements"],
    enabled: isAuthenticated,
  });

  const { data: activityLogs = [] } = useQuery<ActivityLogEntry[]>({
    queryKey: ["/api/activity-logs"],
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newFamily) => {
      const res = await apiRequest("POST", "/api/arrangements", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arrangements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });
      setNewDialogOpen(false);
      setNewFamily({ familyName: "", email: "", phone: "", scheduledTime: "" });
      toast({ title: "Arrangement Created", description: "New client session has been created." });
    },
  });

  const handleSendLink = (type: 'email' | 'sms', name: string) => {
    toast({
      title: "Link Sent",
      description: `${type === 'email' ? 'Email' : 'SMS'} link sent to ${name}.`,
    });
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/staff/login");
  };

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="font-serif text-2xl md:text-3xl text-foreground" data-testid="text-dashboard-title">Client Sessions</h1>
             <p className="text-muted-foreground text-sm">
               {user?.name ? `Welcome, ${user.name}` : "Today's active arrangements"}
             </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hidden md:flex" data-testid="button-new-arrangement">
                  New Arrangement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">New Arrangement</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newFamily); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Family Name</Label>
                    <Input 
                      data-testid="input-family-name"
                      value={newFamily.familyName} 
                      onChange={e => setNewFamily(prev => ({ ...prev, familyName: e.target.value }))} 
                      placeholder="The Smith Family" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        data-testid="input-email"
                        value={newFamily.email} 
                        onChange={e => setNewFamily(prev => ({ ...prev, email: e.target.value }))} 
                        placeholder="email@example.com" 
                        type="email" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input 
                        data-testid="input-phone"
                        value={newFamily.phone} 
                        onChange={e => setNewFamily(prev => ({ ...prev, phone: e.target.value }))} 
                        placeholder="555-123-4567" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled Time</Label>
                    <Input 
                      data-testid="input-time"
                      value={newFamily.scheduledTime} 
                      onChange={e => setNewFamily(prev => ({ ...prev, scheduledTime: e.target.value }))} 
                      placeholder="10:00 AM" 
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMutation.isPending} data-testid="button-submit-arrangement">
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground" data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : arrangements.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-muted-foreground text-lg">No arrangements yet.</p>
            <Button onClick={() => setNewDialogOpen(true)} className="bg-primary text-primary-foreground">
              Create First Arrangement
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {arrangements.map((session) => (
              <Card key={session.id} className="border-white/5 bg-card hover:border-primary/30 transition-colors" data-testid={`card-arrangement-${session.id}`}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-xl mb-1" data-testid={`text-family-${session.id}`}>{session.familyName}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <Clock className="h-3 w-3" />
                         <span>{session.scheduledTime || "Not scheduled"}</span>
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
                    <Link href={`/staff/builder?arrangement=${session.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid={`button-open-${session.id}`}>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-white/10 hover:bg-white/5 text-xs"
                      onClick={() => handleSendLink('email', session.familyName)}
                      data-testid={`button-email-${session.id}`}
                    >
                      <Mail className="mr-2 h-3 w-3" /> Email Forms
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-white/10 hover:bg-white/5 text-xs"
                      onClick={() => handleSendLink('sms', session.familyName)}
                      data-testid={`button-sms-${session.id}`}
                    >
                      <MessageSquare className="mr-2 h-3 w-3" /> SMS Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {activityLogs.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-xl text-foreground" data-testid="text-activity-title">Activity Log</h2>
            </div>
            <Card className="border-white/5 bg-card">
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {activityLogs.slice(0, 20).map((log) => {
                    const arrangement = arrangements.find((a) => a.id === log.arrangementId);
                    const time = new Date(log.createdAt);
                    const timeStr = time.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                    const actionIcon = log.action === "created" ? (
                      <FilePlus className="h-4 w-4 text-green-400" />
                    ) : log.action === "deleted" ? (
                      <Trash2 className="h-4 w-4 text-red-400" />
                    ) : (
                      <FileEdit className="h-4 w-4 text-primary" />
                    );

                    return (
                      <div key={log.id} className="flex items-start gap-3 px-4 py-3" data-testid={`activity-log-${log.id}`}>
                        <div className="mt-0.5">{actionIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground" data-testid={`activity-actor-${log.id}`}>{log.actorName}</span>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-white/10 px-1.5 py-0">
                              {log.action}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {arrangement ? arrangement.familyName : log.action === "deleted" ? "" : "Deleted arrangement"}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-xs text-muted-foreground mt-0.5" data-testid={`activity-details-${log.id}`}>{log.details}</p>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5">{timeStr}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="md:hidden fixed bottom-6 right-6">
          <Button 
            className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
            onClick={() => setNewDialogOpen(true)}
            data-testid="button-fab-new"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </StaffLayout>
  );
}

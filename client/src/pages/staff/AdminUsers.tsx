import { useState } from "react";
import { useLocation } from "wouter";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Shield, UserCheck, UserX, Users } from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "director" | "staff";
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const { user, isDirector, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [roleConfirm, setRoleConfirm] = useState<{ userId: string; name: string; newRole: "director" | "staff" } | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<{ userId: string; name: string } | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "staff" as "director" | "staff" });

  if (!authLoading && !isAuthenticated) {
    setLocation("/staff/login");
    return null;
  }

  if (!authLoading && !isDirector) {
    setLocation("/staff/dashboard");
    return null;
  }

  const { data: users = [], isLoading } = useQuery<StaffUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isDirector,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreateOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "staff" });
      toast({ title: "User Created", description: "New staff account has been created." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role Updated" });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/deactivate`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to deactivate");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User Deactivated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/activate`);
      if (!res.ok) throw new Error("Failed to activate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User Activated" });
    },
  });

  const formatDate = (d: string | null) => {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground" data-testid="text-admin-title">User Management</h1>
            <p className="text-muted-foreground text-sm">Manage staff accounts and permissions</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground" data-testid="button-create-user">
                <Plus className="h-4 w-4 mr-2" /> New User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Create Staff Account</DialogTitle>
                <DialogDescription>New users must use an @thenhfcs.com email.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newUser); }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    data-testid="input-new-name"
                    value={newUser.name}
                    onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    data-testid="input-new-email"
                    type="email"
                    value={newUser.email}
                    onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="jane@thenhfcs.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    data-testid="input-new-password"
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Min 8 chars, upper/lower, number, symbol"
                    required
                  />
                  <p className="text-xs text-muted-foreground">At least 8 characters with uppercase, lowercase, number, and special character.</p>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v: "director" | "staff") => setNewUser(prev => ({ ...prev, role: v }))}>
                    <SelectTrigger data-testid="select-new-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-primary text-primary-foreground" disabled={createMutation.isPending} data-testid="button-submit-user">
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No staff accounts yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <Card key={u.id} className={`border-white/5 bg-card ${!u.isActive ? "opacity-60" : ""}`} data-testid={`card-user-${u.id}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-lg truncate" data-testid={`text-user-name-${u.id}`}>{u.name}</h3>
                        <Badge
                          variant={u.role === "director" ? "default" : "outline"}
                          className={u.role === "director" ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground border-white/10"}
                          data-testid={`badge-role-${u.id}`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {u.role === "director" ? "Director" : "Staff"}
                        </Badge>
                        {!u.isActive && (
                          <Badge variant="outline" className="text-destructive border-destructive/30" data-testid={`badge-inactive-${u.id}`}>
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate" data-testid={`text-user-email-${u.id}`}>{u.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last login: {formatDate(u.lastLoginAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {u.id !== user?.id && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-xs"
                            onClick={() => setRoleConfirm({
                              userId: u.id,
                              name: u.name,
                              newRole: u.role === "director" ? "staff" : "director",
                            })}
                            data-testid={`button-toggle-role-${u.id}`}
                          >
                            {u.role === "director" ? "Demote to Staff" : "Promote to Director"}
                          </Button>
                          {u.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
                              onClick={() => setDeactivateConfirm({ userId: u.id, name: u.name })}
                              data-testid={`button-deactivate-${u.id}`}
                            >
                              <UserX className="h-3 w-3 mr-1" /> Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs"
                              onClick={() => activateMutation.mutate(u.id)}
                              data-testid={`button-activate-${u.id}`}
                            >
                              <UserCheck className="h-3 w-3 mr-1" /> Activate
                            </Button>
                          )}
                        </>
                      )}
                      {u.id === user?.id && (
                        <Badge variant="outline" className="text-muted-foreground border-white/10 text-xs">You</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!roleConfirm} onOpenChange={() => setRoleConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change <strong>{roleConfirm?.name}</strong>'s role to <strong>{roleConfirm?.newRole}</strong>?
                {roleConfirm?.newRole === "director" && " This will grant them full administrative access."}
                {roleConfirm?.newRole === "staff" && " This will remove their administrative access."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (roleConfirm) {
                    roleMutation.mutate({ userId: roleConfirm.userId, role: roleConfirm.newRole });
                    setRoleConfirm(null);
                  }
                }}
                data-testid="button-confirm-role"
              >
                Confirm Change
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deactivateConfirm} onOpenChange={() => setDeactivateConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate <strong>{deactivateConfirm?.name}</strong>'s account? They will be unable to log in until reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (deactivateConfirm) {
                    deactivateMutation.mutate(deactivateConfirm.userId);
                    setDeactivateConfirm(null);
                  }
                }}
                data-testid="button-confirm-deactivate"
              >
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StaffLayout>
  );
}

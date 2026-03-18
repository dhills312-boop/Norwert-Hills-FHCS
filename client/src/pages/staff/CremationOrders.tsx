import { StaffLayout } from "@/components/layout/StaffLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ChevronRight, Flame, Users, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import type { CremationOrder, CremationPhase, WaitlistSignup } from "@shared/schema";

const phaseLabels: Record<CremationPhase, string> = {
  intake: "Intake",
  forms: "Forms",
  payment: "Payment",
  fulfillment: "Fulfillment",
  completed: "Completed",
};

const phaseBadgeVariant: Record<CremationPhase, string> = {
  intake: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  forms: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  payment: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  fulfillment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function CremationOrders() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/staff/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<CremationOrder[]>({
    queryKey: ["/api/cremation/orders"],
    enabled: isAuthenticated,
  });

  const { data: waitlistSignups = [], isLoading: waitlistLoading } = useQuery<WaitlistSignup[]>({
    queryKey: ["/api/cremation/waitlist"],
    enabled: isAuthenticated,
  });

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (phaseFilter !== "all") {
      result = result.filter((o) => o.currentPhase === phaseFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.contactName.toLowerCase().includes(q) ||
          o.decedentName.toLowerCase().includes(q) ||
          o.orderToken.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, phaseFilter, searchQuery]);

  if (authLoading) return null;

  return (
    <StaffLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="h-7 w-7 text-primary" />
          <h1 className="font-serif text-2xl md:text-3xl text-foreground" data-testid="text-cremation-title">
            Cremation Operations
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6" data-testid="tabs-cremation">
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Flame className="h-4 w-4 mr-2" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="waitlist" data-testid="tab-waitlist">
              <Users className="h-4 w-4 mr-2" />
              Waitlist ({waitlistSignups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or order token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-orders"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={phaseFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPhaseFilter("all")}
                  data-testid="filter-all"
                >
                  All
                </Button>
                {(["intake", "forms", "payment", "fulfillment", "completed"] as CremationPhase[]).map(
                  (phase) => (
                    <Button
                      key={phase}
                      variant={phaseFilter === phase ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPhaseFilter(phase)}
                      data-testid={`filter-${phase}`}
                    >
                      {phaseLabels[phase]}
                    </Button>
                  )
                )}
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="border-white/5 bg-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {orders.length === 0
                    ? "No cremation orders yet."
                    : "No orders match your filters."}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <Link key={order.id} href={`/staff/cremation/${order.id}`} data-testid={`link-order-${order.id}`}>
                    <Card
                      className="border-white/5 bg-card hover:bg-white/5 transition-colors cursor-pointer"
                      data-testid={`card-order-${order.id}`}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span
                              className="font-medium text-foreground truncate"
                              data-testid={`text-decedent-${order.id}`}
                            >
                              {order.decedentName}
                            </span>
                            <Badge
                              className={`text-xs border ${phaseBadgeVariant[order.currentPhase as CremationPhase] || "bg-gray-500/20 text-gray-400"}`}
                              data-testid={`badge-phase-${order.id}`}
                            >
                              {phaseLabels[order.currentPhase as CremationPhase] || order.currentPhase}
                            </Badge>
                            {order.paymentStatus && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                data-testid={`badge-payment-${order.id}`}
                              >
                                {order.paymentStatus}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span data-testid={`text-contact-${order.id}`}>
                              Family: {order.contactName}
                            </span>
                            <span
                              className="font-mono text-xs"
                              data-testid={`text-token-${order.id}`}
                            >
                              {order.orderToken.slice(0, 12)}...
                            </span>
                            <span data-testid={`text-date-${order.id}`}>
                              {new Date(order.createdAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="waitlist">
            {waitlistLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : waitlistSignups.length === 0 ? (
              <Card className="border-white/5 bg-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No waitlist signups yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {waitlistSignups.map((signup) => (
                  <Card
                    key={signup.id}
                    className="border-white/5 bg-card"
                    data-testid={`card-waitlist-${signup.id}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <span
                          className="text-foreground font-medium"
                          data-testid={`text-waitlist-email-${signup.id}`}
                        >
                          {signup.email}
                        </span>
                        {signup.zip && (
                          <span
                            className="ml-4 text-sm text-muted-foreground"
                            data-testid={`text-waitlist-zip-${signup.id}`}
                          >
                            ZIP: {signup.zip}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-sm text-muted-foreground"
                        data-testid={`text-waitlist-date-${signup.id}`}
                      >
                        {new Date(signup.createdAt!).toLocaleDateString()}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
}

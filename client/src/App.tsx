import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import About from "@/pages/About";
import Resources from "@/pages/Resources";
import ResourcesFAQ from "@/pages/ResourcesFAQ";
import ArticleDetail from "@/pages/ArticleDetail";
import Contact from "@/pages/Contact";
import StaffLogin from "@/pages/staff/Login";
import Dashboard from "@/pages/staff/Dashboard";
import Builder from "@/pages/staff/Builder";
import Billing from "@/pages/staff/Billing";
import AdminUsers from "@/pages/staff/AdminUsers";
import Announcement from "@/pages/announcements/CharlesBraud";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/services/:id" component={ServiceDetail} />
      <Route path="/about" component={About} />
      <Route path="/resources" component={Resources} />
      <Route path="/resources/faq" component={ResourcesFAQ} />
      <Route path="/resources/article/:id" component={ArticleDetail} />
      <Route path="/contact" component={Contact} />
      <Route path="/announcements/charles-braud" component={Announcement} />
      <Route path="/staff/login" component={StaffLogin} />
      <Route path="/staff/dashboard" component={Dashboard} />
      <Route path="/staff/builder" component={Builder} />
      <Route path="/staff/billing" component={Billing} />
      <Route path="/staff/admin/users" component={AdminUsers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

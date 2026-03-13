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
import CatalogAdmin from "@/pages/staff/CatalogAdmin";
import SessionOverview from "@/pages/staff/SessionOverview";
import FormFill from "@/pages/staff/FormFill";
import CharlesBraudAnnouncement from "@/pages/announcements/CharlesBraud";
import AnnouncementPage from "@/pages/announcements/AnnouncementPage";
import ObituaryPage from "@/pages/announcements/ObituaryPage";
import AnnouncementsList from "@/pages/staff/AnnouncementsList";
import AnnouncementEditor from "@/pages/staff/AnnouncementEditor";

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
      <Route path="/announcements/charles-braud" component={CharlesBraudAnnouncement} />
      <Route path="/announcements/:slug" component={AnnouncementPage} />
      <Route path="/obituaries/:slug" component={ObituaryPage} />
      <Route path="/staff/login" component={StaffLogin} />
      <Route path="/staff/dashboard" component={Dashboard} />
      <Route path="/staff/sessions/:id" component={SessionOverview} />
      <Route path="/staff/sessions/:id/announcement" component={AnnouncementEditor} />
      <Route path="/staff/sessions/:id/forms/:templateId/fill" component={FormFill} />
      <Route path="/staff/builder" component={Builder} />
      <Route path="/staff/billing" component={Billing} />
      <Route path="/staff/admin/users" component={AdminUsers} />
      <Route path="/staff/catalog" component={CatalogAdmin} />
      <Route path="/staff/announcements" component={AnnouncementsList} />
      <Route path="/staff/announcements/:id" component={AnnouncementEditor} />
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

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminClients from "@/pages/admin-clients";
import AdminVideos from "@/pages/admin-videos";
import AdminDiet from "@/pages/admin-diet";
import AdminSessions from "@/pages/admin-sessions";
import AdminAnalytics from "@/pages/admin-analytics";
import ClientDashboard from "@/pages/client-dashboard";
import ClientWorkouts from "@/pages/client-workouts";
import ClientDiet from "@/pages/client-diet";
import ClientSessions from "@/pages/client-sessions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/clients" component={AdminClients} />
      <Route path="/admin/videos" component={AdminVideos} />
      <Route path="/admin/diet" component={AdminDiet} />
      <Route path="/admin/sessions" component={AdminSessions} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/client" component={ClientDashboard} />
      <Route path="/client/workouts" component={ClientWorkouts} />
      <Route path="/client/diet" component={ClientDiet} />
      <Route path="/client/sessions" component={ClientSessions} />
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

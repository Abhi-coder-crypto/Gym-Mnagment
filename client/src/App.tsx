import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import ClientAccess from "@/pages/client-access";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminClients from "@/pages/admin-clients";
import AdminVideos from "@/pages/admin-videos";
import AdminDiet from "@/pages/admin-diet";
import AdminSessions from "@/pages/admin-sessions";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminRevenue from "@/pages/admin-revenue";
import ClientDashboard from "@/pages/client-dashboard";
import ClientWorkouts from "@/pages/client-workouts";
import ClientVideos from "@/pages/client-videos";
import ClientDiet from "@/pages/client-diet";
import ClientSessions from "@/pages/client-sessions";
import ClientHistory from "@/pages/client-history";
import ClientWorkoutHistory from "@/pages/client-workout-history";
import ClientProgressPhotos from "@/pages/client-progress-photos";
import ClientProfile from "@/pages/client-profile";
import SessionRoom from "@/pages/session-room";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/client-access" component={ClientAccess} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/clients" component={AdminClients} />
      <Route path="/admin/videos" component={AdminVideos} />
      <Route path="/admin/diet" component={AdminDiet} />
      <Route path="/admin/sessions" component={AdminSessions} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/revenue" component={AdminRevenue} />
      <Route path="/client" component={ClientDashboard} />
      <Route path="/client/workouts" component={ClientWorkouts} />
      <Route path="/client/videos" component={ClientVideos} />
      <Route path="/client/diet" component={ClientDiet} />
      <Route path="/client/sessions" component={ClientSessions} />
      <Route path="/session/:id" component={SessionRoom} />
      <Route path="/client/history" component={ClientHistory} />
      <Route path="/client/workout-history" component={ClientWorkoutHistory} />
      <Route path="/client/progress-photos" component={ClientProgressPhotos} />
      <Route path="/client/profile" component={ClientProfile} />
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

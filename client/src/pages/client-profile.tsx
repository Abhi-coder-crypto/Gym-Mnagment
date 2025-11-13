import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/notification-center";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Video, UtensilsCrossed, Calendar, User, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { BodyCompositionCalculator } from "@/components/body-composition-calculator";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function ClientProfile() {
  const [, setLocation] = useLocation();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: client } = useQuery<any>({
    queryKey: ['/api/clients', clientId],
    enabled: !!clientId,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!client) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/client")}>
                <Dumbbell className="h-8 w-8 text-primary" />
                <span className="text-2xl font-display font-bold tracking-tight">FitPro</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" onClick={() => setLocation("/client")} data-testid="link-dashboard">
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/workouts")} data-testid="link-workouts">
                  <Video className="h-4 w-4 mr-2" />
                  Workouts
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/diet")} data-testid="link-diet">
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Diet Plan
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/sessions")} data-testid="link-sessions">
                  <Calendar className="h-4 w-4 mr-2" />
                  Live Sessions
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="bg-accent" data-testid="button-profile">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 max-w-4xl space-y-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold tracking-tight">{client.name}</h1>
              <p className="text-muted-foreground mt-1">Member since {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-chart-2">{client.packageId?.name || 'No'} Plan</Badge>
                <Badge variant="outline" className="bg-chart-3 text-white">Active</Badge>
              </div>
            </div>
            <Button data-testid="button-edit-profile">Edit Profile</Button>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="body">Body Composition</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={client.name} data-testid="input-full-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" className="pl-10" defaultValue={client.email || ''} data-testid="input-email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" className="pl-10" defaultValue={client.phone} data-testid="input-phone" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="address" className="pl-10" defaultValue="123 Fitness St, Gym City, GC 12345" data-testid="input-address" />
                    </div>
                  </div>
                  <Button className="w-full" data-testid="button-save-personal">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="body" className="space-y-6">
              <BodyCompositionCalculator />
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-md bg-accent/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold font-display">Premium Plan</h3>
                      <Badge className="bg-chart-2">$59/month</Badge>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Access to all recorded workout videos
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Personalized diet management
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Progress tracking and analytics
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next billing date</span>
                      <span className="font-semibold">Dec 10, 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment method</span>
                      <span className="font-semibold flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        •••• 4242
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" data-testid="button-change-plan">
                      Change Plan
                    </Button>
                    <Button variant="outline" className="flex-1" data-testid="button-cancel-subscription">
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive email updates about your progress</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" data-testid="checkbox-email-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Session Reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified before live sessions</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" data-testid="checkbox-session-reminders" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Achievement Notifications</p>
                      <p className="text-sm text-muted-foreground">Celebrate your milestones</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" data-testid="checkbox-achievement-notifications" />
                  </div>
                  <Button className="w-full" data-testid="button-save-preferences">Save Preferences</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fitness Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetWeight">Target Weight (lbs)</Label>
                    <Input id="targetWeight" type="number" defaultValue="170" data-testid="input-target-weight" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyGoal">Weekly Workout Goal</Label>
                    <Input id="weeklyGoal" type="number" defaultValue="5" data-testid="input-weekly-goal" />
                  </div>
                  <Button className="w-full" data-testid="button-save-goals">Update Goals</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, CreditCard, FileText, Download, Globe, Shield, Heart, Activity, Moon, Sun } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";

export default function ClientProfile() {
  const [, setLocation] = useLocation();
  const [clientId, setClientId] = useState<string | null>(null);
  const { toast } = useToast();
  const { language: currentLanguage, setLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    medicalConditions: '',
    injuries: '',
    limitations: '',
    language: 'en' as 'en' | 'hi',
    emailNotifications: true,
    sessionReminders: true,
    achievementNotifications: true,
    showEmail: false,
    showPhone: false,
    showProgress: true,
  });

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

  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ['/api/payment-history', clientId],
    enabled: !!clientId,
  });

  // Initialize form data when client loads
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        bio: client.bio || '',
        fitnessLevel: client.fitnessLevel || 'beginner',
        medicalConditions: client.medicalConditions?.join(', ') || '',
        injuries: client.injuries?.join(', ') || '',
        limitations: client.limitations || '',
        language: client.language || 'en',
        emailNotifications: client.notificationPreferences?.email ?? true,
        sessionReminders: client.notificationPreferences?.sessionReminders ?? true,
        achievementNotifications: client.notificationPreferences?.achievements ?? true,
        showEmail: client.privacySettings?.showEmail ?? false,
        showPhone: client.privacySettings?.showPhone ?? false,
        showProgress: client.privacySettings?.showProgress ?? true,
      });
    }
  }, [client]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  const updateClientMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', `/api/clients/${clientId}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId] });
      // Sync language with provider if language was updated
      if (variables.language) {
        setLanguage(variables.language);
      }
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
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
      <ClientHeader currentPage="profile" />

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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      data-testid="input-full-name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        className="pl-10" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        data-testid="input-email" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        className="pl-10" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        data-testid="input-phone" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="address" 
                        className="pl-10" 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        data-testid="input-address" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell us about yourself, your fitness goals..." 
                      value={formData.bio} 
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="min-h-24"
                      data-testid="textarea-bio" 
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      updateClientMutation.mutate({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        bio: formData.bio,
                      });
                    }}
                    disabled={updateClientMutation.isPending}
                    data-testid="button-save-personal"
                  >
                    {updateClientMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health Profile
                  </CardTitle>
                  <CardDescription>Manage your health information and fitness level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fitnessLevel">Fitness Level</Label>
                    <Select value={formData.fitnessLevel} onValueChange={(value: any) => setFormData({...formData, fitnessLevel: value})}>
                      <SelectTrigger id="fitnessLevel" data-testid="select-fitness-level">
                        <SelectValue placeholder="Select your fitness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      placeholder="List any medical conditions (e.g., diabetes, hypertension...)"
                      value={formData.medicalConditions}
                      onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                      className="min-h-20"
                      data-testid="textarea-medical-conditions"
                    />
                    <p className="text-sm text-muted-foreground">Separate multiple conditions with commas</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="injuries">Injuries or Past Surgeries</Label>
                    <Textarea
                      id="injuries"
                      placeholder="List any injuries or surgeries (e.g., knee injury, back surgery...)"
                      value={formData.injuries}
                      onChange={(e) => setFormData({...formData, injuries: e.target.value})}
                      className="min-h-20"
                      data-testid="textarea-injuries"
                    />
                    <p className="text-sm text-muted-foreground">Separate multiple items with commas</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limitations">Physical Limitations</Label>
                    <Textarea
                      id="limitations"
                      placeholder="Describe any physical limitations or restrictions..."
                      value={formData.limitations}
                      onChange={(e) => setFormData({...formData, limitations: e.target.value})}
                      className="min-h-20"
                      data-testid="textarea-limitations"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      updateClientMutation.mutate({
                        fitnessLevel: formData.fitnessLevel,
                        medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map(c => c.trim()).filter(c => c) : [],
                        injuries: formData.injuries ? formData.injuries.split(',').map(i => i.trim()).filter(i => i) : [],
                        limitations: formData.limitations,
                      });
                    }}
                    disabled={updateClientMutation.isPending}
                    data-testid="button-save-health"
                  >
                    {updateClientMutation.isPending ? "Saving..." : "Save Health Profile"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-md bg-accent/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold font-display">{client.packageId?.name || 'Premium'} Plan</h3>
                      <Badge className="bg-chart-2">${client.packageId?.price || '59'}/month</Badge>
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
                  <div className="flex flex-wrap gap-3">
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

            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                  <CardDescription>View your invoices and payment receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No payment history available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((payment: any) => (
                        <div
                          key={payment._id}
                          className="flex flex-wrap items-center justify-between p-4 border rounded-md gap-3"
                          data-testid={`payment-${payment._id}`}
                        >
                          <div className="flex-1 min-w-48">
                            <div className="font-semibold">Invoice #{payment.invoiceNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(payment.billingDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">${payment.amount}</div>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.paymentMethod}
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-download-${payment._id}`}>
                            <Download className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <Switch 
                      id="emailNotifications"
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) => setFormData({...formData, emailNotifications: checked})}
                      data-testid="switch-email-notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Session Reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified before live sessions</p>
                    </div>
                    <Switch 
                      id="sessionReminders"
                      checked={formData.sessionReminders}
                      onCheckedChange={(checked) => setFormData({...formData, sessionReminders: checked})}
                      data-testid="switch-session-reminders"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Achievement Notifications</p>
                      <p className="text-sm text-muted-foreground">Celebrate your milestones</p>
                    </div>
                    <Switch 
                      id="achievementNotifications"
                      checked={formData.achievementNotifications}
                      onCheckedChange={(checked) => setFormData({...formData, achievementNotifications: checked})}
                      data-testid="switch-achievement-notifications"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how FitPro looks to you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                    </div>
                    <Switch 
                      id="darkMode"
                      checked={darkMode}
                      onCheckedChange={toggleDarkMode}
                      data-testid="switch-dark-mode"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language & Region
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select value={formData.language} onValueChange={(value: any) => setFormData({...formData, language: value})}>
                      <SelectTrigger id="language" data-testid="select-language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full"
                onClick={() => {
                  updateClientMutation.mutate({
                    language: formData.language,
                    notificationPreferences: {
                      email: formData.emailNotifications,
                      sessionReminders: formData.sessionReminders,
                      achievements: formData.achievementNotifications,
                    },
                  });
                }}
                disabled={updateClientMutation.isPending}
                data-testid="button-save-preferences"
              >
                {updateClientMutation.isPending ? "Saving..." : "Save Preferences"}
              </Button>

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

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>Control what information is visible to others</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Show Email Address</p>
                      <p className="text-sm text-muted-foreground">Allow others to see your email</p>
                    </div>
                    <Switch 
                      id="showEmail"
                      checked={formData.showEmail}
                      onCheckedChange={(checked) => setFormData({...formData, showEmail: checked})}
                      data-testid="switch-show-email"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Show Phone Number</p>
                      <p className="text-sm text-muted-foreground">Allow others to see your phone number</p>
                    </div>
                    <Switch 
                      id="showPhone"
                      checked={formData.showPhone}
                      onCheckedChange={(checked) => setFormData({...formData, showPhone: checked})}
                      data-testid="switch-show-phone"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Show Progress</p>
                      <p className="text-sm text-muted-foreground">Allow trainers to see your workout progress</p>
                    </div>
                    <Switch 
                      id="showProgress"
                      checked={formData.showProgress}
                      onCheckedChange={(checked) => setFormData({...formData, showProgress: checked})}
                      data-testid="switch-show-progress"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      updateClientMutation.mutate({
                        privacySettings: {
                          showEmail: formData.showEmail,
                          showPhone: formData.showPhone,
                          showProgress: formData.showProgress,
                        },
                      });
                    }}
                    disabled={updateClientMutation.isPending}
                    data-testid="button-save-privacy"
                  >
                    {updateClientMutation.isPending ? "Saving..." : "Save Privacy Settings"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

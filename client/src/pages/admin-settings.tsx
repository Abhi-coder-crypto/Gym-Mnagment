import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Settings,
  Package,
  DollarSign,
  Mail,
  Palette,
  Users,
  Bell,
  Plug,
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminSettings() {
  const style = { "--sidebar-width": "16rem" };
  const { toast } = useToast();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/settings', 'PUT', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });


  const handleSaveSettings = (section: string, data: any) => {
    updateSettingsMutation.mutate({
      [section]: data
    });
  };

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading || !settings) {
    return (
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-2xl font-display font-bold tracking-tight">System Settings</h1>
              </div>
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto p-8">
              <p>Loading settings...</p>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">System Settings</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                  <TabsTrigger value="branding" data-testid="tab-branding">
                    <Palette className="w-4 h-4 mr-2" />
                    Branding
                  </TabsTrigger>
                  <TabsTrigger value="packages" data-testid="tab-packages">
                    <Package className="w-4 h-4 mr-2" />
                    Packages
                  </TabsTrigger>
                  <TabsTrigger value="pricing" data-testid="tab-pricing">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="email" data-testid="tab-email">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="roles" data-testid="tab-roles">
                    <Users className="w-4 h-4 mr-2" />
                    Roles
                  </TabsTrigger>
                  <TabsTrigger value="notifications" data-testid="tab-notifications">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="integrations" data-testid="tab-integrations">
                    <Plug className="w-4 h-4 mr-2" />
                    Integrations
                  </TabsTrigger>
                </TabsList>

                {/* Branding Settings */}
                <TabsContent value="branding">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Branding Settings
                      </CardTitle>
                      <CardDescription>
                        Customize your gym's branding and appearance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gymName" data-testid="label-gym-name">Gym Name</Label>
                          <Input
                            id="gymName"
                            defaultValue={settings.branding?.gymName || 'FitPro'}
                            placeholder="Enter gym name"
                            data-testid="input-gym-name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tagline" data-testid="label-tagline">Tagline</Label>
                          <Input
                            id="tagline"
                            defaultValue={settings.branding?.tagline || ''}
                            placeholder="Enter tagline"
                            data-testid="input-tagline"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="primaryColor" data-testid="label-primary-color">Primary Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="primaryColor"
                                type="color"
                                defaultValue={settings.branding?.primaryColor || '#3b82f6'}
                                className="w-20 h-10"
                                data-testid="input-primary-color"
                              />
                              <Input
                                value={settings.branding?.primaryColor || '#3b82f6'}
                                readOnly
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="secondaryColor" data-testid="label-secondary-color">Secondary Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="secondaryColor"
                                type="color"
                                defaultValue={settings.branding?.secondaryColor || '#8b5cf6'}
                                className="w-20 h-10"
                                data-testid="input-secondary-color"
                              />
                              <Input
                                value={settings.branding?.secondaryColor || '#8b5cf6'}
                                readOnly
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="logo" data-testid="label-logo">Logo URL</Label>
                          <Input
                            id="logo"
                            defaultValue={settings.branding?.logo || ''}
                            placeholder="Enter logo URL"
                            data-testid="input-logo"
                          />
                          <p className="text-sm text-muted-foreground">
                            Upload your logo to a CDN and paste the URL here
                          </p>
                        </div>
                      </div>

                      <Button 
                        onClick={() => {
                          const gymName = (document.getElementById('gymName') as HTMLInputElement).value;
                          const tagline = (document.getElementById('tagline') as HTMLInputElement).value;
                          const primaryColor = (document.getElementById('primaryColor') as HTMLInputElement).value;
                          const secondaryColor = (document.getElementById('secondaryColor') as HTMLInputElement).value;
                          const logo = (document.getElementById('logo') as HTMLInputElement).value;
                          
                          handleSaveSettings('branding', {
                            gymName,
                            tagline,
                            primaryColor,
                            secondaryColor,
                            logo
                          });
                        }}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="button-save-branding"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateSettingsMutation.isPending ? 'Saving...' : 'Save Branding'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Package Management */}
                <TabsContent value="packages">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Package Management
                      </CardTitle>
                      <CardDescription>
                        Define package features and access levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Package features are managed through the package creation and editing interface. 
                        Visit the <a href="/admin/clients" className="text-primary hover:underline">Clients</a> page to manage packages.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <h4 className="font-medium">Video Library Access</h4>
                            <p className="text-sm text-muted-foreground">Grant access to workout videos</p>
                          </div>
                          <Badge>Package Feature</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <h4 className="font-medium">Live Sessions</h4>
                            <p className="text-sm text-muted-foreground">Set monthly live session limits</p>
                          </div>
                          <Badge>Package Feature</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <h4 className="font-medium">Diet Plan Access</h4>
                            <p className="text-sm text-muted-foreground">Enable custom diet planning</p>
                          </div>
                          <Badge>Package Feature</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <h4 className="font-medium">Workout Plan Access</h4>
                            <p className="text-sm text-muted-foreground">Enable workout plan creation</p>
                          </div>
                          <Badge>Package Feature</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Subscription Pricing */}
                <TabsContent value="pricing">
                  <div className="grid gap-6 md:grid-cols-3">
                    {['basic', 'premium', 'elite'].map((tier) => (
                      <Card key={tier}>
                        <CardHeader>
                          <CardTitle className="capitalize flex items-center justify-between">
                            {tier}
                            <Badge variant={tier === 'elite' ? 'default' : 'secondary'}>
                              {tier === 'basic' ? 'Starter' : tier === 'premium' ? 'Popular' : 'Best Value'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {tier === 'basic' ? 'Entry level plan' : tier === 'premium' ? 'Most popular choice' : 'Complete solution'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${tier}-monthly`}>Monthly Price (₹)</Label>
                            <Input
                              id={`${tier}-monthly`}
                              type="number"
                              defaultValue={settings.subscription?.[tier]?.monthlyPrice || 0}
                              placeholder="0"
                              data-testid={`input-${tier}-monthly`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${tier}-yearly`}>Yearly Price (₹)</Label>
                            <Input
                              id={`${tier}-yearly`}
                              type="number"
                              defaultValue={settings.subscription?.[tier]?.yearlyPrice || 0}
                              placeholder="0"
                              data-testid={`input-${tier}-yearly`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Features</Label>
                            <Textarea
                              id={`${tier}-features`}
                              defaultValue={settings.subscription?.[tier]?.features?.join('\n') || ''}
                              placeholder="One feature per line"
                              rows={5}
                              data-testid={`textarea-${tier}-features`}
                            />
                          </div>

                          <Button 
                            onClick={() => {
                              const monthlyPrice = parseFloat((document.getElementById(`${tier}-monthly`) as HTMLInputElement).value);
                              const yearlyPrice = parseFloat((document.getElementById(`${tier}-yearly`) as HTMLInputElement).value);
                              const features = (document.getElementById(`${tier}-features`) as HTMLTextAreaElement).value
                                .split('\n')
                                .filter(f => f.trim());
                              
                              handleSaveSettings('subscription', {
                                ...settings.subscription,
                                [tier]: {
                                  monthlyPrice,
                                  yearlyPrice,
                                  features
                                }
                              });
                            }}
                            disabled={updateSettingsMutation.isPending}
                            className="w-full"
                            data-testid={`button-save-${tier}`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save {tier}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Email Templates */}
                <TabsContent value="email">
                  <div className="space-y-6">
                    {['welcome', 'paymentReminder', 'sessionReminder', 'packageExpiry'].map((template) => (
                      <Card key={template}>
                        <CardHeader>
                          <CardTitle className="capitalize flex items-center justify-between">
                            {template.replace(/([A-Z])/g, ' $1').trim()}
                            <Switch
                              defaultChecked={settings.emailTemplates?.[template]?.enabled !== false}
                              data-testid={`switch-${template}-enabled`}
                            />
                          </CardTitle>
                          <CardDescription>
                            Configure the {template.replace(/([A-Z])/g, ' $1').toLowerCase()} email template
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${template}-subject`}>Subject</Label>
                            <Input
                              id={`${template}-subject`}
                              defaultValue={settings.emailTemplates?.[template]?.subject || ''}
                              placeholder="Email subject"
                              data-testid={`input-${template}-subject`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${template}-body`}>Body</Label>
                            <Textarea
                              id={`${template}-body`}
                              defaultValue={settings.emailTemplates?.[template]?.body || ''}
                              placeholder="Email body (supports variables: {{clientName}}, {{gymName}}, {{amount}}, {{dueDate}}, {{sessionName}}, {{sessionDate}}, {{packageName}}, {{expiryDate}})"
                              rows={6}
                              data-testid={`textarea-${template}-body`}
                            />
                            <p className="text-sm text-muted-foreground">
                              Available variables: {'{'}{'{'} clientName {'}'}{'}'},  {'{'}{'{'} gymName {'}'}{'}'},  {'{'}{'{'} amount {'}'}{'}'},  {'{'}{'{'} dueDate {'}'}{'}'},  {'{'}{'{'} sessionName {'}'}{'}'},  {'{'}{'{'} sessionDate {'}'}{'}'},  {'{'}{'{'} packageName {'}'}{'}'},  {'{'}{'{'} expiryDate {'}'}{'}'} 
                            </p>
                          </div>

                          <Button 
                            onClick={() => {
                              const subject = (document.getElementById(`${template}-subject`) as HTMLInputElement).value;
                              const body = (document.getElementById(`${template}-body`) as HTMLTextAreaElement).value;
                              const enabled = (document.querySelector(`[data-testid="switch-${template}-enabled"]`) as HTMLInputElement)?.checked;
                              
                              handleSaveSettings('emailTemplates', {
                                ...settings.emailTemplates,
                                [template]: {
                                  subject,
                                  body,
                                  enabled
                                }
                              });
                            }}
                            disabled={updateSettingsMutation.isPending}
                            data-testid={`button-save-${template}`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* User Roles */}
                <TabsContent value="roles">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Trainer Management
                        </CardTitle>
                        <CardDescription>
                          Create and manage trainer accounts with login credentials
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Use the Trainers page to create new trainer accounts, assign clients, and manage their credentials. 
                          Each trainer will receive a unique email and password to access the system.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <Button 
                            onClick={() => window.location.href = '/admin/trainers'}
                            data-testid="button-manage-trainers"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Manage Trainers
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => window.location.href = '/admin/client-setup'}
                            data-testid="button-setup-clients"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Setup Client Credentials
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>User Roles Overview</CardTitle>
                        <CardDescription>
                          System roles and their capabilities
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Admin</h4>
                            <Badge>Full Access</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Complete system control including client management, trainer management, 
                            package configuration, billing, and system settings.
                          </p>
                        </div>

                        <div className="p-4 border rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Trainer</h4>
                            <Badge variant="secondary">Limited Access</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Manage assigned clients, create diet plans and workout programs, 
                            conduct live sessions, and track client progress.
                          </p>
                        </div>

                        <div className="p-4 border rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Client</h4>
                            <Badge variant="outline">User Access</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Access personal dashboard, view assigned workouts and diet plans, 
                            track progress, join live sessions, and communicate with trainers.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription>
                        Configure system alerts and reminders
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Send notifications via email</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          defaultChecked={settings.notificationSettings?.emailNotifications !== false}
                          data-testid="switch-email-notifications"
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="smsNotifications">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          defaultChecked={settings.notificationSettings?.smsNotifications === true}
                          data-testid="switch-sms-notifications"
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pushNotifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Send push notifications</p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          defaultChecked={settings.notificationSettings?.pushNotifications !== false}
                          data-testid="switch-push-notifications"
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sessionReminders">Session Reminders</Label>
                          <p className="text-sm text-muted-foreground">Remind clients about upcoming sessions</p>
                        </div>
                        <Switch
                          id="sessionReminders"
                          defaultChecked={settings.notificationSettings?.sessionReminders !== false}
                          data-testid="switch-session-reminders"
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="paymentReminders">Payment Reminders</Label>
                          <p className="text-sm text-muted-foreground">Remind clients about due payments</p>
                        </div>
                        <Switch
                          id="paymentReminders"
                          defaultChecked={settings.notificationSettings?.paymentReminders !== false}
                          data-testid="switch-payment-reminders"
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="achievementNotifications">Achievement Notifications</Label>
                          <p className="text-sm text-muted-foreground">Notify clients when they earn achievements</p>
                        </div>
                        <Switch
                          id="achievementNotifications"
                          defaultChecked={settings.notificationSettings?.achievementNotifications !== false}
                          data-testid="switch-achievement-notifications"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="reminderHoursBefore">Reminder Hours Before</Label>
                        <Input
                          id="reminderHoursBefore"
                          type="number"
                          defaultValue={settings.notificationSettings?.reminderHoursBefore || 24}
                          placeholder="24"
                          data-testid="input-reminder-hours"
                        />
                        <p className="text-sm text-muted-foreground">
                          How many hours before an event to send reminders
                        </p>
                      </div>

                      <Button 
                        onClick={() => {
                          handleSaveSettings('notificationSettings', {
                            emailNotifications: (document.getElementById('emailNotifications') as HTMLInputElement).checked,
                            smsNotifications: (document.getElementById('smsNotifications') as HTMLInputElement).checked,
                            pushNotifications: (document.getElementById('pushNotifications') as HTMLInputElement).checked,
                            sessionReminders: (document.getElementById('sessionReminders') as HTMLInputElement).checked,
                            paymentReminders: (document.getElementById('paymentReminders') as HTMLInputElement).checked,
                            achievementNotifications: (document.getElementById('achievementNotifications') as HTMLInputElement).checked,
                            reminderHoursBefore: parseInt((document.getElementById('reminderHoursBefore') as HTMLInputElement).value)
                          });
                        }}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="button-save-notifications"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Integration Settings */}
                <TabsContent value="integrations">
                  <div className="space-y-6">
                    {/* Payment Integration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Payment Gateway
                          </span>
                          <Switch
                            defaultChecked={settings.integrations?.payment?.enabled === true}
                            data-testid="switch-payment-enabled"
                          />
                        </CardTitle>
                        <CardDescription>
                          Connect payment processing services
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentProvider">Provider</Label>
                          <Select defaultValue={settings.integrations?.payment?.provider || 'stripe'}>
                            <SelectTrigger id="paymentProvider" data-testid="select-payment-provider">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stripe">Stripe</SelectItem>
                              <SelectItem value="razorpay">Razorpay</SelectItem>
                              <SelectItem value="paypal">PayPal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paymentApiKey">API Key</Label>
                          <div className="flex gap-2">
                            <Input
                              id="paymentApiKey"
                              type={showApiKeys['payment'] ? 'text' : 'password'}
                              defaultValue={settings.integrations?.payment?.apiKey || ''}
                              placeholder="Enter API key"
                              data-testid="input-payment-api-key"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleApiKeyVisibility('payment')}
                              data-testid="button-toggle-payment-key"
                            >
                              {showApiKeys['payment'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <Button 
                          onClick={() => {
                            const provider = (document.getElementById('paymentProvider') as HTMLInputElement).value;
                            const apiKey = (document.getElementById('paymentApiKey') as HTMLInputElement).value;
                            const enabled = (document.querySelector('[data-testid="switch-payment-enabled"]') as HTMLInputElement)?.checked;
                            
                            handleSaveSettings('integrations', {
                              ...settings.integrations,
                              payment: { provider, apiKey, enabled }
                            });
                          }}
                          disabled={updateSettingsMutation.isPending}
                          data-testid="button-save-payment"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Payment Settings
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Email Integration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Email Service
                          </span>
                          <Switch
                            defaultChecked={settings.integrations?.email?.enabled === true}
                            data-testid="switch-email-enabled"
                          />
                        </CardTitle>
                        <CardDescription>
                          Configure email delivery service
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="emailProvider">Provider</Label>
                          <Select defaultValue={settings.integrations?.email?.provider || 'sendgrid'}>
                            <SelectTrigger id="emailProvider" data-testid="select-email-provider">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sendgrid">SendGrid</SelectItem>
                              <SelectItem value="mailgun">Mailgun</SelectItem>
                              <SelectItem value="ses">AWS SES</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fromEmail">From Email</Label>
                          <Input
                            id="fromEmail"
                            type="email"
                            defaultValue={settings.integrations?.email?.fromEmail || ''}
                            placeholder="noreply@yourgym.com"
                            data-testid="input-from-email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emailApiKey">API Key</Label>
                          <div className="flex gap-2">
                            <Input
                              id="emailApiKey"
                              type={showApiKeys['email'] ? 'text' : 'password'}
                              defaultValue={settings.integrations?.email?.apiKey || ''}
                              placeholder="Enter API key"
                              data-testid="input-email-api-key"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleApiKeyVisibility('email')}
                              data-testid="button-toggle-email-key"
                            >
                              {showApiKeys['email'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <Button 
                          onClick={() => {
                            const provider = (document.getElementById('emailProvider') as HTMLInputElement).value;
                            const fromEmail = (document.getElementById('fromEmail') as HTMLInputElement).value;
                            const apiKey = (document.getElementById('emailApiKey') as HTMLInputElement).value;
                            const enabled = (document.querySelector('[data-testid="switch-email-enabled"]') as HTMLInputElement)?.checked;
                            
                            handleSaveSettings('integrations', {
                              ...settings.integrations,
                              email: { provider, fromEmail, apiKey, enabled }
                            });
                          }}
                          disabled={updateSettingsMutation.isPending}
                          data-testid="button-save-email"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Email Settings
                        </Button>
                      </CardContent>
                    </Card>

                    {/* SMS Integration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            SMS Service
                          </span>
                          <Switch
                            defaultChecked={settings.integrations?.sms?.enabled === true}
                            data-testid="switch-sms-enabled"
                          />
                        </CardTitle>
                        <CardDescription>
                          Configure SMS notification service
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="smsProvider">Provider</Label>
                          <Select defaultValue={settings.integrations?.sms?.provider || 'twilio'}>
                            <SelectTrigger id="smsProvider" data-testid="select-sms-provider">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="twilio">Twilio</SelectItem>
                              <SelectItem value="nexmo">Nexmo</SelectItem>
                              <SelectItem value="msg91">MSG91</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smsApiKey">API Key</Label>
                          <div className="flex gap-2">
                            <Input
                              id="smsApiKey"
                              type={showApiKeys['sms'] ? 'text' : 'password'}
                              defaultValue={settings.integrations?.sms?.apiKey || ''}
                              placeholder="Enter API key"
                              data-testid="input-sms-api-key"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleApiKeyVisibility('sms')}
                              data-testid="button-toggle-sms-key"
                            >
                              {showApiKeys['sms'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <Button 
                          onClick={() => {
                            const provider = (document.getElementById('smsProvider') as HTMLInputElement).value;
                            const apiKey = (document.getElementById('smsApiKey') as HTMLInputElement).value;
                            const enabled = (document.querySelector('[data-testid="switch-sms-enabled"]') as HTMLInputElement)?.checked;
                            
                            handleSaveSettings('integrations', {
                              ...settings.integrations,
                              sms: { provider, apiKey, enabled }
                            });
                          }}
                          disabled={updateSettingsMutation.isPending}
                          data-testid="button-save-sms"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save SMS Settings
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Calendar Integration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Calendar Sync
                          </span>
                          <Switch
                            defaultChecked={settings.integrations?.calendar?.enabled === true}
                            data-testid="switch-calendar-enabled"
                          />
                        </CardTitle>
                        <CardDescription>
                          Sync sessions with calendar applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="calendarProvider">Provider</Label>
                          <Select defaultValue={settings.integrations?.calendar?.provider || 'google'}>
                            <SelectTrigger id="calendarProvider" data-testid="select-calendar-provider">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="google">Google Calendar</SelectItem>
                              <SelectItem value="outlook">Outlook Calendar</SelectItem>
                              <SelectItem value="apple">Apple Calendar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button 
                          onClick={() => {
                            const provider = (document.getElementById('calendarProvider') as HTMLInputElement).value;
                            const enabled = (document.querySelector('[data-testid="switch-calendar-enabled"]') as HTMLInputElement)?.checked;
                            
                            handleSaveSettings('integrations', {
                              ...settings.integrations,
                              calendar: { provider, enabled }
                            });
                          }}
                          disabled={updateSettingsMutation.isPending}
                          data-testid="button-save-calendar"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Calendar Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, ArrowLeft, Shield, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"admin" | "trainer">("admin");
  
  // Separate state for admin credentials
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  // Separate state for trainer credentials
  const [trainerEmail, setTrainerEmail] = useState("");
  const [trainerPassword, setTrainerPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent, role: "admin" | "trainer") => {
    e.preventDefault();
    setIsLoading(true);
    
    // Use credentials based on the role/tab
    const email = role === "admin" ? adminEmail : trainerEmail;
    const password = role === "admin" ? adminPassword : trainerPassword;
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        toast({
          title: "Login successful",
          description: "Welcome to FitPro Admin Dashboard",
        });
        setLocation("/admin/dashboard");
      } else if (data.user.role === 'trainer') {
        toast({
          title: "Login successful",
          description: "Welcome to FitPro Trainer Dashboard",
        });
        setLocation("/trainer/dashboard");
      } else {
        throw new Error('Invalid user role');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display font-bold tracking-tight">
              FitPro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-display">Staff Login</CardTitle>
              <CardDescription className="mt-2">
                Admin and Trainer access to FitPro dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full" onValueChange={(value) => setActiveTab(value as "admin" | "trainer")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin" data-testid="tab-admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="trainer" data-testid="tab-trainer">
                  <User className="h-4 w-4 mr-2" />
                  Trainer
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin">
                <form onSubmit={(e) => handleLogin(e, "admin")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@fitpro.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      data-testid="input-email"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      data-testid="input-password"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Demo: admin@fitpro.com / Admin@123
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !adminEmail || !adminPassword}
                    data-testid="button-login"
                  >
                    {isLoading ? "Logging in..." : "Login as Admin"}
                  </Button>
                  <div className="text-center">
                    <Button
                      variant="link"
                      type="button"
                      className="text-sm"
                      onClick={() => setLocation("/admin/forgot-password")}
                      data-testid="link-forgot-password"
                    >
                      Forgot Password?
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="trainer">
                <form onSubmit={(e) => handleLogin(e, "trainer")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainer-email">Email</Label>
                    <Input
                      id="trainer-email"
                      type="email"
                      placeholder="trainer@fitpro.com"
                      value={trainerEmail}
                      onChange={(e) => setTrainerEmail(e.target.value)}
                      data-testid="input-trainer-email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainer-password">Password</Label>
                    <Input
                      id="trainer-password"
                      type="password"
                      placeholder="Enter trainer password"
                      value={trainerPassword}
                      onChange={(e) => setTrainerPassword(e.target.value)}
                      data-testid="input-trainer-password"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Demo: trainer@fitpro.com / Trainer@123
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !trainerEmail || !trainerPassword}
                    data-testid="button-trainer-login"
                  >
                    {isLoading ? "Logging in..." : "Login as Trainer"}
                  </Button>
                  <div className="text-center">
                    <Button
                      variant="link"
                      type="button"
                      className="text-sm"
                      onClick={() => setLocation("/admin/forgot-password")}
                      data-testid="link-forgot-password-trainer"
                    >
                      Forgot Password?
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

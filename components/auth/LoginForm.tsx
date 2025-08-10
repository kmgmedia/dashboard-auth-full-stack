import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../ui/alert";
import { Info, Users, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isDemoMode, demoUsers } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || "Failed to sign in");
      } else {
        toast.success("Welcome back!");
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccountSelect = (selectedEmail: string) => {
    const selectedUser = demoUsers.find(user => user.email === selectedEmail);
    if (selectedUser) {
      setEmail(selectedUser.email);
      setPassword(selectedUser.password);
    }
  };

  const handleQuickDemo = () => {
    setEmail("demo@example.com");
    setPassword("demo123");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          {isDemoMode 
            ? "Demo mode - use any of the demo accounts below"
            : "Enter your credentials to access your dashboard"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDemoMode && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> {demoUsers.length} demo account{demoUsers.length !== 1 ? 's' : ''} available
            </AlertDescription>
          </Alert>
        )}

        {!isDemoMode && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure Supabase credentials in your .env file for full functionality.
              <Button 
                className="p-0 h-auto ml-2" 
                onClick={handleQuickDemo}
              >
                Try Demo Instead
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Demo Account Selector */}
        {isDemoMode && demoUsers.length > 1 && (
          <div className="space-y-2">
            <Label>Quick Login</Label>
            <Select onValueChange={handleDemoAccountSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a demo account" />
              </SelectTrigger>
              <SelectContent>
                {demoUsers.map((user) => (
                  <SelectItem key={user.id} value={user.email}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{user.name} ({user.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isDemoMode ? "demo@example.com" : "john@example.com"}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isDemoMode ? "demo123" : "Enter your password"}
                required
              />
              <Button
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-4 text-center space-y-2">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-muted-foreground hover:text-primary block w-full"
          >
            Don't have an account? Sign up
          </button>
          
          {isDemoMode && demoUsers.length >= 1 && (
            <Button 
              className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm"
              onClick={handleQuickDemo}
            >
              Use Default Demo Account
            </Button>
          )}
        </div>

        {/* Demo Users Preview */}
        {isDemoMode && demoUsers.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Available Demo Accounts:
            </h4>
            <div className="space-y-2">
              {demoUsers.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {user.name}
                  </span>
                  <Button
                    onClick={() => handleDemoAccountSelect(user.email)}
                    className="h-auto p-1 text-xs"
                  >
                    Use Account
                  </Button>
                </div>
              ))}
              {demoUsers.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{demoUsers.length - 3} more accounts available
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
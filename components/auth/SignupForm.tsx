import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../ui/alert";
import { Info, Check, X, Eye, EyeOff } from "lucide-react";

interface SignupFormProps {
  onToggleMode: () => void;
}

interface ValidationState {
  name: boolean;
  email: boolean;
  password: {
    length: boolean;
    lowercase: boolean;
    number: boolean;
  };
}

export function SignupForm({ onToggleMode }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const { signUp, isDemoMode, demoUsers } = useAuth();

  // Validation logic
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validation: ValidationState = {
    name: name.trim().length >= 2,
    email: validateEmail(email),
    password: {
      length: password.length >= 6,
      lowercase: /(?=.*[a-z])/.test(password),
      number: /(?=.*\d)/.test(password),
    },
  };

  const isFormValid =
    validation.name &&
    validation.email &&
    validation.password.length &&
    validation.password.lowercase &&
    validation.password.number;

  const isEmailTaken =
    isDemoMode && demoUsers.some((user) => user.email === email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true });

    if (!isFormValid) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    if (isEmailTaken) {
      toast.error("An account with this email already exists");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message || "Failed to create account");
      } else {
        toast.success(
          isDemoMode
            ? "Demo account created successfully! You can now sign in."
            : "Account created! You can now sign in."
        );
        onToggleMode();

        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setTouched({ name: false, email: false, password: false });
      }
    } catch (error) {
      console.error("Unexpected signup error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }: { isValid: boolean }) =>
    isValid ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          {isDemoMode
            ? "Create a demo account to explore the dashboard"
            : "Sign up to get started with your dashboard"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDemoMode && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> Your account will be stored locally.
              {demoUsers.length > 1 &&
                ` ${demoUsers.length - 1} other demo accounts exist.`}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              placeholder="John Doe"
              className={
                touched.name && !validation.name ? "border-red-500" : ""
              }
            />
            {touched.name && (
              <div className="flex items-center gap-2 text-sm">
                <ValidationIcon isValid={validation.name} />
                <span
                  className={
                    validation.name ? "text-green-600" : "text-red-500"
                  }
                >
                  At least 2 characters
                </span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="john@example.com"
              className={
                (touched.email && !validation.email) || isEmailTaken
                  ? "border-red-500"
                  : ""
              }
            />
            {touched.email && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={validation.email} />
                  <span
                    className={
                      validation.email ? "text-green-600" : "text-red-500"
                    }
                  >
                    Valid email format
                  </span>
                </div>
                {isEmailTaken && (
                  <div className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">Email is already taken</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, password: true }))
                }
                placeholder="Create a strong password"
                className={
                  touched.password &&
                  Object.values(validation.password).some((v) => !v)
                    ? "border-red-500"
                    : ""
                }
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
            {touched.password && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={validation.password.length} />
                  <span
                    className={
                      validation.password.length
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={validation.password.lowercase} />
                  <span
                    className={
                      validation.password.lowercase
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={validation.password.number} />
                  <span
                    className={
                      validation.password.number
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    One number
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isFormValid || isEmailTaken}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Already have an account? Sign in
          </button>
        </div>

        {/* Demo Users List (only in demo mode) */}
        {isDemoMode && demoUsers.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">
              Existing Demo Accounts:
            </h4>
            <div className="space-y-1">
              {demoUsers.map((user) => (
                <div key={user.id} className="text-sm text-muted-foreground">
                  {user.name} ({user.email})
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

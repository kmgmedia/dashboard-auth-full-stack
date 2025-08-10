import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export function AuthWrapper() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => setIsLoginMode(!isLoginMode);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLoginMode ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
}
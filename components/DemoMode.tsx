import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";

export function DemoModeNotice() {
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://demo.supabase.co';
  
  if (!isDemoMode) return null;

  return (
    <Alert className="bg-white mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Demo Mode:</strong> Configure your Supabase credentials in{" "}
        <code>.env</code> to enable authentication and data persistence.
      </AlertDescription>
    </Alert>
  );
}
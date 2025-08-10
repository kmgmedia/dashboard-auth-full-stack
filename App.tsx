import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import { Navigation } from "./components/Navigation";
import { AuthWrapper } from "./components/auth/AuthWrapper";
import { Alert, AlertDescription } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";

// Lazy load the heavy components, mapping named exports to default
const HeroPanel = lazy(() =>
  import("./components/HeroPanel").then((m) => ({ default: m.HeroPanel }))
);
const SummaryCards = lazy(() =>
  import("./components/SummaryCards").then((m) => ({ default: m.SummaryCards }))
);
const EnhancedEntriesTable = lazy(() =>
  import("./components/EnhancedEntriesTable").then((m) => ({
    default: m.EnhancedEntriesTable,
  }))
);

function DashboardContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground text-sm font-medium">
              D
            </span>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  return (
    <ProjectsProvider>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-6 py-8 space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back,{" "}
              {user.user_metadata?.name || user.email?.split("@")[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your Dashboard today.
            </p>
          </div>

          {/* Demo Account Notice */}
          {user.email === "demo@example.com" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're using the pro account. Create your own account to persist
                your data.
              </AlertDescription>
            </Alert>
          )}

          {/* Lazy-loaded sections */}
          <Suspense fallback={<p>Loading stats...</p>}>
            <HeroPanel />
          </Suspense>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Quick Overview</h2>
            <Suspense fallback={<p>Loading summary...</p>}>
              <SummaryCards />
            </Suspense>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Your Projects</h2>
            <Suspense fallback={<p>Loading projects...</p>}>
              <EnhancedEntriesTable />
            </Suspense>
          </div>
        </main>
      </div>
    </ProjectsProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="dashboard-theme">
      <AuthProvider>
        <DashboardContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

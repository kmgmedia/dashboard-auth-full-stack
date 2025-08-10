import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "./ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { User, Settings, Save, X, Calendar, Mail, Shield } from "lucide-react";

export function UserProfile() {
  const { user, updateProfile, isDemoMode, demoUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates: any = {};
      if (formData.name !== user?.user_metadata?.name) {
        updates.name = formData.name;
      }
      if (formData.email !== user?.email) {
        updates.email = formData.email;
      }

      if (Object.keys(updates).length === 0) {
        toast.info("No changes to save");
        setIsOpen(false);
        return;
      }

      const { error } = await updateProfile(updates);
      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully!");
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
    });
  };

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 bg-white">
          <Settings className="h-4 w-4" />
          Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View and edit your profile information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.user_metadata?.name || 'Unknown User'}</h3>
                    {isDemoMode && <Badge variant="secondary">Demo</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(user.created_at)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    {isDemoMode ? 'Demo Account' : 'Full Account'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Mode Info */}
          {isDemoMode && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Mode:</strong> Profile changes are saved locally. 
                {demoUsers.length > 1 && ` ${demoUsers.length} total demo accounts.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                  {isDemoMode && formData.email !== user.email && (
                    <p className="text-xs text-muted-foreground">
                      Note: Email changes in demo mode only affect the local account
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Stats (Demo Mode) */}
          {isDemoMode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Demo Account Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Account Type</p>
                    <p className="font-medium">Demo User</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Demo Users</p>
                    <p className="font-medium">{demoUsers.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Login</p>
                    <p className="font-medium">{formatDate(user.last_sign_in_at || user.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Storage</p>
                    <p className="font-medium">Local Browser</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
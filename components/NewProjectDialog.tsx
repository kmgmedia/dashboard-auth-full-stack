import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useProjects, CreateProjectData } from "../contexts/ProjectsContext";
import { useAuth } from "../contexts/AuthContext";
import { Plus, Calendar, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface NewProjectDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function NewProjectDialog({ trigger, onSuccess }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    dueDate: "",
  });

  const { createProject } = useProjects();
  const { user, isDemoMode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsCreating(true);

    try {
      const { success, error } = await createProject(formData);
      
      if (success) {
        // Reset form
        setFormData({
          name: "",
          description: "",
          status: "Planning",
          priority: "Medium",
          dueDate: "",
        });
        setOpen(false);
        onSuccess?.();
      } else {
        console.error('Failed to create project:', error);
      }
    } catch (error) {
      console.error('Unexpected error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "Planning",
      priority: "Medium",
      dueDate: "",
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const defaultTrigger = (
    <Button className="bg-black text-white hover:bg-gray-800 gap-2">
      <Plus className="w-4 h-4" />
      New Project
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Add a new project to track progress and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        {isDemoMode && (
          <Alert>
            <AlertDescription className="mt-1">
              Your project will be stored locally in demo mode. Switch to a real
              account for cloud storage.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              Project Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter project name"
              required
              className="transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your project (optional)"
              rows={3}
              className="resize-none transition-all"
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Planning">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      Planning
                    </div>
                  </SelectItem>
                  <SelectItem value="In Progress">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="Review">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Review
                    </div>
                  </SelectItem>
                  <SelectItem value="Completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Completed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="High">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="Critical">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Critical
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              min={new Date().toISOString().split("T")[0]}
              className="transition-all"
            />
            {!formData.dueDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: getTomorrowDate(),
                  }))
                }
                className="text-xs text-muted-foreground h-auto p-1"
              >
                Set to tomorrow
              </Button>
            )}
          </div>

          {/* Assignee Preview */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <User className="h-4 w-4" />
              Assigned to:
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                {(user?.user_metadata?.name || user?.email || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <span className="text-sm font-medium">
                {user?.user_metadata?.name || user?.email || "Unknown User"}
              </span>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || isCreating}
            className="gap-2"
          >
            {isCreating ? (
              <>Creating...</>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
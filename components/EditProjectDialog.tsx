import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Calendar, User, Edit3, Save, X } from "lucide-react";
import { Project, useProjects } from "../contexts/ProjectsContext";
import { useAuth } from "../contexts/AuthContext";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface EditFormData {
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
}

export function EditProjectDialog({ project, open, onOpenChange, onSuccess }: EditProjectDialogProps) {
  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    dueDate: "",
    progress: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { updateProject } = useProjects();
  const { isDemoMode } = useAuth();

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      const initialData = {
        name: project.name,
        description: project.description || "",
        status: project.status,
        priority: project.priority,
        dueDate: project.dueDate,
        progress: project.progress,
      };
      setFormData(initialData);
      setHasChanges(false);
    }
  }, [project]);

  // Track changes
  useEffect(() => {
    if (project) {
      const hasFormChanges = 
        formData.name !== project.name ||
        formData.description !== (project.description || "") ||
        formData.status !== project.status ||
        formData.priority !== project.priority ||
        formData.dueDate !== project.dueDate ||
        formData.progress !== project.progress;
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: Partial<Project> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        progress: formData.progress,
      };

      const { success, error } = await updateProject(project.id, updateData);
      
      if (success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        console.error('Failed to update project:', error);
        toast.error(error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Unexpected error updating project:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasChanges && !isSubmitting) {
      // Could add a confirmation dialog here
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onOpenChange(newOpen);
        if (project) {
          // Reset form to original values
          setFormData({
            name: project.name,
            description: project.description || "",
            status: project.status,
            priority: project.priority,
            dueDate: project.dueDate,
            progress: project.progress,
          });
        }
      }
    } else {
      onOpenChange(newOpen);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Edit3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>Edit Project</span>
                <Badge variant="outline" className="text-xs">
                  {project.id}
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Make changes to your project information and progress.
          </DialogDescription>
        </DialogHeader>

        {isDemoMode && (
          <Alert>
            <Badge variant="secondary" className="w-fit">
              Demo Mode
            </Badge>
            <AlertDescription className="mt-1">
              Changes will be saved locally in demo mode.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="flex items-center gap-2">
              Project Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Project description (optional)"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
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
              <Label htmlFor="edit-priority">Priority</Label>
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

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-progress">Progress</Label>
              <span className="text-sm font-medium">{formData.progress}%</span>
            </div>
            <Slider
              value={[formData.progress]}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, progress: value[0] }))
              }
              max={100}
              step={5}
              className="bg-slate-200 w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-dueDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            <Input
              id="edit-dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Assignee (Read-only) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Assigned to (read-only)
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={project.assignee.avatar} />
                <AvatarFallback className="text-xs">
                  {project.assignee.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{project.assignee.name}</p>
              </div>
            </div>
          </div>

          {/* Timestamps (Read-only) */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(project.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !hasChanges || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
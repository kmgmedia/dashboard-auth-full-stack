import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Calendar, User, Flag, Activity, Clock, FileText, Edit, X } from "lucide-react";
import { Project } from "../contexts/ProjectsContext";

interface ViewProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (project: Project) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Planning":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "Review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "High":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "Medium":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Low":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "🔴";
    case "High":
      return "🟠";
    case "Medium":
      return "🔵";
    case "Low":
      return "⚪";
    default:
      return "⚪";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return "✅";
    case "In Progress":
      return "🔄";
    case "Planning":
      return "📋";
    case "Review":
      return "👁️";
    default:
      return "📋";
  }
};

export function ViewProjectDialog({ project, open, onOpenChange, onEdit }: ViewProjectDialogProps) {
  if (!project) return null;

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-2xl" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{project.name}</span>
                <Badge variant="outline" className="text-xs">
                  {project.id}
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Project details and progress overview
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white space-y-6">
          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Status
              </div>
              <Badge variant="outline" className={`${getStatusColor(project.status)} w-fit`}>
                <span className="mr-1">{getStatusIcon(project.status)}</span>
                {project.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flag className="h-4 w-4" />
                Priority
              </div>
              <Badge variant="outline" className={`${getPriorityColor(project.priority)} w-fit`}>
                <span className="mr-1">{getPriorityIcon(project.priority)}</span>
                {project.priority}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">{project.description}</p>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Progress
              </div>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Assigned to
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={project.assignee.avatar} />
                <AvatarFallback>{project.assignee.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{project.assignee.name}</p>
                <p className="text-sm text-muted-foreground">Project Owner</p>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due Date
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatDate(project.dueDate)}</span>
              <Badge variant={new Date(project.dueDate) < new Date() ? "destructive" : "secondary"} className="text-xs">
                {new Date(project.dueDate) < new Date() ? "Overdue" : "Upcoming"}
              </Badge>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Created
              </div>
              <p className="text-sm">{formatDate(project.createdAt)}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Last Updated
              </div>
              <p className="text-sm">{getTimeAgo(project.updatedAt)}</p>
            </div>
          </div>
        </div>

        {onEdit && (
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
            <Button 
              onClick={() => {
                onEdit(project);
                onOpenChange(false);
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Project
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
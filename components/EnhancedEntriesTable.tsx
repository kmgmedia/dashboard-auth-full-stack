import { useState, useMemo } from "react";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NewProjectDialog } from "./NewProjectDialog";
import { ViewProjectDialog } from "./ViewProjectDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { useProjects, Project } from "../contexts/ProjectsContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

type SortField = keyof Project | "assigneeName";
type SortOrder = "asc" | "desc";

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

export function EnhancedEntriesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const { projects, loading, deleteProject } = useProjects();
  useAuth();

  const handleDeleteProject = async (projectId: string) => {
    // Add confirmation dialog
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { success, error } = await deleteProject(projectId);
      if (!success) {
        console.error("Failed to delete project:", error);
        toast.error(error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Unexpected error deleting project:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleViewProject = (project: Project) => {
    setViewProject(project);
  };

  const handleEditProject = (project: Project) => {
    setEditProject(project);
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.assignee.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || project.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "assigneeName":
          aValue = a.assignee.name;
          bValue = b.assignee.name;
          break;
        case "dueDate":
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    projects,
    searchTerm,
    statusFilter,
    priorityFilter,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || priorityFilter !== "all";

  return (
    <Card>
      <CardHeader>
        <div className="bg-white flex items-center justify-between">
          <div>
            <CardTitle>Project Entries</CardTitle>
            <CardDescription>
              Manage and track all your project entries (
              {filteredAndSortedProjects.length} total)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <NewProjectDialog />
            <Button className="gap-2 btn-outline btn-sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="bg-white space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search projects or assignees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-white w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-2">
                    ID
                    <SortIcon field="id" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Project Name
                    <SortIcon field="name" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <SortIcon field="status" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("assigneeName")}
                >
                  <div className="flex items-center gap-2">
                    Assignee
                    <SortIcon field="assigneeName" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center gap-2">
                    Priority
                    <SortIcon field="priority" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("dueDate")}
                >
                  <div className="flex items-center gap-2">
                    Due Date
                    <SortIcon field="dueDate" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("progress")}
                >
                  <div className="flex items-center gap-2">
                    Progress
                    <SortIcon field="progress" />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading projects...
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          {hasActiveFilters
                            ? "No projects match your filters"
                            : "No projects yet"}
                        </p>
                        {!hasActiveFilters && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Create your first project to get started
                          </p>
                        )}
                      </div>
                      {!hasActiveFilters && (
                        <NewProjectDialog
                          trigger={
                            <Button className="gap-2">
                              <Plus className="w-4 h-4" />
                              Create Project
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className=" bg-white font-mono text-sm">
                      {project.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div
                          className="font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleViewProject(project)}
                          title="Click to view project details"
                        >
                          {project.name}
                        </div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(project.status)}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={project.assignee.avatar} />
                          <AvatarFallback className="text-xs">
                            {project.assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{project.assignee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(project.priority)}
                      >
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{project.dueDate}</TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => handleEditProject(project)}
                        title="Click to edit project"
                      >
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-[60px]">
                          <div
                            className="bg-black h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          {project.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-8 w-8 p-0"
                            type="button"
                          >
                            <MoreHorizontal className="gh-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white" align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="bg-white gap-2 cursor-pointer"
                            onClick={() => handleViewProject(project)}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="bg-white gap-2 cursor-pointer"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="w-4 h-4" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="bg-white gap-2 text-destructive cursor-pointer"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Project Dialog */}
        <ViewProjectDialog
          project={viewProject}
          open={!!viewProject}
          onOpenChange={(open) => !open && setViewProject(null)}
          onEdit={(project) => {
            setViewProject(null);
            setEditProject(project);
          }}
        />

        {/* Edit Project Dialog */}
        <EditProjectDialog
          project={editProject}
          open={!!editProject}
          onOpenChange={(open) => !open && setEditProject(null)}
          onSuccess={() => {
            setEditProject(null);
          }}
        />
      </CardContent>
    </Card>
  );
}

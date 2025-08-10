import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useProjects } from "../contexts/ProjectsContext";
import { NewProjectDialog } from "./NewProjectDialog";

export function SummaryCards() {
  const { projects } = useProjects();
  
  // Calculate project status percentages
  const totalProjects = projects.length;
  const statusCounts = {
    completed: projects.filter(p => p.status === "Completed").length,
    inProgress: projects.filter(p => p.status === "In Progress").length,
    planning: projects.filter(p => p.status === "Planning").length,
    review: projects.filter(p => p.status === "Review").length,
  };
  
  const statusPercentages = totalProjects > 0 ? {
    completed: Math.round((statusCounts.completed / totalProjects) * 100),
    inProgress: Math.round((statusCounts.inProgress / totalProjects) * 100),
    planning: Math.round((statusCounts.planning / totalProjects) * 100),
    review: Math.round((statusCounts.review / totalProjects) * 100),
  } : { completed: 0, inProgress: 0, planning: 0, review: 0 };
  
  // Get recent projects for activity
  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  return (
    <div className=" bg-white grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Latest updates from your projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentProjects.length > 0 ? (
            recentProjects.map((project, index) => (
              <div key={project.id} className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    project.status === "Completed"
                      ? "bg-green-500"
                      : project.status === "In Progress"
                      ? "bg-blue-500"
                      : project.status === "Review"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm">
                    {project.name} - {project.status.toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">
                Create your first project to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Project Status</CardTitle>
          <CardDescription>Overview of current project states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                Completed ({statusCounts.completed})
              </span>
              <span className="text-sm text-muted-foreground">
                {statusPercentages.completed}%
              </span>
            </div>
            <Progress value={statusPercentages.completed} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                In Progress ({statusCounts.inProgress})
              </span>
              <span className="text-sm text-muted-foreground">
                {statusPercentages.inProgress}%
              </span>
            </div>
            <Progress value={statusPercentages.inProgress} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                Planning ({statusCounts.planning})
              </span>
              <span className="text-sm text-muted-foreground">
                {statusPercentages.planning}%
              </span>
            </div>
            <Progress value={statusPercentages.planning} className="h-2" />
          </div>
          {statusCounts.review > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Review ({statusCounts.review})</span>
                <span className="text-sm text-muted-foreground">
                  {statusPercentages.review}%
                </span>
              </div>
              <Progress value={statusPercentages.review} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Success Rate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">94.2%</span>
              <ArrowUpRight className="w-3 h-3 text-green-500" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Avg. Response</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">2.4s</span>
              <ArrowDownRight className="w-3 h-3 text-green-500" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
              <span className="text-sm">Conversion</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">12.8%</span>
              <ArrowUpRight className="w-3 h-3 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <NewProjectDialog
              trigger={
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  New Project
                </Badge>
              }
            />
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
            >
              Create Report
            </Badge>
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
            >
              Schedule Meeting
            </Badge>
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
            >
              Export Data
            </Badge>
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
            >
              View Analytics
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
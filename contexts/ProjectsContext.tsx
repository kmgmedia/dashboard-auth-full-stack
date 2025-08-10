import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { projectId } from '../utils/supabase/info';
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  assignee: {
    name: string;
    avatar: string;
    initials: string;
  };
  priority: string;
  dueDate: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

interface CreateProjectData {
  name: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  createProject: (data: CreateProjectData) => Promise<{ success: boolean; error?: string }>;
  updateProject: (id: string, data: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshProjects: () => Promise<void>;
}

// Demo projects storage key
const DEMO_PROJECTS_KEY = 'dashboard-demo-projects';

const defaultProjects: Project[] = [
  {
    id: "proj_1640995200000",
    name: "Website Redesign",
    description: "Complete overhaul of the company website",
    status: "In Progress",
    assignee: {
      name: "Alice Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
      initials: "AJ"
    },
    priority: "High",
    dueDate: "2024-02-15",
    progress: 65,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "proj_1641081600000",
    name: "Mobile App Development",
    description: "Native mobile app for iOS and Android",
    status: "Planning",
    assignee: {
      name: "Bob Smith",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face",
      initials: "BS"
    },
    priority: "Medium",
    dueDate: "2024-03-01",
    progress: 20,
    createdAt: "2024-01-05T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "proj_1641168000000",
    name: "Database Migration",
    description: "Migrate to new database infrastructure",
    status: "Completed",
    assignee: {
      name: "Carol Wilson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
      initials: "CW"
    },
    priority: "High",
    dueDate: "2024-01-30",
    progress: 100,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-30T00:00:00.000Z"
  }
];

// Demo projects management
const getDemoProjects = (userId: string): Project[] => {
  try {
    const stored = localStorage.getItem(`${DEMO_PROJECTS_KEY}-${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading demo projects:', error);
  }
  
  // Return default projects for this user
  return defaultProjects.map(project => ({ ...project, userId }));
};

const saveDemoProjects = (userId: string, projects: Project[]) => {
  try {
    localStorage.setItem(`${DEMO_PROJECTS_KEY}-${userId}`, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving demo projects:', error);
  }
};

const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  loading: true,
  createProject: async () => ({ success: false }),
  updateProject: async () => ({ success: false }),
  deleteProject: async () => ({ success: false }),
  refreshProjects: async () => {},
});

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, session, isDemoMode } = useAuth();

  const loadProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    if (isDemoMode) {
      // Demo mode - load from localStorage
      const demoProjects = getDemoProjects(user.id);
      setProjects(demoProjects);
      setLoading(false);
    } else {
      // Real mode - load from Supabase
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ff9daf5a/projects`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        } else {
          console.error('Failed to load projects:', await response.text());
          setProjects([]);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const createProject = async (data: CreateProjectData): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      ...data,
      assignee: {
        name: user.user_metadata?.name || user.email || "Unknown",
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`,
        initials: (user.user_metadata?.name || user.email || "UN")
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
      },
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.id,
    };

    if (isDemoMode) {
      // Demo mode - save to localStorage
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      saveDemoProjects(user.id, updatedProjects);
      toast.success('Project created successfully!');
      return { success: true };
    } else {
      // Real mode - save to Supabase
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ff9daf5a/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const responseData = await response.json();
          setProjects(prev => [...prev, responseData.project]);
          toast.success('Project created successfully!');
          return { success: true };
        } else {
          const errorText = await response.text();
          console.error('Create project error:', errorText);
          return { success: false, error: errorText || 'Failed to create project' };
        }
      } catch (error) {
        console.error('Error creating project:', error);
        return { success: false, error: 'Network error while creating project' };
      }
    }
  };

  const updateProject = async (id: string, updateData: Partial<Project>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (isDemoMode) {
      // Demo mode - update in localStorage
      const updatedProjects = projects.map(project => 
        project.id === id 
          ? { ...project, ...updateData, updatedAt: new Date().toISOString() }
          : project
      );
      setProjects(updatedProjects);
      saveDemoProjects(user.id, updatedProjects);
      toast.success('Project updated successfully!');
      return { success: true };
    } else {
      // Real mode - update in Supabase
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ff9daf5a/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          const responseData = await response.json();
          setProjects(prev => prev.map(p => p.id === id ? responseData.project : p));
          toast.success('Project updated successfully!');
          return { success: true };
        } else {
          const errorText = await response.text();
          console.error('Update project error:', errorText);
          return { success: false, error: errorText || 'Failed to update project' };
        }
      } catch (error) {
        console.error('Error updating project:', error);
        return { success: false, error: 'Network error while updating project' };
      }
    }
  };

  const deleteProject = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (isDemoMode) {
      // Demo mode - remove from localStorage
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      saveDemoProjects(user.id, updatedProjects);
      toast.success('Project deleted successfully!');
      return { success: true };
    } else {
      // Real mode - delete from Supabase
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ff9daf5a/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        });

        if (response.ok) {
          setProjects(prev => prev.filter(p => p.id !== id));
          toast.success('Project deleted successfully!');
          return { success: true };
        } else {
          const errorText = await response.text();
          console.error('Delete project error:', errorText);
          return { success: false, error: errorText || 'Failed to delete project' };
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        return { success: false, error: 'Network error while deleting project' };
      }
    }
  };

  const refreshProjects = async () => {
    await loadProjects();
  };

  useEffect(() => {
    loadProjects();
  }, [user, session, isDemoMode]);

  const value = {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

export type { Project, CreateProjectData };
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize demo user on startup
async function initializeDemoUser() {
  try {
    const { data: existingUser } = await supabase.auth.admin.getUserById('demo-user-id');
    
    if (!existingUser.user) {
      console.log('Creating demo user...');
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'demo@example.com',
        password: 'demo123',
        user_metadata: { name: 'Demo User' },
        email_confirm: true
      });
      
      if (error) {
        console.log('Error creating demo user:', error);
      } else {
        console.log('Demo user created successfully');
      }
    }
  } catch (error) {
    console.log('Error initializing demo user:', error);
  }
}

// Initialize demo user
initializeDemoUser();

// Authentication helper
async function authenticateUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { user: null, error: 'No token provided' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { user: null, error: 'Invalid token' };
  }
  
  return { user, error: null };
}

// Health check endpoint
app.get('/make-server-ff9daf5a/health', async (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.post('/make-server-ff9daf5a/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${email}`);
    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.get('/make-server-ff9daf5a/projects', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const projects = await kv.getByPrefix(`user:${user.id}:projects:`);
    return c.json({ projects });
  } catch (error) {
    console.log(`Get projects error: ${error}`);
    return c.json({ error: 'Internal server error while fetching projects' }, 500);
  }
});

app.post('/make-server-ff9daf5a/projects', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const projectData = await c.req.json();
    const projectId = `proj_${Date.now()}`;
    const project = {
      id: projectId,
      ...projectData,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:projects:${projectId}`, project);
    return c.json({ project });
  } catch (error) {
    console.log(`Create project error: ${error}`);
    return c.json({ error: 'Internal server error while creating project' }, 500);
  }
});

app.put('/make-server-ff9daf5a/projects/:id', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const projectId = c.req.param('id');
    const updateData = await c.req.json();
    
    const existingProject = await kv.get(`user:${user.id}:projects:${projectId}`);
    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const updatedProject = {
      ...existingProject,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:projects:${projectId}`, updatedProject);
    return c.json({ project: updatedProject });
  } catch (error) {
    console.log(`Update project error: ${error}`);
    return c.json({ error: 'Internal server error while updating project' }, 500);
  }
});

app.delete('/make-server-ff9daf5a/projects/:id', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const projectId = c.req.param('id');
    await kv.del(`user:${user.id}:projects:${projectId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete project error: ${error}`);
    return c.json({ error: 'Internal server error while deleting project' }, 500);
  }
});

// User preferences
app.get('/make-server-ff9daf5a/user/preferences', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const preferences = await kv.get(`user:${user.id}:preferences`) || { theme: 'system' };
    return c.json({ preferences });
  } catch (error) {
    console.log(`Get preferences error: ${error}`);
    return c.json({ error: 'Internal server error while fetching preferences' }, 500);
  }
});

app.post('/make-server-ff9daf5a/user/preferences', async (c) => {
  try {
    const { user, error } = await authenticateUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const preferences = await c.req.json();
    await kv.set(`user:${user.id}:preferences`, preferences);
    return c.json({ preferences });
  } catch (error) {
    console.log(`Save preferences error: ${error}`);
    return c.json({ error: 'Internal server error while saving preferences' }, 500);
  }
});

Deno.serve(app.fetch);
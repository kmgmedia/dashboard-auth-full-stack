// Environment variable detection with fallbacks
function getEnvVar(key: string): string {
  // For Vite environments
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  
  // For other environments, try process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  
  // Fallback to empty string
  return '';
}

// Extract project ID from URL or use demo value
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://demo.supabase.co';
export const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || 'demo-project';
export const publicAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'demo-key';

// Export demo mode detection
export const isDemoMode = supabaseUrl === 'https://demo.supabase.co';
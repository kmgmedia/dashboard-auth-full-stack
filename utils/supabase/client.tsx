import { createClient } from '@supabase/supabase-js';

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

// Get environment variables with fallbacks
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://demo.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'demo-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export for checking demo mode
export const isDemoMode = supabaseUrl === 'https://demo.supabase.co';
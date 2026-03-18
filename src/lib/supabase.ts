import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

// Database schema types
export interface DbGenerationJob {
  id: string;
  user_id: string;
  mode: string;
  prompt: string;
  negative_prompt: string;
  duration: number;
  aspect_ratio: string;
  resolution: string;
  fps: number;
  physics_config: Record<string, unknown>;
  camera_config: Record<string, unknown>;
  seed: number;
  guidance_scale: number;
  inference_steps: number;
  source_image_url: string | null;
  source_video_url: string | null;
  audio_url: string | null;
  face_image_url: string | null;
  reference_video_url: string | null;
  style_reference: string | null;
  status: string;
  progress: number;
  current_phase: string;
  output_url: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  error: string | null;
  render_metrics: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  clips: Record<string, unknown>[];
  timeline: Record<string, unknown>[];
  total_duration: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface DbDownload {
  id: string;
  user_id: string;
  job_id: string;
  file_name: string;
  file_size: number;
  format: string;
  resolution: string;
  status: string;
  download_url: string | null;
  progress: number;
  created_at: string;
}

// SQL migration for reference
export const SCHEMA_SQL = `
-- Generation Jobs
CREATE TABLE IF NOT EXISTS generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 5,
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  resolution TEXT NOT NULL DEFAULT '1080p',
  fps INTEGER NOT NULL DEFAULT 30,
  physics_config JSONB NOT NULL DEFAULT '{}',
  camera_config JSONB NOT NULL DEFAULT '{}',
  seed INTEGER NOT NULL DEFAULT 0,
  guidance_scale NUMERIC NOT NULL DEFAULT 7.5,
  inference_steps INTEGER NOT NULL DEFAULT 50,
  source_image_url TEXT,
  source_video_url TEXT,
  audio_url TEXT,
  face_image_url TEXT,
  reference_video_url TEXT,
  style_reference TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER NOT NULL DEFAULT 0,
  current_phase TEXT NOT NULL DEFAULT 'Queued',
  output_url TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  error TEXT,
  render_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  clips JSONB NOT NULL DEFAULT '[]',
  timeline JSONB NOT NULL DEFAULT '[]',
  total_duration NUMERIC NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES generation_jobs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  format TEXT NOT NULL DEFAULT 'mp4',
  resolution TEXT NOT NULL DEFAULT '1080p',
  status TEXT NOT NULL DEFAULT 'pending',
  download_url TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- RLS Policies
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON generation_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON generation_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON generation_jobs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own downloads" ON downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own downloads" ON downloads FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
`;

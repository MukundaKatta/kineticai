// ============================================================
// KineticAI Type Definitions
// ============================================================

export type GenerationMode = "text-to-video" | "image-to-video" | "lip-sync" | "motion-transfer";

export type VideoLength = 5 | 10 | 15 | 30 | 60 | 120;

export type CameraMotion = "none" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down" | "zoom-in" | "zoom-out" | "orbit-cw" | "orbit-ccw" | "dolly-in" | "dolly-out" | "crane-up" | "crane-down";

export type PhysicsPreset = "realistic" | "cinematic" | "cartoon" | "slow-motion" | "zero-gravity" | "underwater" | "heavy-gravity";

export type VideoStatus = "queued" | "processing" | "rendering" | "completed" | "failed";

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "21:9";

export type Resolution = "480p" | "720p" | "1080p" | "4k";

export interface PhysicsConfig {
  preset: PhysicsPreset;
  gravity: number;         // 0-20 m/s^2
  friction: number;        // 0-1
  bounciness: number;      // 0-1
  windSpeed: number;       // 0-100
  windDirection: number;   // 0-360 degrees
  fluidDensity: number;    // 0-2 (air=0.001, water=1)
  particleMass: number;    // 0.1-100
  collisionEnabled: boolean;
  softBodyEnabled: boolean;
  clothSimulation: boolean;
  hairSimulation: boolean;
}

export interface CameraConfig {
  motion: CameraMotion;
  speed: number;           // 0-100
  startAngle: number;      // 0-360
  endAngle: number;        // 0-360
  focalLength: number;     // 12-200mm
  depthOfField: number;    // 0-100 (blur amount)
  motionBlur: number;      // 0-100
  stabilization: boolean;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring";
  keyframes: CameraKeyframe[];
}

export interface CameraKeyframe {
  id: string;
  timestamp: number;       // 0-1 normalized
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  zoom: number;
}

export interface GenerationRequest {
  id: string;
  mode: GenerationMode;
  prompt: string;
  negativePrompt: string;
  duration: VideoLength;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  fps: 24 | 30 | 60;
  physics: PhysicsConfig;
  camera: CameraConfig;
  seed: number;
  guidanceScale: number;   // 1-20
  numInferenceSteps: number; // 10-100
  sourceImageUrl?: string;
  sourceVideoUrl?: string;
  audioUrl?: string;
  faceImageUrl?: string;
  referenceVideoUrl?: string;
  styleReference?: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  request: GenerationRequest;
  status: VideoStatus;
  progress: number;        // 0-100
  currentPhase: string;
  outputUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number; // seconds
  renderMetrics?: RenderMetrics;
}

export interface RenderMetrics {
  totalFrames: number;
  renderedFrames: number;
  physicsComputeTime: number;
  renderTime: number;
  gpuUtilization: number;
  peakMemoryUsage: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  clips: ProjectClip[];
  timeline: TimelineTrack[];
  createdAt: string;
  updatedAt: string;
  totalDuration: number;
  thumbnailUrl?: string;
}

export interface ProjectClip {
  id: string;
  jobId: string;
  name: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  startTime: number;
  endTime: number;
  order: number;
  transitions: ClipTransition;
}

export interface ClipTransition {
  type: "none" | "fade" | "dissolve" | "wipe-left" | "wipe-right" | "zoom" | "slide";
  duration: number; // seconds
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "text" | "effect";
  clips: string[]; // clip IDs
  muted: boolean;
  locked: boolean;
  visible: boolean;
}

export interface ComparisonPair {
  id: string;
  leftJobId: string;
  rightJobId: string;
  leftVideoUrl: string;
  rightVideoUrl: string;
  leftThumbnail: string;
  rightThumbnail: string;
  leftPrompt: string;
  rightPrompt: string;
  createdAt: string;
}

export interface DownloadItem {
  id: string;
  jobId: string;
  fileName: string;
  fileSize: number;
  format: "mp4" | "webm" | "gif" | "mov";
  resolution: Resolution;
  status: "pending" | "preparing" | "ready" | "downloading" | "completed" | "failed";
  downloadUrl?: string;
  progress: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "enterprise";
  creditsRemaining: number;
  totalCreditsUsed: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "generation_complete" | "generation_failed" | "download_ready" | "credits_low" | "system";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Default configurations
export const DEFAULT_PHYSICS: PhysicsConfig = {
  preset: "realistic",
  gravity: 9.81,
  friction: 0.5,
  bounciness: 0.3,
  windSpeed: 0,
  windDirection: 0,
  fluidDensity: 0.001,
  particleMass: 1,
  collisionEnabled: true,
  softBodyEnabled: false,
  clothSimulation: false,
  hairSimulation: false,
};

export const DEFAULT_CAMERA: CameraConfig = {
  motion: "none",
  speed: 50,
  startAngle: 0,
  endAngle: 0,
  focalLength: 50,
  depthOfField: 0,
  motionBlur: 0,
  stabilization: true,
  easing: "ease-in-out",
  keyframes: [],
};

export const PHYSICS_PRESETS: Record<PhysicsPreset, Partial<PhysicsConfig>> = {
  realistic: {
    gravity: 9.81,
    friction: 0.5,
    bounciness: 0.3,
    windSpeed: 0,
    fluidDensity: 0.001,
    collisionEnabled: true,
  },
  cinematic: {
    gravity: 9.81,
    friction: 0.4,
    bounciness: 0.2,
    windSpeed: 5,
    fluidDensity: 0.001,
    collisionEnabled: true,
  },
  cartoon: {
    gravity: 15,
    friction: 0.2,
    bounciness: 0.8,
    windSpeed: 0,
    fluidDensity: 0.001,
    collisionEnabled: true,
  },
  "slow-motion": {
    gravity: 2,
    friction: 0.8,
    bounciness: 0.1,
    windSpeed: 0,
    fluidDensity: 0.01,
    collisionEnabled: true,
  },
  "zero-gravity": {
    gravity: 0,
    friction: 0.01,
    bounciness: 0.9,
    windSpeed: 0,
    fluidDensity: 0,
    collisionEnabled: true,
  },
  underwater: {
    gravity: 2,
    friction: 0.9,
    bounciness: 0.05,
    windSpeed: 0,
    fluidDensity: 1,
    collisionEnabled: true,
  },
  "heavy-gravity": {
    gravity: 20,
    friction: 0.7,
    bounciness: 0.1,
    windSpeed: 0,
    fluidDensity: 0.001,
    collisionEnabled: true,
  },
};

export const CAMERA_MOTION_LABELS: Record<CameraMotion, string> = {
  none: "Static",
  "pan-left": "Pan Left",
  "pan-right": "Pan Right",
  "tilt-up": "Tilt Up",
  "tilt-down": "Tilt Down",
  "zoom-in": "Zoom In",
  "zoom-out": "Zoom Out",
  "orbit-cw": "Orbit Clockwise",
  "orbit-ccw": "Orbit Counter-CW",
  "dolly-in": "Dolly In",
  "dolly-out": "Dolly Out",
  "crane-up": "Crane Up",
  "crane-down": "Crane Down",
};

export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:3": { width: 1440, height: 1080 },
  "21:9": { width: 2560, height: 1080 },
};

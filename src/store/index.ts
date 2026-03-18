import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type {
  GenerationMode,
  GenerationJob,
  GenerationRequest,
  Project,
  ProjectClip,
  ComparisonPair,
  DownloadItem,
  Notification,
  PhysicsConfig,
  CameraConfig,
  VideoLength,
  AspectRatio,
  Resolution,
  VideoStatus,
  DEFAULT_PHYSICS,
  DEFAULT_CAMERA,
} from "@/types";

// Re-import defaults directly since we can't import values from type imports
const defaultPhysics: PhysicsConfig = {
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

const defaultCamera: CameraConfig = {
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

// ============================================================
// Generation Store
// ============================================================

interface GenerationState {
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
  guidanceScale: number;
  numInferenceSteps: number;
  sourceImageUrl: string;
  sourceVideoUrl: string;
  audioUrl: string;
  faceImageUrl: string;
  referenceVideoUrl: string;
  styleReference: string;

  setMode: (mode: GenerationMode) => void;
  setPrompt: (prompt: string) => void;
  setNegativePrompt: (prompt: string) => void;
  setDuration: (duration: VideoLength) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setResolution: (resolution: Resolution) => void;
  setFps: (fps: 24 | 30 | 60) => void;
  setPhysics: (physics: Partial<PhysicsConfig>) => void;
  setPhysicsPreset: (preset: PhysicsConfig["preset"]) => void;
  setCamera: (camera: Partial<CameraConfig>) => void;
  setSeed: (seed: number) => void;
  setGuidanceScale: (scale: number) => void;
  setInferenceSteps: (steps: number) => void;
  setSourceImageUrl: (url: string) => void;
  setSourceVideoUrl: (url: string) => void;
  setAudioUrl: (url: string) => void;
  setFaceImageUrl: (url: string) => void;
  setReferenceVideoUrl: (url: string) => void;
  setStyleReference: (ref: string) => void;
  resetToDefaults: () => void;
  buildRequest: () => GenerationRequest;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  mode: "text-to-video",
  prompt: "",
  negativePrompt: "",
  duration: 5,
  aspectRatio: "16:9",
  resolution: "1080p",
  fps: 30,
  physics: { ...defaultPhysics },
  camera: { ...defaultCamera },
  seed: -1,
  guidanceScale: 7.5,
  numInferenceSteps: 50,
  sourceImageUrl: "",
  sourceVideoUrl: "",
  audioUrl: "",
  faceImageUrl: "",
  referenceVideoUrl: "",
  styleReference: "",

  setMode: (mode) => set({ mode }),
  setPrompt: (prompt) => set({ prompt }),
  setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
  setDuration: (duration) => set({ duration }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setResolution: (resolution) => set({ resolution }),
  setFps: (fps) => set({ fps }),
  setPhysics: (physics) =>
    set((state) => ({ physics: { ...state.physics, ...physics } })),
  setPhysicsPreset: (preset) => {
    const presets: Record<string, Partial<PhysicsConfig>> = {
      realistic: { gravity: 9.81, friction: 0.5, bounciness: 0.3, windSpeed: 0, fluidDensity: 0.001 },
      cinematic: { gravity: 9.81, friction: 0.4, bounciness: 0.2, windSpeed: 5, fluidDensity: 0.001 },
      cartoon: { gravity: 15, friction: 0.2, bounciness: 0.8, windSpeed: 0, fluidDensity: 0.001 },
      "slow-motion": { gravity: 2, friction: 0.8, bounciness: 0.1, windSpeed: 0, fluidDensity: 0.01 },
      "zero-gravity": { gravity: 0, friction: 0.01, bounciness: 0.9, windSpeed: 0, fluidDensity: 0 },
      underwater: { gravity: 2, friction: 0.9, bounciness: 0.05, windSpeed: 0, fluidDensity: 1 },
      "heavy-gravity": { gravity: 20, friction: 0.7, bounciness: 0.1, windSpeed: 0, fluidDensity: 0.001 },
    };
    set((state) => ({
      physics: { ...state.physics, ...presets[preset], preset },
    }));
  },
  setCamera: (camera) =>
    set((state) => ({ camera: { ...state.camera, ...camera } })),
  setSeed: (seed) => set({ seed }),
  setGuidanceScale: (guidanceScale) => set({ guidanceScale }),
  setInferenceSteps: (numInferenceSteps) => set({ numInferenceSteps }),
  setSourceImageUrl: (sourceImageUrl) => set({ sourceImageUrl }),
  setSourceVideoUrl: (sourceVideoUrl) => set({ sourceVideoUrl }),
  setAudioUrl: (audioUrl) => set({ audioUrl }),
  setFaceImageUrl: (faceImageUrl) => set({ faceImageUrl }),
  setReferenceVideoUrl: (referenceVideoUrl) => set({ referenceVideoUrl }),
  setStyleReference: (styleReference) => set({ styleReference }),
  resetToDefaults: () =>
    set({
      prompt: "",
      negativePrompt: "",
      duration: 5,
      aspectRatio: "16:9",
      resolution: "1080p",
      fps: 30,
      physics: { ...defaultPhysics },
      camera: { ...defaultCamera },
      seed: -1,
      guidanceScale: 7.5,
      numInferenceSteps: 50,
      sourceImageUrl: "",
      sourceVideoUrl: "",
      audioUrl: "",
      faceImageUrl: "",
      referenceVideoUrl: "",
      styleReference: "",
    }),
  buildRequest: () => {
    const state = get();
    return {
      id: uuid(),
      mode: state.mode,
      prompt: state.prompt,
      negativePrompt: state.negativePrompt,
      duration: state.duration,
      aspectRatio: state.aspectRatio,
      resolution: state.resolution,
      fps: state.fps,
      physics: state.physics,
      camera: state.camera,
      seed: state.seed === -1 ? Math.floor(Math.random() * 2147483647) : state.seed,
      guidanceScale: state.guidanceScale,
      numInferenceSteps: state.numInferenceSteps,
      sourceImageUrl: state.sourceImageUrl || undefined,
      sourceVideoUrl: state.sourceVideoUrl || undefined,
      audioUrl: state.audioUrl || undefined,
      faceImageUrl: state.faceImageUrl || undefined,
      referenceVideoUrl: state.referenceVideoUrl || undefined,
      styleReference: state.styleReference || undefined,
    };
  },
}));

// ============================================================
// Jobs Store
// ============================================================

interface JobsState {
  jobs: GenerationJob[];
  activeJobId: string | null;
  addJob: (job: GenerationJob) => void;
  updateJob: (id: string, updates: Partial<GenerationJob>) => void;
  removeJob: (id: string) => void;
  setActiveJob: (id: string | null) => void;
  getJob: (id: string) => GenerationJob | undefined;
  getActiveJobs: () => GenerationJob[];
  getCompletedJobs: () => GenerationJob[];
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  activeJobId: null,

  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    })),
  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
      activeJobId: state.activeJobId === id ? null : state.activeJobId,
    })),
  setActiveJob: (id) => set({ activeJobId: id }),
  getJob: (id) => get().jobs.find((j) => j.id === id),
  getActiveJobs: () =>
    get().jobs.filter((j) => j.status === "queued" || j.status === "processing" || j.status === "rendering"),
  getCompletedJobs: () =>
    get().jobs.filter((j) => j.status === "completed"),
}));

// ============================================================
// Projects Store
// ============================================================

interface ProjectsState {
  projects: Project[];
  activeProjectId: string | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  getProject: (id: string) => Project | undefined;
  addClipToProject: (projectId: string, clip: ProjectClip) => void;
  removeClipFromProject: (projectId: string, clipId: string) => void;
  reorderClips: (projectId: string, clipIds: string[]) => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  activeProjectId: null,

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    })),
  setActiveProject: (id) => set({ activeProjectId: id }),
  getProject: (id) => get().projects.find((p) => p.id === id),
  addClipToProject: (projectId, clip) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const clips = [...p.clips, clip];
        const totalDuration = clips.reduce((sum, c) => sum + c.duration, 0);
        return { ...p, clips, totalDuration, updatedAt: new Date().toISOString() };
      }),
    })),
  removeClipFromProject: (projectId, clipId) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const clips = p.clips.filter((c) => c.id !== clipId);
        const totalDuration = clips.reduce((sum, c) => sum + c.duration, 0);
        return { ...p, clips, totalDuration, updatedAt: new Date().toISOString() };
      }),
    })),
  reorderClips: (projectId, clipIds) =>
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const clipMap = new Map(p.clips.map((c) => [c.id, c]));
        const reordered = clipIds
          .map((id, idx) => {
            const clip = clipMap.get(id);
            return clip ? { ...clip, order: idx } : null;
          })
          .filter(Boolean) as ProjectClip[];
        return { ...p, clips: reordered, updatedAt: new Date().toISOString() };
      }),
    })),
}));

// ============================================================
// Compare Store
// ============================================================

interface CompareState {
  pairs: ComparisonPair[];
  activePairId: string | null;
  addPair: (pair: ComparisonPair) => void;
  removePair: (id: string) => void;
  setActivePair: (id: string | null) => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  pairs: [],
  activePairId: null,
  addPair: (pair) => set((state) => ({ pairs: [pair, ...state.pairs] })),
  removePair: (id) =>
    set((state) => ({
      pairs: state.pairs.filter((p) => p.id !== id),
      activePairId: state.activePairId === id ? null : state.activePairId,
    })),
  setActivePair: (id) => set({ activePairId: id }),
}));

// ============================================================
// Downloads Store
// ============================================================

interface DownloadsState {
  downloads: DownloadItem[];
  addDownload: (item: DownloadItem) => void;
  updateDownload: (id: string, updates: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
  getActiveDownloads: () => DownloadItem[];
}

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloads: [],
  addDownload: (item) =>
    set((state) => ({ downloads: [item, ...state.downloads] })),
  updateDownload: (id, updates) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
  removeDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== id),
    })),
  getActiveDownloads: () =>
    get().downloads.filter(
      (d) =>
        d.status === "pending" ||
        d.status === "preparing" ||
        d.status === "downloading"
    ),
}));

// ============================================================
// Notifications Store
// ============================================================

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((state) => {
      const notif = state.notifications.find((n) => n.id === id);
      if (!notif || notif.read) return state;
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  removeNotification: (id) =>
    set((state) => {
      const notif = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notif && !notif.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// ============================================================
// UI Store
// ============================================================

interface UIState {
  sidebarOpen: boolean;
  previewPanelOpen: boolean;
  physicsDrawerOpen: boolean;
  cameraDrawerOpen: boolean;
  activeTab: string;
  toggleSidebar: () => void;
  togglePreviewPanel: () => void;
  togglePhysicsDrawer: () => void;
  toggleCameraDrawer: () => void;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  previewPanelOpen: true,
  physicsDrawerOpen: false,
  cameraDrawerOpen: false,
  activeTab: "generate",

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  togglePreviewPanel: () =>
    set((state) => ({ previewPanelOpen: !state.previewPanelOpen })),
  togglePhysicsDrawer: () =>
    set((state) => ({ physicsDrawerOpen: !state.physicsDrawerOpen })),
  toggleCameraDrawer: () =>
    set((state) => ({ cameraDrawerOpen: !state.cameraDrawerOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

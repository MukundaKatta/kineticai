// ============================================================
// KineticAI Physics Simulation Engine
// Handles physics-aware motion computation for video generation
// ============================================================

import type { PhysicsConfig, CameraConfig, CameraKeyframe } from "@/types";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface PhysicsState {
  position: Vec3;
  velocity: Vec3;
  acceleration: Vec3;
  angularVelocity: Vec3;
  mass: number;
  forces: Vec3[];
}

interface PhysicsFrame {
  timestamp: number;
  objects: PhysicsState[];
  cameraPosition: Vec3;
  cameraRotation: Vec3;
  cameraZoom: number;
}

// Vector math utilities
function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vec3Scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function vec3Length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function vec3Normalize(v: Vec3): Vec3 {
  const len = vec3Length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return vec3Scale(v, 1 / len);
}

function vec3Lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

// Easing functions
const EASING_FUNCTIONS: Record<string, (t: number) => number> = {
  linear: (t: number) => t,
  "ease-in": (t: number) => t * t * t,
  "ease-out": (t: number) => 1 - Math.pow(1 - t, 3),
  "ease-in-out": (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  spring: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// Compute gravitational force
function computeGravity(config: PhysicsConfig, mass: number): Vec3 {
  return { x: 0, y: -config.gravity * mass, z: 0 };
}

// Compute wind force
function computeWind(config: PhysicsConfig): Vec3 {
  const radians = (config.windDirection * Math.PI) / 180;
  return {
    x: Math.cos(radians) * config.windSpeed * 0.1,
    y: 0,
    z: Math.sin(radians) * config.windSpeed * 0.1,
  };
}

// Compute drag force (fluid resistance)
function computeDrag(config: PhysicsConfig, velocity: Vec3): Vec3 {
  const speed = vec3Length(velocity);
  if (speed === 0) return { x: 0, y: 0, z: 0 };
  const dragCoeff = 0.47; // sphere
  const area = 1; // unit area
  const dragMagnitude = 0.5 * config.fluidDensity * speed * speed * dragCoeff * area;
  const direction = vec3Normalize(velocity);
  return vec3Scale(direction, -dragMagnitude);
}

// Compute friction force
function computeFriction(config: PhysicsConfig, velocity: Vec3, normalForce: number): Vec3 {
  const speed = vec3Length(velocity);
  if (speed < 0.001) return { x: 0, y: 0, z: 0 };
  const direction = vec3Normalize(velocity);
  return vec3Scale(direction, -config.friction * normalForce);
}

// Euler integration step
function integrateStep(state: PhysicsState, dt: number, config: PhysicsConfig): PhysicsState {
  const gravity = computeGravity(config, state.mass);
  const wind = computeWind(config);
  const drag = computeDrag(config, state.velocity);
  const normalForce = Math.max(0, config.gravity * state.mass);
  const friction = computeFriction(config, state.velocity, normalForce);

  let totalForce: Vec3 = { x: 0, y: 0, z: 0 };
  totalForce = vec3Add(totalForce, gravity);
  totalForce = vec3Add(totalForce, wind);
  totalForce = vec3Add(totalForce, drag);
  totalForce = vec3Add(totalForce, friction);

  for (const force of state.forces) {
    totalForce = vec3Add(totalForce, force);
  }

  const acceleration = vec3Scale(totalForce, 1 / state.mass);
  const newVelocity = vec3Add(state.velocity, vec3Scale(acceleration, dt));
  const newPosition = vec3Add(state.position, vec3Scale(newVelocity, dt));

  // Ground collision
  let finalPosition = newPosition;
  let finalVelocity = newVelocity;

  if (config.collisionEnabled && newPosition.y < 0) {
    finalPosition = { ...newPosition, y: 0 };
    finalVelocity = {
      ...newVelocity,
      y: -newVelocity.y * config.bounciness,
    };
    // Apply friction on bounce
    finalVelocity.x *= 1 - config.friction * 0.5;
    finalVelocity.z *= 1 - config.friction * 0.5;
  }

  return {
    ...state,
    position: finalPosition,
    velocity: finalVelocity,
    acceleration,
    forces: [],
  };
}

// Camera motion computation
function computeCameraMotion(
  camera: CameraConfig,
  normalizedTime: number,
  duration: number
): { position: Vec3; rotation: Vec3; zoom: number } {
  const easingFn = EASING_FUNCTIONS[camera.easing] || EASING_FUNCTIONS.linear;
  const t = easingFn(normalizedTime);

  // If keyframes exist, interpolate between them
  if (camera.keyframes.length >= 2) {
    return interpolateKeyframes(camera.keyframes, t);
  }

  // Otherwise compute from motion preset
  const basePosition: Vec3 = { x: 0, y: 0, z: 5 };
  const baseRotation: Vec3 = { x: 0, y: 0, z: 0 };
  let zoom = camera.focalLength;

  const speedFactor = camera.speed / 50; // normalize around 50
  const angle = t * 360 * speedFactor;
  const displacement = t * 5 * speedFactor;

  let position = { ...basePosition };
  let rotation = { ...baseRotation };

  switch (camera.motion) {
    case "pan-left":
      position.x = -displacement;
      break;
    case "pan-right":
      position.x = displacement;
      break;
    case "tilt-up":
      rotation.x = -angle * 0.25;
      break;
    case "tilt-down":
      rotation.x = angle * 0.25;
      break;
    case "zoom-in":
      zoom = camera.focalLength + t * 100 * speedFactor;
      break;
    case "zoom-out":
      zoom = camera.focalLength - t * 30 * speedFactor;
      break;
    case "orbit-cw": {
      const rad = (angle * Math.PI) / 180;
      position.x = Math.sin(rad) * 5;
      position.z = Math.cos(rad) * 5;
      rotation.y = angle;
      break;
    }
    case "orbit-ccw": {
      const rad2 = (-angle * Math.PI) / 180;
      position.x = Math.sin(rad2) * 5;
      position.z = Math.cos(rad2) * 5;
      rotation.y = -angle;
      break;
    }
    case "dolly-in":
      position.z = 5 - displacement;
      break;
    case "dolly-out":
      position.z = 5 + displacement;
      break;
    case "crane-up":
      position.y = displacement;
      rotation.x = -angle * 0.1;
      break;
    case "crane-down":
      position.y = -displacement;
      rotation.x = angle * 0.1;
      break;
    case "none":
    default:
      break;
  }

  return { position, rotation, zoom };
}

function interpolateKeyframes(
  keyframes: CameraKeyframe[],
  t: number
): { position: Vec3; rotation: Vec3; zoom: number } {
  const sorted = [...keyframes].sort((a, b) => a.timestamp - b.timestamp);

  if (t <= sorted[0].timestamp) {
    return {
      position: sorted[0].position,
      rotation: sorted[0].rotation,
      zoom: sorted[0].zoom,
    };
  }

  if (t >= sorted[sorted.length - 1].timestamp) {
    const last = sorted[sorted.length - 1];
    return {
      position: last.position,
      rotation: last.rotation,
      zoom: last.zoom,
    };
  }

  // Find surrounding keyframes
  for (let i = 0; i < sorted.length - 1; i++) {
    if (t >= sorted[i].timestamp && t <= sorted[i + 1].timestamp) {
      const segmentT =
        (t - sorted[i].timestamp) / (sorted[i + 1].timestamp - sorted[i].timestamp);
      return {
        position: vec3Lerp(sorted[i].position, sorted[i + 1].position, segmentT),
        rotation: vec3Lerp(sorted[i].rotation, sorted[i + 1].rotation, segmentT),
        zoom: sorted[i].zoom + (sorted[i + 1].zoom - sorted[i].zoom) * segmentT,
      };
    }
  }

  return {
    position: sorted[0].position,
    rotation: sorted[0].rotation,
    zoom: sorted[0].zoom,
  };
}

// Main simulation function
export function simulatePhysics(
  physicsConfig: PhysicsConfig,
  cameraConfig: CameraConfig,
  duration: number,
  fps: number,
  objectCount: number = 1
): PhysicsFrame[] {
  const totalFrames = Math.ceil(duration * fps);
  const dt = 1 / fps;
  const frames: PhysicsFrame[] = [];

  // Initialize objects
  let objects: PhysicsState[] = Array.from({ length: objectCount }, (_, i) => ({
    position: { x: (i - objectCount / 2) * 2, y: 5, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    mass: physicsConfig.particleMass,
    forces: [],
  }));

  for (let frame = 0; frame <= totalFrames; frame++) {
    const normalizedTime = frame / totalFrames;
    const cameraState = computeCameraMotion(cameraConfig, normalizedTime, duration);

    frames.push({
      timestamp: frame * dt,
      objects: objects.map((o) => ({ ...o })),
      cameraPosition: cameraState.position,
      cameraRotation: cameraState.rotation,
      cameraZoom: cameraState.zoom,
    });

    // Advance physics
    objects = objects.map((obj) => integrateStep(obj, dt, physicsConfig));
  }

  return frames;
}

// Generate physics motion descriptors for prompt enrichment
export function generatePhysicsPromptModifiers(config: PhysicsConfig): string {
  const modifiers: string[] = [];

  if (config.gravity === 0) {
    modifiers.push("zero gravity, floating objects");
  } else if (config.gravity > 15) {
    modifiers.push("heavy gravity, weighty movement");
  } else if (config.gravity < 5) {
    modifiers.push("low gravity, slow graceful falls");
  }

  if (config.bounciness > 0.7) {
    modifiers.push("bouncy elastic collisions");
  }

  if (config.windSpeed > 30) {
    modifiers.push("strong wind effects, flowing particles");
  } else if (config.windSpeed > 10) {
    modifiers.push("gentle breeze, slight wind movement");
  }

  if (config.fluidDensity > 0.5) {
    modifiers.push("underwater movement, fluid dynamics");
  }

  if (config.clothSimulation) {
    modifiers.push("realistic cloth physics, fabric movement");
  }

  if (config.hairSimulation) {
    modifiers.push("realistic hair dynamics");
  }

  if (config.softBodyEnabled) {
    modifiers.push("soft body deformation");
  }

  if (config.friction > 0.8) {
    modifiers.push("high friction surfaces");
  } else if (config.friction < 0.1) {
    modifiers.push("slippery icy surfaces");
  }

  return modifiers.join(", ");
}

// Generate camera motion descriptors for prompt enrichment
export function generateCameraPromptModifiers(config: CameraConfig): string {
  const modifiers: string[] = [];

  if (config.motion !== "none") {
    const motionLabels: Record<string, string> = {
      "pan-left": "camera panning left",
      "pan-right": "camera panning right",
      "tilt-up": "camera tilting upward",
      "tilt-down": "camera tilting downward",
      "zoom-in": "smooth zoom in",
      "zoom-out": "smooth zoom out",
      "orbit-cw": "orbiting camera clockwise",
      "orbit-ccw": "orbiting camera counter-clockwise",
      "dolly-in": "camera dolly moving forward",
      "dolly-out": "camera dolly pulling back",
      "crane-up": "crane shot rising",
      "crane-down": "crane shot descending",
    };
    modifiers.push(motionLabels[config.motion] || config.motion);
  }

  if (config.depthOfField > 50) {
    modifiers.push("shallow depth of field, bokeh background");
  }

  if (config.motionBlur > 50) {
    modifiers.push("motion blur effect");
  }

  if (config.focalLength > 100) {
    modifiers.push("telephoto lens compression");
  } else if (config.focalLength < 24) {
    modifiers.push("wide angle lens distortion");
  }

  return modifiers.join(", ");
}

// Compute estimated render complexity
export function estimateRenderComplexity(
  physics: PhysicsConfig,
  camera: CameraConfig,
  duration: number,
  resolution: string
): { score: number; estimatedSeconds: number } {
  let score = 1;

  // Duration factor
  score *= duration / 5;

  // Resolution factor
  const resFactors: Record<string, number> = {
    "480p": 0.5,
    "720p": 1,
    "1080p": 2,
    "4k": 6,
  };
  score *= resFactors[resolution] || 1;

  // Physics complexity
  if (physics.clothSimulation) score *= 1.5;
  if (physics.hairSimulation) score *= 1.5;
  if (physics.softBodyEnabled) score *= 1.3;
  if (physics.collisionEnabled) score *= 1.2;
  if (physics.fluidDensity > 0.5) score *= 1.4;

  // Camera complexity
  if (camera.keyframes.length > 2) score *= 1.2;
  if (camera.depthOfField > 50) score *= 1.1;
  if (camera.motionBlur > 50) score *= 1.1;

  const estimatedSeconds = Math.ceil(score * 30); // base ~30s per unit

  return { score: Math.round(score * 100) / 100, estimatedSeconds };
}

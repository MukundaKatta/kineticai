"use client";

import { useState, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useGenerationStore, useJobsStore, useNotificationsStore } from "@/store";
import type { GenerationJob, VideoStatus } from "@/types";

export function useGeneration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buildRequest = useGenerationStore((s) => s.buildRequest);
  const addJob = useJobsStore((s) => s.addJob);
  const updateJob = useJobsStore((s) => s.updateJob);
  const setActiveJob = useJobsStore((s) => s.setActiveJob);
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const submitGeneration = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const request = buildRequest();
      const jobId = request.id;

      const job: GenerationJob = {
        id: jobId,
        userId: "demo-user",
        request,
        status: "queued",
        progress: 0,
        currentPhase: "Queued",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addJob(job);
      setActiveJob(jobId);

      // Submit to API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Generation request failed");
      }

      const data = await response.json();

      // Start polling for progress
      pollJobStatus(jobId);

      return jobId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addNotification({
        id: uuid(),
        userId: "demo-user",
        type: "generation_failed",
        title: "Generation Failed",
        message: errorMessage,
        read: false,
        createdAt: new Date().toISOString(),
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [buildRequest, addJob, setActiveJob, addNotification]);

  const pollJobStatus = useCallback(
    (jobId: string) => {
      const phases = [
        { status: "processing" as VideoStatus, phase: "Analyzing prompt", progress: 10 },
        { status: "processing" as VideoStatus, phase: "Computing physics simulation", progress: 25 },
        { status: "processing" as VideoStatus, phase: "Generating motion vectors", progress: 40 },
        { status: "rendering" as VideoStatus, phase: "Rendering frames", progress: 55 },
        { status: "rendering" as VideoStatus, phase: "Applying camera motion", progress: 70 },
        { status: "rendering" as VideoStatus, phase: "Post-processing", progress: 85 },
        { status: "rendering" as VideoStatus, phase: "Encoding video", progress: 95 },
        { status: "completed" as VideoStatus, phase: "Complete", progress: 100 },
      ];

      let phaseIndex = 0;

      const interval = setInterval(() => {
        if (phaseIndex >= phases.length) {
          clearInterval(interval);
          return;
        }

        const current = phases[phaseIndex];
        const updates: Partial<GenerationJob> = {
          status: current.status,
          currentPhase: current.phase,
          progress: current.progress,
          updatedAt: new Date().toISOString(),
        };

        if (current.status === "completed") {
          updates.completedAt = new Date().toISOString();
          updates.outputUrl = "/samples/demo-output.mp4";
          updates.thumbnailUrl = "/samples/demo-thumb.jpg";
          updates.previewUrl = "/samples/demo-preview.mp4";
          updates.renderMetrics = {
            totalFrames: 150,
            renderedFrames: 150,
            physicsComputeTime: 2.4,
            renderTime: 18.7,
            gpuUtilization: 94,
            peakMemoryUsage: 8.2,
          };

          addNotification({
            id: uuid(),
            userId: "demo-user",
            type: "generation_complete",
            title: "Video Ready",
            message: "Your video generation is complete and ready to view.",
            read: false,
            actionUrl: `/generate?job=${jobId}`,
            createdAt: new Date().toISOString(),
          });
        }

        updateJob(jobId, updates);
        phaseIndex++;
      }, 2000);

      return () => clearInterval(interval);
    },
    [updateJob, addNotification]
  );

  return {
    submitGeneration,
    isSubmitting,
  };
}

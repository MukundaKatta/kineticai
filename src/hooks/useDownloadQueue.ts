"use client";

import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useDownloadsStore, useNotificationsStore } from "@/store";
import type { DownloadItem, Resolution } from "@/types";
import { generateFileName } from "@/utils/format";

export function useDownloadQueue() {
  const { addDownload, updateDownload, downloads } = useDownloadsStore();
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const queueDownload = useCallback(
    (
      jobId: string,
      format: DownloadItem["format"] = "mp4",
      resolution: Resolution = "1080p"
    ) => {
      const downloadId = uuid();
      const fileName = generateFileName("kineticai", format);

      const item: DownloadItem = {
        id: downloadId,
        jobId,
        fileName,
        fileSize: 0,
        format,
        resolution,
        status: "pending",
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      addDownload(item);

      // Simulate download preparation and progress
      simulateDownload(downloadId);

      return downloadId;
    },
    [addDownload]
  );

  const simulateDownload = useCallback(
    (downloadId: string) => {
      // Phase 1: Preparing
      setTimeout(() => {
        updateDownload(downloadId, {
          status: "preparing",
          progress: 10,
        });
      }, 500);

      // Phase 2: Ready
      setTimeout(() => {
        updateDownload(downloadId, {
          status: "ready",
          progress: 20,
          fileSize: Math.floor(Math.random() * 50000000) + 10000000,
          downloadUrl: "#",
        });
      }, 2000);

      // Phase 3: Downloading with progress
      let progress = 20;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);

          updateDownload(downloadId, {
            status: "completed",
            progress: 100,
          });

          addNotification({
            id: uuid(),
            userId: "demo-user",
            type: "download_ready",
            title: "Download Complete",
            message: "Your video has been downloaded successfully.",
            read: false,
            createdAt: new Date().toISOString(),
          });
        } else {
          updateDownload(downloadId, {
            status: "downloading",
            progress: Math.min(progress, 99),
          });
        }
      }, 800);
    },
    [updateDownload, addNotification]
  );

  const cancelDownload = useCallback(
    (downloadId: string) => {
      updateDownload(downloadId, { status: "failed", progress: 0 });
    },
    [updateDownload]
  );

  const retryDownload = useCallback(
    (downloadId: string) => {
      updateDownload(downloadId, { status: "pending", progress: 0 });
      simulateDownload(downloadId);
    },
    [updateDownload, simulateDownload]
  );

  return {
    downloads,
    queueDownload,
    cancelDownload,
    retryDownload,
  };
}

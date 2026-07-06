import fs from 'fs';
import path from 'path';
import { BrowserContextOptions, Page, TestInfo } from '@playwright/test';
import { PROJECT_ROOT } from '@core/constants/paths';

const VIDEO_OUTPUT_DIR = path.join(PROJECT_ROOT, 'artifacts', 'videos');

export const RECORDED_VIDEO_SIZE = { width: 1920, height: 1080 };

export function withRecordedVideo(
  testInfo: TestInfo,
  options: BrowserContextOptions,
  size = RECORDED_VIDEO_SIZE,
): BrowserContextOptions {
  return {
    ...options,
    recordVideo: {
      dir: testInfo.outputDir,
      size,
    },
  };
}

export async function attachPageVideo(
  page: Page,
  testInfo: TestInfo,
  name = 'video',
): Promise<string | null> {
  const video = page.video();
  if (!video) {
    return null;
  }

  const videoPath = await video.path();
  if (!videoPath || !fs.existsSync(videoPath)) {
    return null;
  }

  await testInfo.attach(name, { path: videoPath, contentType: 'video/webm' });
  return videoPath;
}

export async function closeContextAndAttachVideo(
  context: import('@playwright/test').BrowserContext,
  page: Page,
  testInfo: TestInfo,
  name = 'video',
): Promise<string | null> {
  await context.close();
  return attachPageVideo(page, testInfo, name);
}

export async function archiveTestVideo(testInfo: TestInfo): Promise<string | null> {
  const videoAttachment =
    testInfo.attachments.find((attachment) => attachment.name === 'video') ??
    testInfo.attachments.find(
      (attachment) =>
        attachment.contentType === 'video/webm' || attachment.name.startsWith('video-'),
    );

  if (!videoAttachment?.path || !fs.existsSync(videoAttachment.path)) {
    return null;
  }

  fs.mkdirSync(VIDEO_OUTPUT_DIR, { recursive: true });

  const safeTitle = testInfo.title.replace(/[^\w.-]+/g, '_').slice(0, 80);
  const archivedPath = path.join(VIDEO_OUTPUT_DIR, `${safeTitle}.webm`);
  const latestPath = path.join(VIDEO_OUTPUT_DIR, 'latest.webm');

  fs.copyFileSync(videoAttachment.path, archivedPath);
  fs.copyFileSync(videoAttachment.path, latestPath);

  testInfo.attachments.push({
    name: 'archived-video',
    path: archivedPath,
    contentType: 'video/webm',
  });

  return archivedPath;
}

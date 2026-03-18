import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export type R2Folder = "uploads" | "outputs" | "thumbnails" | "previews" | "audio" | "exports";

function buildKey(folder: R2Folder, userId: string, fileName: string): string {
  return `${folder}/${userId}/${fileName}`;
}

export async function uploadToR2(
  folder: R2Folder,
  userId: string,
  fileName: string,
  body: Buffer | ReadableStream | Blob,
  contentType: string
): Promise<string> {
  const key = buildKey(folder, userId, fileName);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body as Buffer,
      ContentType: contentType,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

export async function getPresignedUploadUrl(
  folder: R2Folder,
  userId: string,
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ url: string; key: string }> {
  const key = buildKey(folder, userId, fileName);

  const url = await getSignedUrl(
    r2Client,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn }
  );

  return { url, key };
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
    { expiresIn }
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export function extractKeyFromUrl(url: string): string {
  return url.replace(`${PUBLIC_URL}/`, "");
}

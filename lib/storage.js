import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

// Vercel Blob is only used for deployments on Vercel. Locally, files always
// go to public/uploads, even if a BLOB_READ_WRITE_TOKEN happens to be set in
// .env (e.g. copied from a deployed environment for reference).
const useVercelBlob = Boolean(process.env.VERCEL);

export class StorageNotConfiguredError extends Error {}

export async function saveUploadedFile(file, filename) {
  if (useVercelBlob) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new StorageNotConfiguredError("Image storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel.");
    }
    const blob = await put(`uploads/${filename}`, file, { access: "public" });
    return blob.url;
  }

  await mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

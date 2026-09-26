
import "server-only";
import { cloudinary } from "./client";

interface UploadOptions {
  folder: string;
  transformation?: Record<string, unknown>[];
}

export function uploadImage(
  buffer: Buffer,
  options: UploadOptions
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        transformation: options.transformation,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
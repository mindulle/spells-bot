// Cloudinary Types
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

export interface ImageProcessOptions {
  blur?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
}

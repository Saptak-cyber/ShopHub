import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder path (e.g., 'ecommerce/products')
 * @returns Upload result with secure URL
 */
export async function uploadToCloudinary(
  file: string,
  folder: string = 'ecommerce'
): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of file buffers or base64 strings
 * @param folder - Cloudinary folder path
 * @returns Array of upload results
 */
export async function uploadMultipleToCloudinary(
  files: string[],
  folder: string = 'ecommerce'
): Promise<CloudinaryUploadResult[]> {
  try {
    const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Failed to upload images to Cloudinary');
  }
}

export default cloudinary;

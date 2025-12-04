import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadToCloudinary(imageData: string, folder: string = "dwelas"): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imageData,
      { folder },
      (error: any, result: any) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
  });
}

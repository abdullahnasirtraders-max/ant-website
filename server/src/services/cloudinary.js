import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfigured, env } from '../config/env.js';

if (cloudinaryConfigured) {
  cloudinary.config({ cloud_name: env.cloudinary.cloudName, api_key: env.cloudinary.apiKey, api_secret: env.cloudinary.apiSecret, secure: true });
}

export const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'ant/products', resource_type: 'image', transformation: [{ width: 2000, crop: 'limit' }] }, (err, r) =>
        err ? reject(err) : resolve({ url: r.secure_url, publicId: r.public_id }))
      .end(buffer);
  });

export const deleteImage = async (publicId) => {
  if (!cloudinaryConfigured || !publicId) return;
  try { await cloudinary.uploader.destroy(publicId); } catch (e) { console.warn('[cloudinary] delete failed', e.message); }
};

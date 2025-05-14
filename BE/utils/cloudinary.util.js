const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image buffer directly to Cloudinary
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} folder - The folder to upload to in Cloudinary
 * @returns {Promise<Object>} Cloudinary upload result with secure_url and public_id
 */
exports.uploadImage = async (imageBuffer, folder = "renterin") => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(imageBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<Object>} Cloudinary deletion result
 */
exports.deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};
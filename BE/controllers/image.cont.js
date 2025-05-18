const imageRepository = require('../repositories/img.repo');
const cloudinary = require('../utils/cloudinary.util');

const imageController = {
    async upload(req, res) {
        try {
            console.log("Incoming fields:");
console.log("file:", req.file);
console.log("body:", req.body);

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image file provided'
                });
            }

            const result = await cloudinary.uploadImage(
                req.file.buffer,
                `renterin/properties/${req.body.property_id || 'general'}`
            );

            const newImage = await imageRepository.create({
                property_id: req.body.property_id,
                url: result.secure_url,
                public_id: result.public_id,
                description: req.body.description,
                is_thumbnail: req.body.is_thumbnail === 'true'
            });

            res.status(201).json({
                success: true,
                data: newImage
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload image',
                error: error.message
            });
        }
    },

    async uploadMultiple(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No image files provided'
                });
            }

            const uploadedImages = [];
            const failedUploads = [];
            const folder = `renterin/properties/${req.body.property_id || 'general'}`;

            for (const file of req.files) {
                try {
                    const result = await cloudinary.uploadImage(file.buffer, folder);

                    const newImage = await imageRepository.create({
                        property_id: req.body.property_id,
                        url: result.secure_url,
                        public_id: result.public_id,
                        description: req.body.description,
                        is_thumbnail: req.body.is_thumbnail === 'true' && uploadedImages.length === 0 // Only set first image as thumbnail if requested
                    });

                    uploadedImages.push(newImage);
                } catch (error) {
                    failedUploads.push({
                        filename: file.originalname,
                        error: error.message
                    });
                }
            }

            res.status(201).json({
                success: true,
                data: {
                    uploaded: uploadedImages,
                    failed: failedUploads,
                    total: req.files.length,
                    successful: uploadedImages.length
                }
            });
        } catch (error) {
            console.error('Error uploading multiple images:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process images',
                error: error.message
            });
        }
    },

    async getAll(req, res) {
        try {
            const images = await imageRepository.findAll();
            res.status(200).json({
                success: true,
                count: images.length,
                data: images
            });
        } catch (error) {
            console.error('Error getting images:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get images',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const image = await imageRepository.findById(req.params.id);

            if (!image) {
                return res.status(404).json({
                    success: false,
                    message: 'Image not found'
                });
            }

            res.status(200).json({
                success: true,
                data: image
            });
        } catch (error) {
            console.error('Error getting image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get image',
                error: error.message
            });
        }
    },

    async getByPropertyId(req, res) {
        try {
            const images = await imageRepository.findByPropertyId(req.params.propertyId);

            res.status(200).json({
                success: true,
                count: images.length,
                data: images
            });
        } catch (error) {
            console.error('Error getting property images:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get property images',
                error: error.message
            });
        }
    },

    async getThumbnailByPropertyId(req, res) {
        try {
            const thumbnail = await imageRepository.findThumbnailByPropertyId(req.params.propertyId);

            if (!thumbnail) {
                return res.status(404).json({
                    success: false,
                    message: 'No thumbnail found for this property'
                });
            }

            res.status(200).json({
                success: true,
                data: thumbnail
            });
        } catch (error) {
            console.error('Error getting property thumbnail:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get property thumbnail',
                error: error.message
            });
        }
    },

    async setAsThumbnail(req, res) {
        try {
            const thumbnail = await imageRepository.setAsThumbnail(req.params.id);

            if (!thumbnail) {
                return res.status(404).json({
                    success: false,
                    message: 'Image not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Image set as thumbnail successfully',
                data: thumbnail
            });
        } catch (error) {
            console.error('Error setting thumbnail:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to set thumbnail',
                error: error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const deletedImage = await imageRepository.delete(req.params.id);

            if (!deletedImage) {
                return res.status(404).json({
                    success: false,
                    message: 'Image not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Image deleted successfully',
                data: deletedImage
            });
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete image',
                error: error.message
            });
        }
    }
};

module.exports = imageController;
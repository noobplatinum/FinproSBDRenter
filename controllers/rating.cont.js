const ratingRepository = require('../repositories/rating.repo');

const ratingController = {
  async create(req, res) {
    try {
      const newRating = await ratingRepository.create(req.body);
      res.status(201).json({
        success: true,
        data: newRating
      });
    } catch (error) {
      console.error('Error creating rating:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create rating',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const ratings = await ratingRepository.findAll();
      res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } catch (error) {
      console.error('Error getting ratings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ratings',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const rating = await ratingRepository.findById(req.params.id);
      
      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      res.status(200).json({
        success: true,
        data: rating
      });
    } catch (error) {
      console.error('Error getting rating:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rating',
        error: error.message
      });
    }
  },

  async getByUserId(req, res) {
    try {
      const ratings = await ratingRepository.findByUserId(req.params.userId);
      
      res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } catch (error) {
      console.error('Error getting user ratings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user ratings',
        error: error.message
      });
    }
  },

  async getByPropertyId(req, res) {
    try {
      const ratings = await ratingRepository.findByPropertyId(req.params.propertyId);
      
      res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } catch (error) {
      console.error('Error getting property ratings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get property ratings',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const updatedRating = await ratingRepository.update(req.params.id, req.body);
      
      if (!updatedRating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      res.status(200).json({
        success: true,
        data: updatedRating
      });
    } catch (error) {
      console.error('Error updating rating:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update rating',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const deletedRating = await ratingRepository.delete(req.params.id);
      
      if (!deletedRating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Rating deleted successfully',
        data: deletedRating
      });
    } catch (error) {
      console.error('Error deleting rating:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete rating',
        error: error.message
      });
    }
  }
};

module.exports = ratingController;
const facilitiesRepository = require('../repositories/facility.repo');

const facilitiesController = {
  async create(req, res) {
    try {
      const newFacility = await facilitiesRepository.create(req.body);
      res.status(201).json({
        success: true,
        data: newFacility
      });
    } catch (error) {
      console.error('Error creating facility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create facility',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const facilities = await facilitiesRepository.findAll();
      res.status(200).json({
        success: true,
        count: facilities.length,
        data: facilities
      });
    } catch (error) {
      console.error('Error getting facilities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get facilities',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const facility = await facilitiesRepository.findById(req.params.id);
      
      if (!facility) {
        return res.status(404).json({
          success: false,
          message: 'Facility not found'
        });
      }

      res.status(200).json({
        success: true,
        data: facility
      });
    } catch (error) {
      console.error('Error getting facility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get facility',
        error: error.message
      });
    }
  },

  async getByPropertyId(req, res) {
    try {
      const facilities = await facilitiesRepository.findByPropertyId(req.params.propertyId);
      
      res.status(200).json({
        success: true,
        count: facilities.length,
        data: facilities
      });
    } catch (error) {
      console.error('Error getting property facilities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get property facilities',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const updatedFacility = await facilitiesRepository.update(req.params.id, req.body);
      
      if (!updatedFacility) {
        return res.status(404).json({
          success: false,
          message: 'Facility not found'
        });
      }

      res.status(200).json({
        success: true,
        data: updatedFacility
      });
    } catch (error) {
      console.error('Error updating facility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update facility',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const deletedFacility = await facilitiesRepository.delete(req.params.id);
      
      if (!deletedFacility) {
        return res.status(404).json({
          success: false,
          message: 'Facility not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Facility deleted successfully',
        data: deletedFacility
      });
    } catch (error) {
      console.error('Error deleting facility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete facility',
        error: error.message
      });
    }
  }
};

module.exports = facilitiesController;
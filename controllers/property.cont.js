const propertyRepository = require('../repositories/property.repo');

const propertyController = {
  async create(req, res) {
    try {
      const newProperty = await propertyRepository.create(req.body);
      res.status(201).json({
        success: true,
        data: newProperty
      });
    } catch (error) {
      console.error('Error creating property:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create property',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const properties = await propertyRepository.findAll();
      res.status(200).json({
        success: true,
        count: properties.length,
        data: properties
      });
    } catch (error) {
      console.error('Error getting properties:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get properties',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const property = await propertyRepository.findById(req.params.id);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Error getting property:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get property',
        error: error.message
      });
    }
  },

  async getByOwnerId(req, res) {
    try {
      const properties = await propertyRepository.findByOwnerId(req.params.ownerId);
      
      res.status(200).json({
        success: true,
        count: properties.length,
        data: properties
      });
    } catch (error) {
      console.error('Error getting owner properties:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get owner properties',
        error: error.message
      });
    }
  },

  async getAvailable(req, res) {
    try {
      const properties = await propertyRepository.findAvailable();
      
      res.status(200).json({
        success: true,
        count: properties.length,
        data: properties
      });
    } catch (error) {
      console.error('Error getting available properties:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available properties',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const updatedProperty = await propertyRepository.update(req.params.id, req.body);
      
      if (!updatedProperty) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      res.status(200).json({
        success: true,
        data: updatedProperty
      });
    } catch (error) {
      console.error('Error updating property:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update property',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const deletedProperty = await propertyRepository.delete(req.params.id);
      
      if (!deletedProperty) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Property deleted successfully',
        data: deletedProperty
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete property',
        error: error.message
      });
    }
  }
};

module.exports = propertyController;
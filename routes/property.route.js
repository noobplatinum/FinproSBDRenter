const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.cont');

router.get('/', propertyController.getAll);

router.get('/available', propertyController.getAvailable);

router.get('/owner/:ownerId', propertyController.getByOwnerId);

router.get('/:id', propertyController.getById);

router.post('/', propertyController.create);

router.put('/:id', propertyController.update);

router.delete('/:id', propertyController.delete);

module.exports = router;
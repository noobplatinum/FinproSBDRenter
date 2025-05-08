const express = require('express');
const router = express.Router();
const facilitiesController = require('../controllers/facility.cont');

router.get('/', facilitiesController.getAll);

router.get('/property/:propertyId', facilitiesController.getByPropertyId);

router.get('/:id', facilitiesController.getById);

router.post('/', facilitiesController.create);

router.put('/:id', facilitiesController.update);

router.delete('/:id', facilitiesController.delete);

module.exports = router;
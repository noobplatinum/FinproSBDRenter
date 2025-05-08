const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.cont');

router.get('/', ratingController.getAll);

router.get('/user/:userId', ratingController.getByUserId);

router.get('/property/:propertyId', ratingController.getByPropertyId);

router.get('/:id', ratingController.getById);

router.post('/', ratingController.create);

router.put('/:id', ratingController.update);

router.delete('/:id', ratingController.delete);

module.exports = router;
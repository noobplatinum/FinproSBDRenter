const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.cont');

router.get('/', transactionController.getAll);

router.get('/status/:status', transactionController.getByStatus);

router.get('/user/:userId', transactionController.getByUserId);

router.get('/property/:propertyId', transactionController.getByPropertyId);

router.get('/:id', transactionController.getById);

router.post('/', transactionController.create);

router.put('/:id', transactionController.update);

router.delete('/:id', transactionController.delete);

module.exports = router;
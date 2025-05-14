const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.cont');

router.post('/', accountController.create);

router.post('/login', accountController.login);

router.get('/', accountController.getAll);

router.get('/:id', accountController.getById);

router.put('/:id', accountController.update);

router.delete('/:id', accountController.delete);

module.exports = router;
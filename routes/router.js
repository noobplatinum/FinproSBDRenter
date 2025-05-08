const express = require('express');
const router = express.Router();

const accountRoutes = require('./account.route');
const propertyRoutes = require('./property.route');
const facilitiesRoutes = require('./facility.route');
const transactionRoutes = require('./transaction.route');
const ratingRoutes = require('./rating.route');
const imageRoutes = require('./image.route');

router.use('/api/accounts', accountRoutes);
router.use('/api/properties', propertyRoutes);
router.use('/api/facilities', facilitiesRoutes);
router.use('/api/transactions', transactionRoutes);
router.use('/api/ratings', ratingRoutes);
router.use('/api/images', imageRoutes);

router.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RenterIn API On',
    time: new Date()
  });
});

module.exports = router;
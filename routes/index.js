const express = require('express');
const healthCheckRoutes = require('./healthcheckRoutes');
const authRoutes = require('./authRoutes');
const testRoutes = require('./testRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use(healthCheckRoutes);
router.use(authRoutes);
router.use(testRoutes);
router.use(userRoutes);

module.exports = router;
const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const routeRequest = require('../middleware/router');

router.post('/', rateLimiter, routeRequest, (req, res) => {
  const { income, deductions } = req.body;

  if (income === undefined || deductions === undefined) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'income and deductions are required.',
    });
  }

  const taxableIncome = Math.max(0, income - deductions);
  let taxOwed = 0;

  if (taxableIncome <= 10000) {
    taxOwed = taxableIncome * 0.10;
  } else if (taxableIncome <= 40000) {
    taxOwed = 1000 + (taxableIncome - 10000) * 0.12;
  } else if (taxableIncome <= 85000) {
    taxOwed = 4600 + (taxableIncome - 40000) * 0.22;
  } else {
    taxOwed = 14500 + (taxableIncome - 85000) * 0.24;
  }

  return res.status(200).json({
    userId: req.userId,
    nodeId: req.nodeId,
    income,
    deductions,
    taxableIncome,
    taxOwed: Math.round(taxOwed * 100) / 100,
    latencyMs: req.nodeResult.latency,
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { nodePool } = require('../core/NodePool');

router.post('/season', (req, res) => {
  const { taxSeason } = req.body;

  if (typeof taxSeason !== 'boolean') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'taxSeason must be a boolean.',
    });
  }

  const count = taxSeason
    ? parseInt(process.env.TAX_SEASON_NODE_COUNT) || 8
    : parseInt(process.env.NORMAL_NODE_COUNT) || 3;

  nodePool.scale(count);

  return res.status(200).json({
    message: `Scaled to ${count} nodes`,
    taxSeason,
    nodes: count,
  });
});

router.post('/inject-error', (req, res) => {
  const { nodeId, errorRate } = req.body;

  if (!nodeId || errorRate === undefined) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'nodeId and errorRate are required.',
    });
  }

  if (errorRate < 0 || errorRate > 1) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'errorRate must be between 0 and 1.',
    });
  }

  nodePool.setErrorRate(nodeId, errorRate);

  return res.status(200).json({
    ok: true,
    nodeId,
    errorRate,
  });
});

router.post('/reset', (req, res) => {
  nodePool.nodes.forEach(node => {
    node.cb.reset();
    node.errorRate = 0;
  });

  return res.status(200).json({
    ok: true,
    message: 'All circuit breakers reset.',
  });
});

module.exports = router;
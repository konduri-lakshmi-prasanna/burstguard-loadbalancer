const { nodePool } = require('../core/NodePool');

async function routeRequest(req, res, next) {
  const node = nodePool.getNextNode();

  if (!node) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'No backend nodes available.',
    });
  }

  try {
    const result = await node.cb.call(async () => {
      const { simulateRequest } = require('../simulation/nodeSimulator');
      return await simulateRequest(node);
    });

    node.requestCount++;
    node.totalLatency += result.latency;

    req.nodeResult = result;
    req.nodeId = node.id;
    next();
  } catch (err) {
    node.requestCount++;
    node.errorCount++;

    if (err.message === 'Circuit breaker is OPEN') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `Node ${node.id} circuit breaker is OPEN.`,
        nodeId: node.id,
      });
    }

    return res.status(502).json({
      error: 'Bad Gateway',
      message: `Node ${node.id} returned an error.`,
      nodeId: node.id,
    });
  }
}

module.exports = routeRequest;
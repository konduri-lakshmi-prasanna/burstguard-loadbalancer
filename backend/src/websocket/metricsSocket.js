const { WebSocketServer } = require('ws');
const { nodePool } = require('../core/NodePool');

let metricsStore = {
  rps: 0,
  rateLimited: 0,
  taxSeason: false,
};

function startMetricsSocket(server) {
  const wss = new WebSocketServer({ server });

  const interval = setInterval(() => {
    const payload = JSON.stringify({
      timestamp: Date.now(),
      rps: metricsStore.rps,
      rateLimited: metricsStore.rateLimited,
      taxSeason: metricsStore.taxSeason,
      totalNodes: nodePool.nodes.length,
      nodes: nodePool.getAllStats(),
    });

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });
  }, parseInt(process.env.METRICS_BROADCAST_INTERVAL_MS) || 500);

  wss.on('close', () => clearInterval(interval));

  return { wss, metricsStore };
}

module.exports = { startMetricsSocket, metricsStore };
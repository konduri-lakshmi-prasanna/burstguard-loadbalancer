require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { NodePool } = require('./core/NodePool');
const { startMetricsSocket, metricsStore } = require('./websocket/metricsSocket');
const { startTrafficEngine } = require('./simulation/trafficEngine');
const calculateRoute = require('./routes/calculate');
const adminRoute = require('./routes/admin');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// make nodePool globally available
const { nodePool } = require('./core/NodePool');

app.use('/api/calculate', calculateRoute);
app.use('/api/admin', adminRoute);

app.get('/api/metrics', (req, res) => {
  res.json({
    timestamp: Date.now(),
    rps: metricsStore.rps,
    rateLimited: metricsStore.rateLimited,
    taxSeason: metricsStore.taxSeason,
    totalNodes: nodePool.nodes.length,
    nodes: nodePool.getAllStats(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

startMetricsSocket(server);
startTrafficEngine(metricsStore);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Gatekeeper backend running on port ${PORT}`);
});
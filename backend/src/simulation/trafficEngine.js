const { nodePool } = require('../core/NodePool');

let interval = null;
let requestCount = 0;
let rateLimitedCount = 0;

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function getCurrentRPS() {
  const hour = new Date().getHours();
  const x = (hour - 14) / 3;
  return Math.floor(sigmoid(x) * 200 + 10);
}

function startTrafficEngine(metricsStore) {
  if (interval) return;

  interval = setInterval(() => {
    const rps = getCurrentRPS();
    metricsStore.rps = rps;
    metricsStore.rateLimited = rateLimitedCount;
    rateLimitedCount = 0;
  }, 1000);
}

function stopTrafficEngine() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

function incrementRateLimited() {
  rateLimitedCount++;
}

module.exports = { startTrafficEngine, stopTrafficEngine, incrementRateLimited };
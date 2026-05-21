const CircuitBreaker = require('./CircuitBreaker');

class BackendNode {
  constructor(id) {
    this.id = id;
    this.cb = new CircuitBreaker(
      parseInt(process.env.CB_FAILURE_THRESHOLD) || 5,
      parseInt(process.env.CB_RECOVERY_TIMEOUT_MS) || 30000
    );
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalLatency = 0;
    this.errorRate = 0;
  }

  getStats() {
    return {
      id: this.id,
      circuitState: this.cb.state,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0
        ? parseFloat((this.errorCount / this.requestCount).toFixed(3))
        : 0,
      avgLatencyMs: this.requestCount > 0
        ? Math.round(this.totalLatency / this.requestCount)
        : 0,
    };
  }
}

class NodePool {
  constructor() {
    this.nodes = [];
    this.roundRobinIndex = 0;
    this._buildNodes(parseInt(process.env.NORMAL_NODE_COUNT) || 3);
  }

  _buildNodes(count) {
    this.nodes = Array.from(
      { length: count },
      (_, i) => new BackendNode(`node-${i + 1}`)
    );
  }

  scale(count) {
    const current = this.nodes.length;
    if (count > current) {
      for (let i = current + 1; i <= count; i++) {
        this.nodes.push(new BackendNode(`node-${i}`));
      }
    } else {
      this.nodes = this.nodes.slice(0, count);
    }
    this.roundRobinIndex = 0;
  }

  getNextNode() {
    if (this.nodes.length === 0) return null;
    const node = this.nodes[this.roundRobinIndex % this.nodes.length];
    this.roundRobinIndex++;
    return node;
  }

  getAllStats() {
    return this.nodes.map(n => n.getStats());
  }

  setErrorRate(nodeId, rate) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) node.errorRate = rate;
  }
}


const nodePool = new NodePool();
module.exports = { NodePool, BackendNode, nodePool };
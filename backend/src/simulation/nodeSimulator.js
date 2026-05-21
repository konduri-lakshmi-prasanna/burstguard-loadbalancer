async function simulateRequest(node) {
  const latency = Math.floor(Math.random() * 180) + 20;
  await new Promise(resolve => setTimeout(resolve, latency));

  if (Math.random() < node.errorRate) {
    throw new Error(`Node ${node.id} simulated error`);
  }

  return { latency };
}

module.exports = { simulateRequest };
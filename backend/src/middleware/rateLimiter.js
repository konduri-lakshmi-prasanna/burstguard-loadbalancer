const TokenBucket = require('../core/TokenBucket');

const buckets = new Map();

const CAPACITY = parseInt(process.env.TB_CAPACITY) || 10;
const REFILL_RATE = parseInt(process.env.TB_REFILL_RATE) || 2;
const REFILL_INTERVAL = parseInt(process.env.TB_REFILL_INTERVAL_MS) || 500;

function getBucket(userId) {
  if (!buckets.has(userId)) {
    buckets.set(userId, new TokenBucket(CAPACITY, REFILL_RATE, REFILL_INTERVAL));
  }
  return buckets.get(userId);
}

function rateLimiter(req, res, next) {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const bucket = getBucket(userId);

  if (!bucket.consume()) {
    const status = bucket.getStatus();
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please slow down.',
      tokens: status.tokens,
      capacity: status.capacity,
    });
  }

  req.userId = userId;
  next();
}

module.exports = rateLimiter;
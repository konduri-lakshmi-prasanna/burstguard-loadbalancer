class TokenBucket {
  constructor(capacity, refillRate, refillInterval) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.refillInterval = refillInterval;
    this.lastRefill = Date.now();
  }

  consume(cost = 1) {
    this._refill();
    if (this.tokens < cost) return false;
    this.tokens -= cost;
    return true;
  }

  _refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const toAdd = (elapsed / this.refillInterval) * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + toAdd);
    this.lastRefill = now;
  }

  getStatus() {
    this._refill();
    return { tokens: Math.floor(this.tokens), capacity: this.capacity };
  }
}

module.exports = TokenBucket;